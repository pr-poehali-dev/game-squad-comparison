"""
CRUD для построений отрядов.
GET  /                — список всех построений (публично)
POST / action=create  — создать построение (только админ)
POST / action=update  — обновить построение (только админ), нужен body.id
POST / action=delete  — удалить построение (только админ), нужен body.id
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


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')

    # GET — список построений (публичный)
    if method == 'GET':
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT id, name, description, avatar_url FROM {SCHEMA}.formations ORDER BY id"
                )
                rows = cur.fetchall()
        finally:
            conn.close()
        return resp([{
            'id': r[0], 'name': r[1], 'description': r[2], 'avatar_url': r[3]
        } for r in rows])

    if method != 'POST':
        return resp({'error': 'Метод не поддерживается'}, 405)

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    user = get_admin_user(event)
    if not user:
        return resp({'error': 'Нет доступа'}, 403)

    name        = (body.get('name') or '').strip()
    description = (body.get('description') or '').strip()
    avatar_url  = (body.get('avatar_url') or '').strip()

    if action == 'create':
        if not name:
            return resp({'error': 'Укажите название построения'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.formations (name, description, avatar_url) "
                    f"VALUES (%s, %s, %s) RETURNING id, name, description, avatar_url",
                    (name, description, avatar_url)
                )
                row = cur.fetchone()
            conn.commit()
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            return resp({'error': 'Построение с таким названием уже существует'}, 409)
        finally:
            conn.close()
        return resp({'id': row[0], 'name': row[1], 'description': row[2], 'avatar_url': row[3]}, 201)

    if action == 'update':
        formation_id = body.get('id')
        if not formation_id or not name:
            return resp({'error': 'Укажите id и название'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"UPDATE {SCHEMA}.formations SET name=%s, description=%s, avatar_url=%s "
                    f"WHERE id=%s RETURNING id, name, description, avatar_url",
                    (name, description, avatar_url, formation_id)
                )
                row = cur.fetchone()
            conn.commit()
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            return resp({'error': 'Построение с таким названием уже существует'}, 409)
        finally:
            conn.close()
        if not row:
            return resp({'error': 'Построение не найдено'}, 404)
        return resp({'id': row[0], 'name': row[1], 'description': row[2], 'avatar_url': row[3]})

    if action == 'delete':
        formation_id = body.get('id')
        if not formation_id:
            return resp({'error': 'Укажите id'}, 400)
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"DELETE FROM {SCHEMA}.formations WHERE id=%s RETURNING id",
                    (formation_id,)
                )
                row = cur.fetchone()
            conn.commit()
        finally:
            conn.close()
        if not row:
            return resp({'error': 'Построение не найдено'}, 404)
        return resp({'ok': True})

    return resp({'error': 'Неизвестный action'}, 400)