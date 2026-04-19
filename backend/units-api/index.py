"""
CRUD для отрядов: получение списка, создание, обновление, удаление.
"""
import json
import os
import re
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
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


def get_session_user(session_id: str, conn):
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


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]', '', text)
    return text[:100]


def row_to_unit(row) -> dict:
    return {
        'id': row[0],
        'name': row[1],
        'class': row[2],
        'role': row[3],
        'rarity': row[4],
        'description': row[5] or '',
        'lore': row[6] or '',
        'abilities': list(row[7]) if row[7] else [],
        'avatar_url': row[8] or '',
        'stats': row[9] if row[9] else {},
        'created_at': str(row[10]) if row[10] else '',
        'is_active': row[11],
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    session_id = event.get('headers', {}).get('X-Session-Id', '').strip()

    # Извлекаем ID из пути /units-api/{id}
    path_parts = [p for p in path.split('/') if p]
    unit_id = path_parts[-1] if len(path_parts) > 1 else None

    conn = get_conn()

    # GET / — список всех активных отрядов
    if method == 'GET' and not unit_id:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_at, is_active "
                f"FROM {SCHEMA}.units WHERE is_active = true ORDER BY name"
            )
            rows = cur.fetchall()
        conn.close()
        return json_response({'units': [row_to_unit(r) for r in rows]})

    # GET /{id} — один отряд
    if method == 'GET' and unit_id:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_at, is_active "
                f"FROM {SCHEMA}.units WHERE id = %s",
                (unit_id,)
            )
            row = cur.fetchone()
        conn.close()
        if not row:
            return json_response({'error': 'Отряд не найден'}, 404)
        return json_response({'unit': row_to_unit(row)})

    # Для изменяющих операций нужна авторизация + админ
    user = get_session_user(session_id, conn)
    if not user or not user['is_admin']:
        conn.close()
        return json_response({'error': 'Требуются права администратора'}, 403)

    # POST / — создание
    if method == 'POST':
        name = body.get('name', '').strip()
        if not name:
            conn.close()
            return json_response({'error': 'Поле "название" обязательно'}, 400)

        unit_id_new = slugify(name)
        unit_class = body.get('class', 'Пехота')
        role = body.get('role', 'Урон')
        rarity = body.get('rarity', 'common')
        description = body.get('description', '')
        lore = body.get('lore', '')
        abilities = body.get('abilities', [])
        avatar_url = body.get('avatar_url', '')
        stats = body.get('stats', {})

        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.units WHERE id = %s", (unit_id_new,))
            if cur.fetchone():
                unit_id_new = unit_id_new + '-' + os.urandom(3).hex()

            cur.execute(
                f"INSERT INTO {SCHEMA}.units (id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_by) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, name, class, role, rarity, description, lore, abilities, avatar_url, stats, created_at, is_active",
                (unit_id_new, name, unit_class, role, rarity, description, lore, abilities, avatar_url, json.dumps(stats), user['id'])
            )
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return json_response({'message': 'Отряд успешно добавлен', 'unit': row_to_unit(row)})

    # PUT /{id} — обновление
    if method == 'PUT' and unit_id:
        name = body.get('name', '').strip()
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
                (name, unit_class, role, rarity, description, lore, abilities, avatar_url, json.dumps(stats), unit_id)
            )
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return json_response({'message': 'Отряд успешно обновлён', 'unit': row_to_unit(row)})

    # DELETE /{id} — удаление (soft delete)
    if method == 'DELETE' and unit_id:
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
    return json_response({'error': 'Не найдено'}, 404)
