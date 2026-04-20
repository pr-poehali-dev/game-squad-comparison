"""
API для игры: сохранение результата и таблица лидеров.
GET  /           — топ-20 лидеров (публично)
POST / action=save — сохранить результат (нужна сессия)
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
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


def get_user(session_id):
    if not session_id:
        return None
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT u.id, u.username FROM {SCHEMA}.sessions s "
                f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
                f"WHERE s.id = %s AND s.expires_at > now()",
                (session_id,)
            )
            row = cur.fetchone()
    finally:
        conn.close()
    return {'id': row[0], 'username': row[1]} if row else None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')

    # GET — таблица лидеров: лучший результат каждого пользователя, топ-20
    if method == 'GET':
        conn = get_conn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT u.username, MAX(gs.score) as best_score, MIN(gs.misses) as best_misses,
                           COUNT(gs.id) as games_played, MAX(gs.created_at) as last_played
                    FROM {SCHEMA}.game_scores gs
                    JOIN {SCHEMA}.users u ON u.id = gs.user_id
                    GROUP BY u.id, u.username
                    ORDER BY best_score DESC, best_misses ASC
                    LIMIT 20
                    """
                )
                rows = cur.fetchall()
        finally:
            conn.close()
        return resp([{
            'username': r[0],
            'best_score': r[1],
            'best_misses': r[2],
            'games_played': r[3],
            'last_played': str(r[4]) if r[4] else '',
        } for r in rows])

    if method != 'POST':
        return resp({'error': 'Метод не поддерживается'}, 405)

    body = json.loads(event.get('body') or '{}')
    headers = event.get('headers') or {}
    session_id = headers.get('X-Session-Id') or headers.get('x-session-id', '')

    user = get_user(session_id)
    if not user:
        return resp({'error': 'Нужно войти в аккаунт'}, 401)

    score = int(body.get('score', 0))
    misses = int(body.get('misses', 0))

    if score < 0 or misses < 0:
        return resp({'error': 'Некорректные данные'}, 400)

    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                f"INSERT INTO {SCHEMA}.game_scores (user_id, score, misses) VALUES (%s, %s, %s) RETURNING id",
                (user['id'], score, misses)
            )
        conn.commit()
    finally:
        conn.close()

    return resp({'ok': True, 'username': user['username'], 'score': score})
