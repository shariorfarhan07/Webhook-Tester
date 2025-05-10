from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.config import templates
from app.services.webhook_service import get_webhooks

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    webhooks = get_webhooks()
    return templates.TemplateResponse("index.html", {"request": request, "webhooks": webhooks})