"""
Загрузка изображений для авторизованных пользователей (аватары, обложки тем).
POST / — {file: base64, content_type, folder}
"""
import json, os, base64, uuid
import psycopg2
import boto3

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}
ALLOWED_TYPES = {'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif'}
MAX_SIZE = 5 * 1024 * 1024


def ok(data, status=200):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False)}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user(session_id, conn):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.id = %s AND s.expires_at > now()", (session_id,)
        )
        row = cur.fetchone()
        return {'id': row[0]} if row else None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    session_id = (event.get('headers') or {}).get('X-Session-Id', '').strip()
    conn = get_conn()
    user = get_user(session_id, conn)
    conn.close()

    if not user:
        return ok({'error': 'Не авторизован'}, 401)

    body = json.loads(event.get('body') or '{}')
    file_data = body.get('file', '')
    content_type = body.get('content_type', 'image/jpeg')
    folder = body.get('folder', 'user-uploads')

    # Безопасный folder (только разрешённые)
    allowed_folders = {'user-avatars', 'forum-covers', 'user-uploads'}
    if folder not in allowed_folders:
        folder = 'user-uploads'

    if content_type not in ALLOWED_TYPES:
        return ok({'error': 'Неподдерживаемый тип файла'}, 400)

    if ',' in file_data:
        file_data = file_data.split(',', 1)[1]

    try:
        file_bytes = base64.b64decode(file_data)
    except Exception:
        return ok({'error': 'Ошибка декодирования'}, 400)

    if len(file_bytes) > MAX_SIZE:
        return ok({'error': 'Файл слишком большой (максимум 5 МБ)'}, 400)

    ext = ALLOWED_TYPES[content_type]
    filename = f"{folder}/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev',
                      aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    s3.put_object(Bucket='files', Key=filename, Body=file_bytes, ContentType=content_type)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
    return ok({'url': cdn_url})
