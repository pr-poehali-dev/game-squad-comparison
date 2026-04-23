"""
CRUD для особенностей отрядов (глобальный справочник).
GET  /               — список всех особенностей (публично)
POST / action=create — создать (только админ)
POST / action=update — обновить (только админ), нужен body.id
POST / action=delete — удалить (только админ), нужен body.id
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}
VALID_COLORS = ('green', 'gray', 'red')


def resp(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_admin_user(event):
    headers = event.get('headers') or {}
    session_id = (
        headers.get('x-session-id') or
        headers.get('X-Session-Id') or
        headers.get('X-Session-ID', '')
    )
    if not session_id:
        return None
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT u.id, u.is_admin FROM {SCHEMA}.sessions s "
                f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
                f"WHERE s.id = %s AND s.expires_at > now()",
                (session_id,)
            )
            row = cur.fetchone()
    finally:
        conn.close()
    if not row or not row[1]:
        return None
    return {'id': row[0], 'is_admin': row[1]}


def row_to_trait(row):
    return {'id': row[0], 'name': row[1], 'description': row[2], 'color': row[3]}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(f"SELECT id, name, description, color FROM {SCHEMA}.traits ORDER BY name")
                rows = cur.fetchall()
        finally:
            conn.close()
        return resp([row_to_trait(r) for r in rows])

    if method != 'POST':
        return resp({'error': 'Метод не поддерживается'}, 405)

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    user = get_admin_user(event)
    if not user:
        return resp({'error': 'Нет доступа'}, 403)

    name = (body.get('name') or '').strip()
    description = (body.get('description') or '').strip()
    color = body.get('color', 'gray')
    if color not in VALID_COLORS:
        color = 'gray'

    if action == 'create':
        if not name:
            return resp({'error': 'Укажите название особенности'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.traits (name, description, color) "
                    f"VALUES (%s, %s, %s) RETURNING id, name, description, color",
                    (name, description, color)
                )
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        return resp(row_to_trait(row), 201)

    if action == 'update':
        trait_id = body.get('id')
        if not trait_id or not name:
            return resp({'error': 'Укажите id и название'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.traits SET name=%s, description=%s, color=%s "
                    f"WHERE id=%s RETURNING id, name, description, color",
                    (name, description, color, trait_id)
                )
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        if not row:
            return resp({'error': 'Особенность не найдена'}, 404)
        return resp(row_to_trait(row))

    if action == 'delete':
        trait_id = body.get('id')
        if not trait_id:
            return resp({'error': 'Укажите id'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {SCHEMA}.traits WHERE id=%s RETURNING id", (trait_id,))
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        if not row:
            return resp({'error': 'Особенность не найдена'}, 404)
        return resp({'ok': True})

    return resp({'error': 'Неизвестный action'}, 400)
