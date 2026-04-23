"""
CRUD для умений отрядов (глобальный справочник).
GET  /               — список всех умений (публично)
POST / action=create — создать умение (только админ)
POST / action=update — обновить умение (только админ), нужен body.id
POST / action=delete — удалить умение (только админ), нужен body.id
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


def row_to_ability(row):
    stat_modifiers = row[2] if row[2] else {}
    stat_modifiers_ex = row[3] if row[3] else {}
    result = {
        'id': row[0],
        'name': row[1],
        'description': row[4] or '',
        'statModifiers': stat_modifiers,
        'statModifiersEx': stat_modifiers_ex,
    }
    return result


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, name, stat_modifiers, stat_modifiers_ex, description "
                    f"FROM {SCHEMA}.abilities ORDER BY name"
                )
                rows = cur.fetchall()
        finally:
            conn.close()
        return resp([row_to_ability(r) for r in rows])

    if method != 'POST':
        return resp({'error': 'Метод не поддерживается'}, 405)

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    user = get_admin_user(event)
    if not user:
        return resp({'error': 'Нет доступа'}, 403)

    name = (body.get('name') or '').strip()
    description = (body.get('description') or '').strip()
    stat_modifiers = body.get('statModifiers') or {}
    stat_modifiers_ex = body.get('statModifiersEx') or {}

    if action == 'create':
        if not name:
            return resp({'error': 'Укажите название умения'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.abilities (name, description, stat_modifiers, stat_modifiers_ex) "
                    f"VALUES (%s, %s, %s, %s) RETURNING id, name, stat_modifiers, stat_modifiers_ex, description",
                    (name, description, json.dumps(stat_modifiers), json.dumps(stat_modifiers_ex))
                )
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        return resp(row_to_ability(row), 201)

    if action == 'update':
        ability_id = body.get('id')
        if not ability_id or not name:
            return resp({'error': 'Укажите id и название'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.abilities SET name=%s, description=%s, stat_modifiers=%s, stat_modifiers_ex=%s "
                    f"WHERE id=%s RETURNING id, name, stat_modifiers, stat_modifiers_ex, description",
                    (name, description, json.dumps(stat_modifiers), json.dumps(stat_modifiers_ex), ability_id)
                )
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        if not row:
            return resp({'error': 'Умение не найдено'}, 404)
        return resp(row_to_ability(row))

    if action == 'delete':
        ability_id = body.get('id')
        if not ability_id:
            return resp({'error': 'Укажите id'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {SCHEMA}.abilities WHERE id=%s RETURNING id", (ability_id,))
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        if not row:
            return resp({'error': 'Умение не найдено'}, 404)
        return resp({'ok': True})

    return resp({'error': 'Неизвестный action'}, 400)