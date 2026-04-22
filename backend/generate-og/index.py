"""Генерирует OG-изображение: скачивает фон и рисует текст поверх, сохраняет в S3."""
import json
import os
import io
import urllib.request
from PIL import Image, ImageDraw, ImageFont
import boto3

BG_URL = "https://cdn.poehali.dev/projects/455c24fb-ce5d-4076-9543-1ca6ad6daa72/files/bc64c8ff-e594-4b91-a929-4d8e2a056641.jpg"
OUTPUT_KEY = "og-horugnv-final.jpg"

# PT Serif поддерживает кириллицу, прямые ссылки на gstatic
FONT_BOLD_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl/ptserif/PT_Serif-Web-Bold.ttf"
FONT_REG_URL  = "https://raw.githubusercontent.com/google/fonts/main/ofl/ptserif/PT_Serif-Web-Regular.ttf"


def download_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": ""}

    bg_data = download_bytes(BG_URL)
    img = Image.open(io.BytesIO(bg_data)).convert("RGB")
    w, h = img.size

    draw = ImageDraw.Draw(img)

    font_title = ImageFont.truetype(io.BytesIO(download_bytes(FONT_BOLD_URL)), size=int(h * 0.17))
    font_sub   = ImageFont.truetype(io.BytesIO(download_bytes(FONT_REG_URL)),  size=int(h * 0.07))

    title    = "ХОРУГВЬ"
    subtitle = "Каталог отрядов"

    cx = int(w * 0.68)
    cy = int(h * 0.42)

    for dx, dy, color in [(4, 4, (0, 0, 0)), (0, 0, (255, 210, 100))]:
        draw.text((cx + dx, cy + dy), title, font=font_title, fill=color, anchor="mm")

    sub_y = cy + int(h * 0.22)
    for dx, dy, color in [(2, 2, (0, 0, 0)), (0, 0, (220, 200, 170))]:
        draw.text((cx + dx, sub_y + dy), subtitle, font=font_sub, fill=color, anchor="mm")

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    buf.seek(0)

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