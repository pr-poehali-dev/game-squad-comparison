"""
Импорт статичных отрядов и трактатов из кода в базу данных.
Вызывается администратором однократно через POST с action=seed.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}

UNITS = [
    {"id": "iron-guard", "name": "Железная Стража", "class": "Пехота", "role": "Танк", "rarity": "common",
     "description": "Тяжёлая пехота с высокой защитой и стойкостью. Костяк любой обороны.",
     "lore": "Прошедшие суровые испытания воины, закованные в листовую сталь. Их называют живой стеной.",
     "abilities": ["Щитовая стена", "Боевое закалывание"],
     "stats": {"health": 95, "troops": 200, "leadership": 55, "moveSpeed": 28, "rangeDistance": 0, "ammo": 0, "morale": 65, "piercingPenetration": 20, "slashingPenetration": 35, "bluntPenetration": 40, "piercingDamage": 15, "slashingDamage": 42, "bluntDamage": 30, "piercingDefense": 70, "slashingDefense": 78, "bluntDefense": 72, "block": 85, "blockRecovery": 40}},
    {"id": "shadow-runners", "name": "Теневые Бегуны", "class": "Пехота", "role": "Разведчик", "rarity": "uncommon",
     "description": "Быстрая лёгкая пехота, мастера засад и разведывательных операций.",
     "lore": "Их следы не находят даже следопыты. Они приходят из темноты — и уходят в неё же.",
     "abilities": ["Засада", "Скрытное передвижение", "Отравленные клинки"],
     "stats": {"health": 52, "troops": 120, "leadership": 68, "moveSpeed": 88, "rangeDistance": 0, "ammo": 0, "morale": 70, "piercingPenetration": 55, "slashingPenetration": 62, "bluntPenetration": 20, "piercingDamage": 61, "slashingDamage": 55, "bluntDamage": 18, "piercingDefense": 25, "slashingDefense": 35, "bluntDefense": 20, "block": 30, "blockRecovery": 65}},
    {"id": "storm-cavalry", "name": "Штормовая Кавалерия", "class": "Кавалерия", "role": "Урон", "rarity": "rare",
     "description": "Стремительный кавалерийский отряд, способный прорвать любой строй.",
     "lore": "Земля дрожит под их копытами. Враги, услышавшие этот грохот, редко успевают выстроить защиту.",
     "abilities": ["Сокрушительный натиск", "Рассеивание рядов", "Преследование"],
     "stats": {"health": 70, "troops": 80, "leadership": 75, "moveSpeed": 92, "rangeDistance": 0, "ammo": 0, "morale": 80, "piercingPenetration": 40, "slashingPenetration": 70, "bluntPenetration": 85, "piercingDamage": 35, "slashingDamage": 85, "bluntDamage": 75, "piercingDefense": 40, "slashingDefense": 52, "bluntDefense": 48, "block": 25, "blockRecovery": 50}},
    {"id": "royal-longhorns", "name": "Королевские Длиннолучники", "class": "Стрелки", "role": "Урон", "rarity": "rare",
     "description": "Лучники, чьи стрелы заряжены магической энергией. Поражают врагов на огромной дистанции.",
     "lore": "Каждая стрела — заклинание. Каждый выстрел — ритуал, который они совершали тысячи раз.",
     "abilities": ["Залп 1", "Пронзающий выстрел", "Залп 3"],
     "stats": {"health": 45, "troops": 100, "leadership": 62, "moveSpeed": 55, "rangeDistance": 5, "ammo": 30, "morale": 72, "piercingPenetration": 79, "slashingPenetration": 30, "bluntPenetration": 20, "piercingDamage": 79, "slashingDamage": 22, "bluntDamage": 15, "piercingDefense": 18, "slashingDefense": 28, "bluntDefense": 22, "block": 10, "blockRecovery": 35}},
    {"id": "siege-masters", "name": "Мастера Осады", "class": "Осадные", "role": "Урон", "rarity": "uncommon",
     "description": "Инженеры и расчёты метательных машин. Незаменимы при штурме укреплений.",
     "lore": "Они не сражаются — они решают уравнения разрушения, в которых нет неизвестных.",
     "abilities": ["Требушет", "Горящие снаряды", "Инженерный ремонт"],
     "stats": {"health": 55, "troops": 40, "leadership": 50, "moveSpeed": 15, "rangeDistance": 8, "ammo": 20, "morale": 58, "piercingPenetration": 60, "slashingPenetration": 50, "bluntPenetration": 95, "piercingDamage": 50, "slashingDamage": 45, "bluntDamage": 95, "piercingDefense": 15, "slashingDefense": 25, "bluntDefense": 20, "block": 0, "blockRecovery": 0}},
    {"id": "veil-mages", "name": "Маги Завесы", "class": "Магические", "role": "Поддержка", "rarity": "epic",
     "description": "Могущественные маги, управляющие полем боя через наложение заклятий.",
     "lore": "Реальность для них — лишь черновик. То, что остальные видят как твёрдое, они воспринимают как временное.",
     "abilities": ["Аура щита", "Туман войны", "Массовое замедление", "Чары восстановления"],
     "stats": {"health": 40, "troops": 30, "leadership": 88, "moveSpeed": 48, "rangeDistance": 6, "ammo": 0, "morale": 90, "piercingPenetration": 55, "slashingPenetration": 40, "bluntPenetration": 55, "piercingDamage": 55, "slashingDamage": 30, "bluntDamage": 55, "piercingDefense": 30, "slashingDefense": 40, "bluntDefense": 30, "block": 20, "blockRecovery": 80}},
    {"id": "crimson-paladins", "name": "Малиновые Паладины", "class": "Кавалерия", "role": "Танк", "rarity": "epic",
     "description": "Элитные рыцари в тяжёлых доспехах, сочетающие силу и защиту.",
     "lore": "Их клятва — щит для союзников и меч для врагов. Никто не видел, чтобы они отступали.",
     "abilities": ["Священный щит", "Вдохновляющий клич", "Карающий удар"],
     "stats": {"health": 88, "troops": 60, "leadership": 90, "moveSpeed": 58, "rangeDistance": 0, "ammo": 0, "morale": 95, "piercingPenetration": 50, "slashingPenetration": 74, "bluntPenetration": 68, "piercingDamage": 45, "slashingDamage": 74, "bluntDamage": 62, "piercingDefense": 80, "slashingDefense": 88, "bluntDefense": 82, "block": 90, "blockRecovery": 55}},
    {"id": "death-whisperers", "name": "Шептуны Смерти", "class": "Магические", "role": "Контроль", "rarity": "legendary",
     "description": "Некроманты высшего ранга, способные поднимать павших воинов.",
     "lore": "Смерть на поле боя для них — лишь начало. Каждый павший враг пополняет их армию.",
     "abilities": ["Воскрешение", "Проклятие", "Страх смерти", "Костяная броня", "Жатва душ"],
     "stats": {"health": 68, "troops": 25, "leadership": 95, "moveSpeed": 42, "rangeDistance": 4, "ammo": 0, "morale": 100, "piercingPenetration": 75, "slashingPenetration": 65, "bluntPenetration": 72, "piercingDamage": 88, "slashingDamage": 70, "bluntDamage": 80, "piercingDefense": 55, "slashingDefense": 62, "bluntDefense": 58, "block": 40, "blockRecovery": 70}},
    {"id": "golden-crossbows", "name": "Золотые Арбалетчики", "class": "Стрелки", "role": "Урон", "rarity": "uncommon",
     "description": "Опытные арбалетчики с тяжёлыми осадными арбалетами. Пробивают любую броню.",
     "lore": "Им платят золотом — и они стоят каждой монеты. Ни одна цель не уходила из их прицела.",
     "abilities": ["Бронебойный болт", "Прицельный залп"],
     "stats": {"health": 48, "troops": 90, "leadership": 58, "moveSpeed": 42, "rangeDistance": 4, "ammo": 25, "morale": 65, "piercingPenetration": 90, "slashingPenetration": 35, "bluntPenetration": 30, "piercingDamage": 72, "slashingDamage": 25, "bluntDamage": 20, "piercingDefense": 22, "slashingDefense": 32, "bluntDefense": 28, "block": 15, "blockRecovery": 30}},
    {"id": "highland-berserkers", "name": "Горные Берсерки", "class": "Пехота", "role": "Урон", "rarity": "rare",
     "description": "Неистовые воины с севера, чья ярость в бою не знает предела.",
     "lore": "Холодные горы закалили их тела, а суровые духи предков — их волю. В бою они не ведают страха.",
     "abilities": ["Боевое безумие", "Неукротимый натиск", "Боевой клич"],
     "stats": {"health": 75, "troops": 100, "leadership": 65, "moveSpeed": 70, "rangeDistance": 0, "ammo": 0, "morale": 85, "piercingPenetration": 45, "slashingPenetration": 80, "bluntPenetration": 60, "piercingDamage": 40, "slashingDamage": 95, "bluntDamage": 55, "piercingDefense": 35, "slashingDefense": 42, "bluntDefense": 38, "block": 45, "blockRecovery": 35}},
]

TREATIES = [
    {"id": "iron-discipline", "name": "Железная Дисциплина", "description": "Суровая тренировка усиливает защитные навыки пехотных отрядов.", "compatibleClasses": ["Пехота"], "rarity": "common", "statModifiers": {"slashingDefense": 15, "piercingDefense": 10, "block": 12, "morale": 10}},
    {"id": "swift-winds", "name": "Попутный Ветер", "description": "Благословение скорости — отряд движется быстрее ветра.", "compatibleClasses": ["Кавалерия", "Пехота", "Стрелки"], "rarity": "uncommon", "statModifiers": {"moveSpeed": 20, "morale": 5, "blockRecovery": 10}},
    {"id": "eagle-eye", "name": "Орлиный Взор", "description": "Дальнобойные отряды получают бонус к дальности и пробиванию брони.", "compatibleClasses": ["Стрелки"], "rarity": "uncommon", "statModifiers": {"piercingDamage": 18, "piercingPenetration": 22, "rangeDistance": 2}},
    {"id": "arcane-infusion", "name": "Арканное Насыщение", "description": "Магические отряды усиливают заклинания — но расходуют жизненную силу.", "compatibleClasses": ["Магические"], "rarity": "rare", "statModifiers": {"piercingDamage": 22, "bluntDamage": 18, "health": -8}},
    {"id": "siege-mastery", "name": "Мастерство Осады", "description": "Осадные орудия работают с удвоенной разрушительной силой.", "compatibleClasses": ["Осадные"], "rarity": "rare", "statModifiers": {"bluntDamage": 30, "bluntPenetration": 25, "moveSpeed": -5}},
    {"id": "blood-oath", "name": "Кровавая Клятва", "description": "Отряд клянётся победить или умереть — атака резко возрастает.", "compatibleClasses": ["Пехота", "Кавалерия"], "rarity": "epic", "statModifiers": {"slashingDamage": 30, "piercingDamage": 25, "morale": 25, "slashingDefense": -10, "piercingDefense": -8}},
    {"id": "ancient-covenant", "name": "Древний Завет", "description": "Легендарный договор с духами предков. Все характеристики возрастают.", "compatibleClasses": ["Пехота", "Кавалерия", "Стрелки", "Осадные", "Магические"], "rarity": "legendary", "statModifiers": {"health": 15, "morale": 20, "leadership": 15, "slashingDamage": 15, "piercingDamage": 15, "bluntDamage": 15, "slashingDefense": 15, "piercingDefense": 15, "bluntDefense": 15, "block": 10, "blockRecovery": 15}},
    {"id": "shadow-pact", "name": "Тёмный Пакт", "description": "Магический договор резко усиливает урон, но ослабляет волю.", "compatibleClasses": ["Магические", "Пехота"], "rarity": "epic", "statModifiers": {"piercingDamage": 35, "piercingPenetration": 30, "morale": -15, "leadership": -10}},
    {"id": "shield-oath", "name": "Клятва Щита", "description": "Воины дают клятву не отступать — блок и защита от рубящих атак растут.", "compatibleClasses": ["Пехота", "Кавалерия"], "rarity": "rare", "statModifiers": {"block": 20, "blockRecovery": 25, "slashingDefense": 18, "troops": 10}},
    {"id": "marksman-training", "name": "Меткая Рука", "description": "Интенсивные тренировки увеличивают боезапас и пробивную силу стрел.", "compatibleClasses": ["Стрелки", "Осадные"], "rarity": "common", "statModifiers": {"ammo": 10, "piercingPenetration": 18, "rangeDistance": 1}},
]


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_session_user(session_id, conn):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.is_admin FROM {SCHEMA}.sessions s "
            f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.id = %s AND s.expires_at > now()",
            (session_id,)
        )
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'is_admin': row[1]}
    return None


def json_response(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    session_id = (event.get('headers') or {}).get('X-Session-Id', '').strip()
    conn = get_conn()

    user = get_session_user(session_id, conn)
    if not user or not user['is_admin']:
        conn.close()
        return json_response({'error': 'Требуются права администратора'}, 403)

    inserted_units = 0
    skipped_units = 0
    inserted_treaties = 0
    skipped_treaties = 0

    with conn.cursor() as cur:
        for unit in UNITS:
            cur.execute(f"SELECT id FROM {SCHEMA}.units WHERE id = %s", (unit['id'],))
            if cur.fetchone():
                skipped_units += 1
                continue
            cur.execute(
                f"INSERT INTO {SCHEMA}.units (id, name, class, role, rarity, description, lore, abilities, stats, is_active) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, true)",
                (unit['id'], unit['name'], unit['class'], unit['role'], unit['rarity'],
                 unit['description'], unit['lore'], unit['abilities'],
                 json.dumps(unit['stats'], ensure_ascii=False))
            )
            inserted_units += 1

        for treaty in TREATIES:
            cur.execute(f"SELECT id FROM {SCHEMA}.treaties WHERE id = %s", (treaty['id'],))
            if cur.fetchone():
                skipped_treaties += 1
                continue
            cur.execute(
                f"INSERT INTO {SCHEMA}.treaties (id, name, description, compatible_classes, rarity, stat_modifiers, is_active) "
                f"VALUES (%s, %s, %s, %s, %s, %s, true)",
                (treaty['id'], treaty['name'], treaty['description'], treaty['compatibleClasses'],
                 treaty['rarity'], json.dumps(treaty['statModifiers'], ensure_ascii=False))
            )
            inserted_treaties += 1

        conn.commit()

    conn.close()
    return json_response({
        'message': 'Импорт завершён',
        'units': {'inserted': inserted_units, 'skipped': skipped_units},
        'treaties': {'inserted': inserted_treaties, 'skipped': skipped_treaties},
    })
