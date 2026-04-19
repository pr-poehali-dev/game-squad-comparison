"""
Симуляция сражения между отрядами с AI-аналитикой.
POST / — принимает список отрядов (2-4) с характеристиками, трактатами и умениями,
проводит пошаговую симуляцию и запрашивает у GPT детальный анализ.
"""
import json
import os
import urllib.request
import urllib.error

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def resp(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


# ── Движок симуляции ────────────────────────────────────────────────────────

def calc_damage(attacker: dict, defender: dict) -> float:
    """
    Урон = (base_dmg - defense + penetration * 0.5) * morale_factor * troops_factor
    Минимум 1 урон за удар.
    """
    s_a = attacker['stats']
    s_d = defender['stats']

    # Суммарный урон атакующего по всем типам
    raw_dmg = (
        s_a.get('piercingDamage', 0) +
        s_a.get('slashingDamage', 0) +
        s_a.get('bluntDamage', 0)
    )

    # Суммарная защита защищающегося
    raw_def = (
        s_d.get('piercingDefense', 0) +
        s_d.get('slashingDefense', 0) +
        s_d.get('bluntDefense', 0)
    )

    # Пробивание снижает защиту
    penetration = (
        s_a.get('piercingPenetration', 0) +
        s_a.get('slashingPenetration', 0) +
        s_a.get('bluntPenetration', 0)
    )
    effective_def = max(0, raw_def - penetration * 0.5)

    # Блок снижает ещё
    block = s_d.get('block', 0)
    block_factor = max(0.1, 1.0 - block / 200.0)

    # Лидерство — боевой дух
    morale_a = max(0.5, s_a.get('morale', 50) / 100.0)
    morale_d = max(0.5, s_d.get('morale', 50) / 100.0)

    # Численность отряда влияет на урон
    troops_a = max(1, s_a.get('troops', 100))
    base_dmg = max(1.0, raw_dmg - effective_def) * block_factor
    dmg_per_troop = base_dmg / 100.0
    total_dmg = dmg_per_troop * troops_a * morale_a / morale_d

    return max(1.0, total_dmg)


def simulate_battle(units: list) -> dict:
    """
    Пошаговая симуляция. Каждый раунд все отряды атакуют ближайшего соперника.
    Отряд выбывает когда HP <= 0. Побеждает последний оставшийся (или коалиция).
    """
    # Инициализируем HP = health * troops / 100
    fighters = []
    for i, u in enumerate(units):
        s = u['stats']
        hp = (s.get('health', 50) * max(1, s.get('troops', 100))) / 100.0
        fighters.append({
            'idx': i,
            'name': u['name'],
            'hp': hp,
            'max_hp': hp,
            'stats': s,
            'abilities': u.get('abilities', []),
            'class': u.get('class', ''),
            'role': u.get('role', []),
        })

    rounds = []
    max_rounds = 30

    for rnd in range(1, max_rounds + 1):
        alive = [f for f in fighters if f['hp'] > 0]
        if len(alive) <= 1:
            break

        round_events = []

        # Сортируем по скорости (быстрее — первый)
        alive_sorted = sorted(alive, key=lambda f: -f['stats'].get('moveSpeed', 30))

        for attacker in alive_sorted:
            if attacker['hp'] <= 0:
                continue
            # Атакует случайного противника (по индексу — все против всех)
            targets = [f for f in alive if f['idx'] != attacker['idx'] and f['hp'] > 0]
            if not targets:
                break
            # Атакует того у кого меньше HP (фокус на слабом)
            target = min(targets, key=lambda f: f['hp'])
            dmg = calc_damage(attacker, target)
            target['hp'] = max(0, target['hp'] - dmg)
            round_events.append({
                'attacker': attacker['name'],
                'target': target['name'],
                'damage': round(dmg, 1),
                'target_hp_left': round(target['hp'], 1),
                'target_hp_pct': round(target['hp'] / target['max_hp'] * 100, 1),
            })

        alive_after = [f for f in fighters if f['hp'] > 0]
        hp_snapshot = {f['name']: round(f['hp'] / f['max_hp'] * 100, 1) for f in fighters}
        rounds.append({'round': rnd, 'events': round_events, 'hp_pct': hp_snapshot})

        if len(alive_after) <= 1:
            break

    alive_final = [f for f in fighters if f['hp'] > 0]
    eliminated = [f for f in fighters if f['hp'] <= 0]

    return {
        'rounds': rounds,
        'total_rounds': len(rounds),
        'survivors': [f['name'] for f in alive_final],
        'eliminated': [f['name'] for f in eliminated],
        'winner': alive_final[0]['name'] if len(alive_final) == 1 else (
            ', '.join(f['name'] for f in alive_final) if alive_final else 'Ничья'
        ),
        'hp_final': {f['name']: round(f['hp'] / f['max_hp'] * 100, 1) for f in fighters},
    }


# ── AI аналитика ────────────────────────────────────────────────────────────

def ask_gpt(prompt: str) -> str:
    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return 'AI-аналитика недоступна: не настроен API ключ OpenAI.'

    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 1200,
        'temperature': 0.7,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=25) as r:
        result = json.loads(r.read())
    return result['choices'][0]['message']['content'].strip()


