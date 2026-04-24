"""
Messages API: личные сообщения между пользователями.
GET  ?action=conversations           — список диалогов текущего пользователя
GET  ?action=messages&with=USER_ID   — сообщения с конкретным пользователем
GET  ?action=unread_count            — количество непрочитанных
POST action=send                     — отправить сообщение {receiver_id, content}
POST action=mark_read                — пометить прочитанными {with_user_id}
"""
import json, os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def ok(data, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}

def err(msg, status=400):
    return ok({'error': msg}, status)

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_session_user(session_id, conn):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.username, u.avatar_url "
            f"FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.id = %s AND s.expires_at > now()",
            (session_id,)
        )
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'username': row[1], 'avatar_url': row[2]}
    return None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    session_id = (event.get('headers') or {}).get('X-Session-Id', '').strip()
    params = event.get('queryStringParameters') or {}

    conn = get_conn()
    user = get_session_user(session_id, conn)
    if not user:
        conn.close()
        return err('Не авторизован', 401)

    uid = user['id']

    if method == 'GET':
        action = params.get('action', 'conversations')

        if action == 'unread_count':
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT COUNT(*) FROM {SCHEMA}.direct_messages WHERE receiver_id = %s AND is_read = false",
                    (uid,)
                )
                count = cur.fetchone()[0]
            conn.close()
            return ok({'count': count})

        if action == 'conversations':
            # Список диалогов: один ряд на собеседника с последним сообщением
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT
                        CASE WHEN dm.sender_id = %s THEN dm.receiver_id ELSE dm.sender_id END AS other_id,
                        u.username, u.avatar_url,
                        dm.content AS last_message,
                        dm.created_at,
                        SUM(CASE WHEN dm.receiver_id = %s AND dm.is_read = false THEN 1 ELSE 0 END)::int AS unread
                    FROM {SCHEMA}.direct_messages dm
                    JOIN {SCHEMA}.users u ON u.id = CASE WHEN dm.sender_id = %s THEN dm.receiver_id ELSE dm.sender_id END
                    WHERE dm.sender_id = %s OR dm.receiver_id = %s
                    GROUP BY other_id, u.username, u.avatar_url, dm.content, dm.created_at
                    ORDER BY dm.created_at DESC
                """, (uid, uid, uid, uid, uid))
                rows = cur.fetchall()

            # Убираем дубли (берем последнее по each other_id)
            seen = {}
            for row in rows:
                oid = row[0]
                if oid not in seen:
                    seen[oid] = {
                        'user_id': row[0], 'username': row[1], 'avatar_url': row[2],
                        'last_message': row[3], 'last_at': row[4], 'unread': row[5],
                    }
            conn.close()
            return ok({'conversations': list(seen.values())})

        if action == 'messages':
            with_id = params.get('with')
            if not with_id:
                conn.close()
                return err('Не указан собеседник')
            with conn.cursor() as cur:
                cur.execute(f"""
                    SELECT dm.id, dm.sender_id, dm.receiver_id, dm.content, dm.is_read, dm.created_at,
                           u.username, u.avatar_url
                    FROM {SCHEMA}.direct_messages dm
                    JOIN {SCHEMA}.users u ON u.id = dm.sender_id
                    WHERE (dm.sender_id = %s AND dm.receiver_id = %s)
                       OR (dm.sender_id = %s AND dm.receiver_id = %s)
                    ORDER BY dm.created_at ASC
                    LIMIT 200
                """, (uid, int(with_id), int(with_id), uid))
                rows = cur.fetchall()

            # Получаем инфо о собеседнике
            with conn.cursor() as cur:
                cur.execute(f"SELECT id, username, avatar_url, bio FROM {SCHEMA}.users WHERE id = %s", (int(with_id),))
                other_row = cur.fetchone()
            conn.close()
            other = None
            if other_row:
                other = {'id': other_row[0], 'username': other_row[1], 'avatar_url': other_row[2], 'bio': other_row[3]}

            messages = [{
                'id': r[0], 'sender_id': r[1], 'receiver_id': r[2],
                'content': r[3], 'is_read': r[4], 'created_at': r[5],
                'sender_username': r[6], 'sender_avatar': r[7],
            } for r in rows]
            return ok({'messages': messages, 'other_user': other})

    # POST
    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    if action == 'send':
        receiver_id = body.get('receiver_id')
        content = (body.get('content') or '').strip()
        if not receiver_id or not content:
            conn.close()
            return err('Не указан получатель или текст')
        if len(content) > 2000:
            conn.close()
            return err('Сообщение слишком длинное (максимум 2000 символов)')
        if int(receiver_id) == uid:
            conn.close()
            return err('Нельзя писать самому себе')

        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.direct_messages (sender_id, receiver_id, content) VALUES (%s, %s, %s) RETURNING id, created_at",
                (uid, int(receiver_id), content)
            )
            row = cur.fetchone()
        conn.commit()
        conn.close()
        return ok({'ok': True, 'id': row[0], 'created_at': row[1]})

    if action == 'mark_read':
        with_id = body.get('with_user_id')
        if not with_id:
            conn.close()
            return err('Не указан собеседник')
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.direct_messages SET is_read = true WHERE receiver_id = %s AND sender_id = %s AND is_read = false",
                (uid, int(with_id))
            )
        conn.commit()
        conn.close()
        return ok({'ok': True})

    conn.close()
    return err('Неизвестное действие')
