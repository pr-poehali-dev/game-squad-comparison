"""Генерирует OG-изображение: скачивает фон и рисует текст поверх, сохраняет в S3."""
import json
import os
import io
import urllib.request
from PIL import Image, ImageDraw, ImageFont
import boto3

BG_URL = "https://cdn.poehali.dev/projects/455c24fb-ce5d-4076-9543-1ca6ad6daa72/files/bc64c8ff-e594-4b91-a929-4d8e2a056641.jpg"
OUTPUT_KEY = "og-horugnv-final.jpg"


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": ""}

    # Скачиваем фон
    with urllib.request.urlopen(BG_URL) as resp:
        bg_data = resp.read()

    img = Image.open(io.BytesIO(bg_data)).convert("RGB")
    w, h = img.size

    draw = ImageDraw.Draw(img)

    # Шрифт — используем дефолтный, т.к. кастомные шрифты недоступны в cloud
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", size=int(h * 0.18))
        font_sub   = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",     size=int(h * 0.07))
    except Exception:
        font_title = ImageFont.load_default()
        font_sub   = ImageFont.load_default()

    title = "ХОРУГВЬ"
    subtitle = "Каталог отрядов"

    # Позиция — правая половина по центру
    cx = int(w * 0.68)
    cy = int(h * 0.42)

    # Тень для читаемости
    shadow_offset = 4
    draw.text((cx + shadow_offset, cy + shadow_offset), title, font=font_title, fill=(0, 0, 0, 180), anchor="mm")
    draw.text((cx, cy), title, font=font_title, fill=(255, 210, 100), anchor="mm")

    # Подзаголовок
    sub_y = cy + int(h * 0.20)
    draw.text((cx + 2, sub_y + 2), subtitle, font=font_sub, fill=(0, 0, 0, 160), anchor="mm")
    draw.text((cx, sub_y), subtitle, font=font_sub, fill=(220, 200, 170), anchor="mm")

    # Сохраняем в буфер
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    buf.seek(0)

    # Загружаем в S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(Bucket="files", Key=OUTPUT_KEY, Body=buf.read(), ContentType="image/jpeg")

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{OUTPUT_KEY}"

    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        "body": json.dumps({"url": cdn_url}),
    }
