import json
from datetime import datetime
from fastapi import Request
from typing import List, Dict, Any
from app.utils.file_utils import read_json, write_json


def get_webhooks() -> List[Dict[str, Any]]:
    return read_json("webhooks.json")


def save_webhooks(webhooks: List[Dict[str, Any]]) -> None:
    write_json("webhooks.json", webhooks)


async def create_webhook_data(request: Request) -> Dict[str, Any]:
    body = await request.body()
    try:
        payload = json.loads(body)
        content_type = "application/json"
    except:
        payload = body.decode("utf-8")
        content_type = "text/plain"

    return {
        "id": len(get_webhooks()) + 1,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "content_type": content_type,
        "headers": dict(request.headers),
        "payload": payload
    }
