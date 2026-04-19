"""
CRUD для отрядов: получение списка, создание, обновление, удаление.
GET / — список. POST / с action=create/update/delete — изменения (только для админа).
"""
import json
import os
import re
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def json_response(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


def get_session_user(session_id, conn):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.username, u.is_admin FROM {SCHEMA}.sessions s "
            f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.id = %s AND s.expires_at > now()",
            (session_id,)
        )
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'username': row[1], 'is_admin': row[2]}
    return None


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]', '', text)
    return text[:100]


def row_to_unit(row):
    abilities_raw = row[7]
    if isinstance(abilities_raw, list):
        abilities = abilities_raw
    elif isinstance(abilities_raw, str):
        try:
            abilities = json.loads(abilities_raw)
        except Exception:
            abilities = []
    else:
        abilities = []
    return {
        'id': row[0], 'name': row[1], 'class': row[2], 'role': row[3],
        'rarity': row[4], 'description': row[5] or '', 'lore': row[6] or '',
        'abilities': abilities,
        'avatar_url': row[8] or '',
        'stats': row[9] if row[9] else {},
        'created_at': str(row[10]) if row[10] else '',
        'is_active': row[11],
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    session_id = (event.get('headers') or {}).get('X-Session-Id', '').strip()
    action = body.get('action', '')

    conn = get_conn()

    # GET — список всех активных отрядов
    if method == 'GET' or action == 'list':
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_at, is_active "
                f"FROM {SCHEMA}.units WHERE is_active = true ORDER BY name"
            )
            rows = cur.fetchall()
        conn.close()
        return json_response({'units': [row_to_unit(r) for r in rows]})

    # Для изменений нужна авторизация + админ
    user = get_session_user(session_id, conn)
    if not user or not user['is_admin']:
        conn.close()
        return json_response({'error': 'Требуются права администратора'}, 403)

    # action=create
    if action == 'create':
        name = body.get('name', '').strip()
        if not name:
            conn.close()
            return json_response({'error': 'Поле "название" обязательно'}, 400)

        unit_id = slugify(name)
        unit_class = body.get('class', 'Пехота')
        role = body.get('role', 'Урон')
        rarity = body.get('rarity', 'common')
        description = body.get('description', '')
        lore = body.get('lore', '')
        abilities = body.get('abilities', [])
        avatar_url = body.get('avatar_url', '')
        stats = body.get('stats', {})

        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.units WHERE id = %s", (unit_id,))
            if cur.fetchone():
                unit_id = unit_id + '-' + os.urandom(3).hex()

            cur.execute(
                f"INSERT INTO {SCHEMA}.units (id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_by) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_at, is_active",
                (unit_id, name, unit_class, role, rarity, description, lore, json.dumps(abilities, ensure_ascii=False), avatar_url, json.dumps(stats), user['id'])
            )
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return json_response({'message': 'Отряд успешно добавлен', 'unit': row_to_unit(row)})

    # action=update
    if action == 'update':
        unit_id = body.get('id', '').strip()
        name = body.get('name', '').strip()
        if not unit_id:
            conn.close()
            return json_response({'error': 'ID отряда обязателен'}, 400)
        if not name:
            conn.close()
            return json_response({'error': 'Поле "название" обязательно'}, 400)

        unit_class = body.get('class', 'Пехота')
        role = body.get('role', 'Урон')
        rarity = body.get('rarity', 'common')
        description = body.get('description', '')
        lore = body.get('lore', '')
        abilities = body.get('abilities', [])
        avatar_url = body.get('avatar_url', '')
        stats = body.get('stats', {})

        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.units WHERE id = %s", (unit_id,))
            if not cur.fetchone():
                conn.close()
                return json_response({'error': 'Отряд не найден'}, 404)

            cur.execute(
                f"UPDATE {SCHEMA}.units SET name=%s, class=%s, role=%s, rarity=%s, description=%s, lore=%s, "
                f"abilities=%s, avatar_url=%s, stats=%s, updated_at=now() WHERE id=%s "
                f"RETURNING id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_at, is_active",
                (name, unit_class, role, rarity, description, lore, json.dumps(abilities, ensure_ascii=False), avatar_url, json.dumps(stats), unit_id)
            )
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return json_response({'message': 'Отряд успешно обновлён', 'unit': row_to_unit(row)})

    # action=delete
    if action == 'delete':
        unit_id = body.get('id', '').strip()
        if not unit_id:
            conn.close()
            return json_response({'error': 'ID отряда обязателен'}, 400)

        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.units WHERE id = %s", (unit_id,))
            if not cur.fetchone():
                conn.close()
                return json_response({'error': 'Отряд не найден'}, 404)
            cur.execute(f"UPDATE {SCHEMA}.units SET is_active = false WHERE id = %s", (unit_id,))
            conn.commit()

        conn.close()
        return json_response({'message': 'Отряд успешно удалён'})

    conn.close()
    return json_response({'error': 'Неизвестное действие'}, 400)