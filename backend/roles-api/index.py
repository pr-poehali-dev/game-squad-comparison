"""
CRUD для ролей отрядов. Роли хранятся в БД и доступны всем пользователям.
GET  /        — список всех ролей
POST /        — создать роль (только админ)
PUT  /{id}    — обновить роль (только админ)
DELETE /{id}  — удалить роль (только админ)
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id, X-User-Id, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def resp(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user(event):
    headers = event.get('headers') or {}
    session_id = headers.get('x-session-id') or headers.get('X-Session-Id', '')
    if not session_id:
        return None
    conn = get_db()
    cur = conn.cursor()
    cur.execute(f"SELECT id, is_admin FROM {SCHEMA}.users WHERE session_id = %s", (session_id,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return {'id': row[0], 'is_admin': row[1]}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path   = event.get('path', '/')

    # GET / — список ролей
    if method == 'GET':
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, name, description, created_at FROM {SCHEMA}.unit_roles ORDER BY id")
        rows = cur.fetchall()
        conn.close()
        return resp([{'id': r[0], 'name': r[1], 'description': r[2], 'created_at': r[3]} for r in rows])

    # Всё остальное — только для админа
    user = get_user(event)
    if not user or not user['is_admin']:
        return resp({'error': 'Нет доступа'}, 403)

    body = json.loads(event.get('body') or '{}')

    # POST / — создать
    if method == 'POST':
        name = (body.get('name') or '').strip()
        description = (body.get('description') or '').strip()
        if not name:
            return resp({'error': 'Укажите название роли'}, 400)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.unit_roles (name, description) VALUES (%s, %s) RETURNING id, name, description",
            (name, description)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return resp({'id': row[0], 'name': row[1], 'description': row[2]}, 201)

    # PUT /{id} — обновить
    if method == 'PUT':
        role_id = path.rstrip('/').split('/')[-1]
        name = (body.get('name') or '').strip()
        description = (body.get('description') or '').strip()
        if not name:
            return resp({'error': 'Укажите название роли'}, 400)
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            f"UPDATE {SCHEMA}.unit_roles SET name=%s, description=%s WHERE id=%s RETURNING id, name, description",
            (name, description, role_id)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return resp({'error': 'Роль не найдена'}, 404)
        return resp({'id': row[0], 'name': row[1], 'description': row[2]})

    # DELETE /{id} — удалить
    if method == 'DELETE':
        role_id = path.rstrip('/').split('/')[-1]
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.unit_roles WHERE id=%s RETURNING id", (role_id,))
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return resp({'error': 'Роль не найдена'}, 404)
        return resp({'ok': True})

    return resp({'error': 'Метод не поддерживается'}, 405)
