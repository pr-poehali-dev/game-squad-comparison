"""
Загрузка изображений в S3. Принимает base64-encoded файл, сохраняет в S3, возвращает CDN URL.
Только для авторизованных администраторов.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}

ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
}

MAX_SIZE = 5 * 1024 * 1024  # 5 MB


def json_response(data, status=200):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_session_user(session_id, conn):
    if not session_id:
        return None
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT u.id, u.is_admin FROM {SCHEMA}.sessions s "
            f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.id = %s AND s.expires_at > now()",
            (session_id,)
        )
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'is_admin': row[1]}
    return None


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    session_id = (event.get('headers') or {}).get('X-Session-Id', '').strip()

    conn = get_conn()
    user = get_session_user(session_id, conn)
    conn.close()

    if not user or not user['is_admin']:
        return json_response({'error': 'Требуются права администратора'}, 403)

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    file_data = body.get('file')
    content_type = body.get('content_type', 'image/jpeg')
    folder = body.get('folder', 'avatars')

    if not file_data:
        return json_response({'error': 'Файл не передан'}, 400)

    if content_type not in ALLOWED_TYPES:
        return json_response({'error': f'Неподдерживаемый тип файла: {content_type}'}, 400)

    # Декодируем base64
    if ',' in file_data:
        file_data = file_data.split(',', 1)[1]

    try:
        file_bytes = base64.b64decode(file_data)
    except Exception:
        return json_response({'error': 'Ошибка декодирования файла'}, 400)

    if len(file_bytes) > MAX_SIZE:
        return json_response({'error': 'Файл слишком большой (максимум 5 МБ)'}, 400)

    ext = ALLOWED_TYPES[content_type]
    filename = f"{folder}/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    s3.put_object(
        Bucket='files',
        Key=filename,
        Body=file_bytes,
        ContentType=content_type,
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"

    return json_response({'url': cdn_url, 'filename': filename})