def build_prompt(units: list, sim: dict, formation: str) -> str:
    units_desc = []
    for u in units:
        s = u['stats']
        abilities_text = []
        for ab in u.get('abilities', []):
            if isinstance(ab, dict):
                abilities_text.append(f"«{ab.get('name', '')}»: {ab.get('description', '')}")
            elif isinstance(ab, str):
                abilities_text.append(f"«{ab}»")
        traits_text = []
        for t in u.get('traits', []):
            if isinstance(t, dict):
                traits_text.append(t.get('name', ''))
        treaties_text = []
        for tr in u.get('applied_treaties', []):
            if isinstance(tr, dict):
                treaties_text.append(f"{tr.get('name', '')}: {tr.get('description', '')}")

        desc = (
            f"**{u['name']}** (Класс: {u.get('class','?')}, Роль: {', '.join(u['role']) if isinstance(u.get('role'), list) else u.get('role','?')})\n"
            f"  Здоровье: {s.get('health',0)}, Численность: {s.get('troops',0)}, Лидерство: {s.get('leadership',0)}, "
            f"Скорость: {s.get('moveSpeed',0)}, Мораль: {s.get('morale',0)}\n"
            f"  Урон (руб/прон/дроб): {s.get('slashingDamage',0)}/{s.get('piercingDamage',0)}/{s.get('bluntDamage',0)}\n"
            f"  Защита (руб/прон/дроб): {s.get('slashingDefense',0)}/{s.get('piercingDefense',0)}/{s.get('bluntDefense',0)}\n"
            f"  Блок: {s.get('block',0)}, Восстановление блока: {s.get('blockRecovery',0)}\n"
            f"  Пробивание (руб/прон/дроб): {s.get('slashingPenetration',0)}/{s.get('piercingPenetration',0)}/{s.get('bluntPenetration',0)}\n"
            f"  Дальность: {s.get('rangeDistance',0)}, Боезапас: {s.get('ammo',0)}\n"
        )
        if abilities_text:
            desc += f"  Умения: {'; '.join(abilities_text)}\n"
        if traits_text:
            desc += f"  Черты: {', '.join(traits_text)}\n"
        if treaties_text:
            desc += f"  Трактаты: {'; '.join(treaties_text)}\n"
        units_desc.append(desc)

    sim_summary = (
        f"Симуляция завершилась за {sim['total_rounds']} раундов.\n"
        f"Победитель: {sim['winner']}\n"
        f"Финальные HP (%): {', '.join(f'{k}: {v}%' for k,v in sim['hp_final'].items())}\n"
        f"Выбыли: {', '.join(sim['eliminated']) if sim['eliminated'] else 'нет'}\n"
    )

    formation_text = f"Построение/тактика: {formation}\n" if formation else ""

    prompt = (
        "Ты — эксперт по средневековой тактике и стратегии. Проведи детальный тактический разбор симуляции сражения.\n\n"
        "## Участники сражения\n\n"
        + '\n'.join(units_desc) +
        "\n## Результат симуляции\n\n" + sim_summary +
        formation_text +
        "\n## Твоя задача\n\n"
        "Дай подробный аналитический разбор на русском языке. Структурируй ответ по разделам:\n"
        "1. **Итог сражения** — кто победил и почему, ключевые факторы победы\n"
        "2. **Анализ по каждому отряду** — сильные и слабые стороны, как они проявились в бою\n"
        "3. **Роль умений и трактатов** — как умения и трактаты повлияли на исход (если применялись)\n"
        "4. **Тактические рекомендации** — как можно было улучшить результат каждого отряда: построение, союзники, трактаты\n"
        "5. **Вывод** — общая оценка боеспособности и ситуации на поле боя\n\n"
        "Используй знания о реальной средневековой тактике (противодействие кавалерии, преимущества пехоты, дальность стрелков и т.д.).\n"
        "Ответ должен быть содержательным, конкретным, с отсылками к числовым данным отрядов."
    )
    return prompt


# ── Handler ──────────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return resp({'error': 'Метод не поддерживается'}, 405)

    body = json.loads(event.get('body') or '{}')
    units = body.get('units', [])
    formation = body.get('formation', '')

    if len(units) < 2:
        return resp({'error': 'Нужно минимум 2 отряда для симуляции'}, 400)
    if len(units) > 4:
        return resp({'error': 'Максимум 4 отряда'}, 400)

    # Симуляция
    sim = simulate_battle(units)

    # AI аналитика
    prompt = build_prompt(units, sim, formation)
    analysis = ask_gpt(prompt)

    return resp({
        'simulation': sim,
        'analysis': analysis,
    })
