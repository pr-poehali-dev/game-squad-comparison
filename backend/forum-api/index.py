"""
Форум: темы и посты.
GET  / — список тем
GET  /?action=topic&id=N — тема + посты
POST / action=create_topic — создать тему (авторизован)
POST / action=create_post  — ответить в теме (авторизован)
POST / action=edit_topic   — редактировать тему (свою или админ)
POST / action=edit_post    — редактировать пост (свой или админ)
POST / action=pin_topic    — закрепить тему (только админ)
POST / action=lock_topic   — закрыть тему (только админ)
"""
import json
import os
import psycopg2
from datetime import timezone

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def resp(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False, default=str),
    }


def get_user(session_id, conn):
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
        return {'id': row[0], 'username': row[1], 'is_admin': row[2]} if row else None


def fmt_topic(row):
    return {
        'id': row[0], 'title': row[1], 'content': row[2],
        'author_id': row[3], 'author': row[4],
        'views': row[5], 'is_pinned': row[6], 'is_locked': row[7],
        'created_at': str(row[8]), 'updated_at': str(row[9]),
        'post_count': row[10],
    }


def fmt_post(row):
    return {
        'id': row[0], 'topic_id': row[1], 'content': row[2],
        'author_id': row[3], 'author': row[4],
        'is_hidden': row[5], 'created_at': str(row[6]), 'updated_at': str(row[7]),
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id', '').strip()

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = qs.get('action') or body.get('action', '')

    conn = get_conn()
    user = get_user(session_id, conn)

    # ── GET: список тем ──────────────────────────────────────────────
    if method == 'GET' and not action:
        with conn.cursor() as cur:
            cur.execute(
                f"""SELECT t.id, t.title, t.content, t.author_id, u.username,
                       t.views, t.is_pinned, t.is_locked, t.created_at, t.updated_at,
                       COUNT(p.id) as post_count
                    FROM {SCHEMA}.forum_topics t
                    JOIN {SCHEMA}.users u ON u.id = t.author_id
                    LEFT JOIN {SCHEMA}.forum_posts p ON p.topic_id = t.id AND p.is_hidden = false
                    GROUP BY t.id, u.username
                    ORDER BY t.is_pinned DESC, t.updated_at DESC"""
            )
            rows = cur.fetchall()
        conn.close()
        return resp({'topics': [fmt_topic(r) for r in rows]})

    # ── GET: одна тема + посты ───────────────────────────────────────
    if method == 'GET' and action == 'topic':
        topic_id = int(qs.get('id', 0))
        with conn.cursor() as cur:
            # +1 к просмотрам
            cur.execute(f"UPDATE {SCHEMA}.forum_topics SET views = views + 1 WHERE id = %s", (topic_id,))
            cur.execute(
                f"""SELECT t.id, t.title, t.content, t.author_id, u.username,
                       t.views, t.is_pinned, t.is_locked, t.created_at, t.updated_at,
                       0 as post_count
                    FROM {SCHEMA}.forum_topics t
                    JOIN {SCHEMA}.users u ON u.id = t.author_id
                    WHERE t.id = %s""", (topic_id,)
            )
            topic_row = cur.fetchone()
            if not topic_row:
                conn.close()
                return resp({'error': 'Тема не найдена'}, 404)
            cur.execute(
                f"""SELECT p.id, p.topic_id, p.content, p.author_id, u.username,
                       p.is_hidden, p.created_at, p.updated_at
                    FROM {SCHEMA}.forum_posts p
                    JOIN {SCHEMA}.users u ON u.id = p.author_id
                    WHERE p.topic_id = %s AND p.is_hidden = false
                    ORDER BY p.created_at ASC""", (topic_id,)
            )
            posts = cur.fetchall()
            conn.commit()
        conn.close()
        return resp({'topic': fmt_topic(topic_row), 'posts': [fmt_post(p) for p in posts]})

    # Для записи нужна авторизация
    if not user:
        conn.close()
        return resp({'error': 'Необходима авторизация'}, 401)

    # ── POST: создать тему ───────────────────────────────────────────
    if action == 'create_topic':
        title = body.get('title', '').strip()
        content = body.get('content', '').strip()
        if not title:
            conn.close()
            return resp({'error': 'Укажите заголовок темы'}, 400)
        if not content:
            conn.close()
            return resp({'error': 'Напишите содержимое темы'}, 400)
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.forum_topics (title, content, author_id) VALUES (%s, %s, %s) RETURNING id",
                (title, content, user['id'])
            )
            topic_id = cur.fetchone()[0]
            conn.commit()
        conn.close()
        return resp({'message': 'Тема создана', 'topic_id': topic_id})

    # ── POST: ответить в теме ────────────────────────────────────────
    if action == 'create_post':
        topic_id = int(body.get('topic_id', 0))
        content = body.get('content', '').strip()
        if not content:
            conn.close()
            return resp({'error': 'Напишите текст ответа'}, 400)
        with conn.cursor() as cur:
            cur.execute(f"SELECT is_locked FROM {SCHEMA}.forum_topics WHERE id = %s", (topic_id,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return resp({'error': 'Тема не найдена'}, 404)
            if row[0] and not user['is_admin']:
                conn.close()
                return resp({'error': 'Тема закрыта для ответов'}, 403)
            cur.execute(
                f"INSERT INTO {SCHEMA}.forum_posts (topic_id, content, author_id) VALUES (%s, %s, %s) RETURNING id",
                (topic_id, content, user['id'])
            )
            post_id = cur.fetchone()[0]
            cur.execute(f"UPDATE {SCHEMA}.forum_topics SET updated_at = now() WHERE id = %s", (topic_id,))
            conn.commit()
        conn.close()
        return resp({'message': 'Ответ добавлен', 'post_id': post_id})

    # ── POST: редактировать тему ─────────────────────────────────────
    if action == 'edit_topic':
        topic_id = int(body.get('topic_id', 0))
        title = body.get('title', '').strip()
        content = body.get('content', '').strip()
        with conn.cursor() as cur:
            cur.execute(f"SELECT author_id FROM {SCHEMA}.forum_topics WHERE id = %s", (topic_id,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return resp({'error': 'Тема не найдена'}, 404)
            if row[0] != user['id'] and not user['is_admin']:
                conn.close()
                return resp({'error': 'Нет прав'}, 403)
            cur.execute(
                f"UPDATE {SCHEMA}.forum_topics SET title=%s, content=%s, updated_at=now() WHERE id=%s",
                (title, content, topic_id)
            )
            conn.commit()
        conn.close()
        return resp({'message': 'Тема обновлена'})

    # ── POST: редактировать пост ─────────────────────────────────────
    if action == 'edit_post':
        post_id = int(body.get('post_id', 0))
        content = body.get('content', '').strip()
        with conn.cursor() as cur:
            cur.execute(f"SELECT author_id FROM {SCHEMA}.forum_posts WHERE id = %s", (post_id,))
            row = cur.fetchone()
            if not row:
                conn.close()
                return resp({'error': 'Пост не найден'}, 404)
            if row[0] != user['id'] and not user['is_admin']:
                conn.close()
                return resp({'error': 'Нет прав'}, 403)
            cur.execute(
                f"UPDATE {SCHEMA}.forum_posts SET content=%s, updated_at=now() WHERE id=%s",
                (content, post_id)
            )
            conn.commit()
        conn.close()
        return resp({'message': 'Пост обновлён'})

    # ── POST: закрепить/открепить (админ) ────────────────────────────
    if action == 'pin_topic':
        if not user['is_admin']:
            conn.close()
            return resp({'error': 'Нет прав'}, 403)
        topic_id = int(body.get('topic_id', 0))
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.forum_topics SET is_pinned = NOT is_pinned WHERE id = %s RETURNING is_pinned",
                (topic_id,)
            )
            row = cur.fetchone()
            conn.commit()
        conn.close()
        return resp({'message': 'Готово', 'is_pinned': row[0] if row else False})

    # ── POST: закрыть/открыть (админ) ────────────────────────────────
    if action == 'lock_topic':
        if not user['is_admin']:
            conn.close()
            return resp({'error': 'Нет прав'}, 403)
        topic_id = int(body.get('topic_id', 0))
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.forum_topics SET is_locked = NOT is_locked WHERE id = %s RETURNING is_locked",
                (topic_id,)
            )
            row = cur.fetchone()
            conn.commit()
        conn.close()
        return resp({'message': 'Готово', 'is_locked': row[0] if row else False})

    # ── POST: скрыть пост (админ) ─────────────────────────────────────
    if action == 'hide_post':
        if not user['is_admin']:
            conn.close()
            return resp({'error': 'Нет прав'}, 403)
        post_id = int(body.get('post_id', 0))
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE {SCHEMA}.forum_posts SET is_hidden = NOT is_hidden WHERE id = %s RETURNING is_hidden",
                (post_id,)
            )
            row = cur.fetchone()
            conn.commit()
        conn.close()
        return resp({'message': 'Готово', 'is_hidden': row[0] if row else False})

    conn.close()
    return resp({'error': 'Неизвестное действие'}, 400)
