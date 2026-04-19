"""
CRUD для трактатов: получение списка, создание, обновление, удаление.
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


def row_to_treaty(row) -> dict:
    return {
        'id': row[0],
        'name': row[1],
        'description': row[2] or '',
        'compatibleClasses': list(row[3]) if row[3] else [],
        'rarity': row[4],
        'statModifiers': row[5] if row[5] else {},
        'created_at': str(row[6]) if row[6] else '',
        'is_active': row[7],
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

    path_parts = [p for p in path.split('/') if p]
    treaty_id = path_parts[-1] if len(path_parts) > 1 else None

    conn = get_conn()

    # GET / — список всех активных трактатов
    if method == 'GET' and not treaty_id:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, description, compatible_classes, rarity, stat_modifiers, created_at, is_active "
                f"FROM {SCHEMA}.treaties WHERE is_active = true ORDER BY name"
            )
            rows = cur.fetchall()
        conn.close()
        return json_response({'treaties': [row_to_treaty(r) for r in rows]})

    # GET /{id}
    if method == 'GET' and treaty_id:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT id, name, description, compatible_classes, rarity, stat_modifiers, created_at, is_active "
                f"FROM {SCHEMA}.treaties WHERE id = %s",
                (treaty_id,)
            )
            row = cur.fetchone()
        conn.close()
        if not row:
            return json_response({'error': 'Трактат не найден'}, 404)
        return json_response({'treaty': row_to_treaty(row)})

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

        treaty_id_new = slugify(name)
        description = body.get('description', '')
        compatible_classes = body.get('compatibleClasses', [])
        rarity = body.get('rarity', 'common')
        stat_modifiers = body.get('statModifiers', {})

        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.treaties WHERE id = %s", (treaty_id_new,))
            if cur.fetchone():
                treaty_id_new = treaty_id_new + '-' + os.urandom(3).hex()

            cur.execute(
                f"INSERT INTO {SCHEMA}.treaties (id, name, description, compatible_classes, rarity, stat_modifiers, created_by) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING id, name, description, compatible_classes, rarity, stat_modifiers, created_at, is_active",
                (treaty_id_new, name, description, compatible_classes, rarity, json.dumps(stat_modifiers), user['id'])
            )
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return json_response({'message': 'Трактат успешно добавлен', 'treaty': row_to_treaty(row)})

    # PUT /{id} — обновление
    if method == 'PUT' and treaty_id:
        name = body.get('name', '').strip()
        if not name:
            conn.close()
            return json_response({'error': 'Поле "название" обязательно'}, 400)

        description = body.get('description', '')
        compatible_classes = body.get('compatibleClasses', [])
        rarity = body.get('rarity', 'common')
        stat_modifiers = body.get('statModifiers', {})

        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.treaties WHERE id = %s", (treaty_id,))
            if not cur.fetchone():
                conn.close()
                return json_response({'error': 'Трактат не найден'}, 404)

            cur.execute(
                f"UPDATE {SCHEMA}.treaties SET name=%s, description=%s, compatible_classes=%s, rarity=%s, "
                f"stat_modifiers=%s, updated_at=now() WHERE id=%s "
                f"RETURNING id, name, description, compatible_classes, rarity, stat_modifiers, created_at, is_active",
                (name, description, compatible_classes, rarity, json.dumps(stat_modifiers), treaty_id)
            )
            row = cur.fetchone()
            conn.commit()

        conn.close()
        return json_response({'message': 'Трактат успешно обновлён', 'treaty': row_to_treaty(row)})

    # DELETE /{id}
    if method == 'DELETE' and treaty_id:
        with conn.cursor() as cur:
            cur.execute(f"SELECT id FROM {SCHEMA}.treaties WHERE id = %s", (treaty_id,))
            if not cur.fetchone():
                conn.close()
                return json_response({'error': 'Трактат не найден'}, 404)
            cur.execute(f"UPDATE {SCHEMA}.treaties SET is_active = false WHERE id = %s", (treaty_id,))
            conn.commit()

        conn.close()
        return json_response({'message': 'Трактат успешно удалён'})

    conn.close()
    return json_response({'error': 'Не найдено'}, 404)
