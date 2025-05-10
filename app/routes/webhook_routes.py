import time
import json
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from app.services.webhook_service import get_webhooks, save_webhooks, create_webhook_data
from app.websockets.connection_manager import manager
from app.routes.delay_routes import get_current_delay
from app.routes.response_routes import get_current_response_settings

router = APIRouter()



@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_json({"type": "initial_data", "webhooks": get_webhooks()})
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.post("/webhook")
async def webhook(request: Request):
    # Apply configured delay
    time.sleep(get_current_delay() / 1000)

    # Process and save webhook data
    webhook_data = await create_webhook_data(request)
    webhooks = get_webhooks()
    webhooks.append(webhook_data)
    save_webhooks(webhooks)

    # Notify clients about the new webhook
    await manager.broadcast({"type": "new_webhook", "webhook": webhook_data})

    # Get custom status code and response
    status_code, response_body = get_current_response_settings()

    # Return custom response with custom status code
    return JSONResponse(content=response_body, status_code=status_code)


@router.get("/api/webhooks")
async def get_all():
    return get_webhooks()


@router.post("/api/clear")
async def clear():
    save_webhooks([])
    await manager.broadcast({"type": "clear_webhooks"})
    return {"status": "success", "message": "All webhooks cleared"}