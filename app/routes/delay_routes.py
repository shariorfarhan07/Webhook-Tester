# delay_routes.py
from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse

router = APIRouter()

# Global delay variable
current_delay_ms = 0

@router.post("/api/set_delay")
async def set_delay(delay: int = Form(...)):
    global current_delay_ms
    current_delay_ms = delay
    return JSONResponse({"message": "Delay updated", "delay": current_delay_ms})

@router.get("/api/get_delay")
async def get_delay():
    return JSONResponse({"delay": current_delay_ms})

# Utility function for delay access
def get_current_delay():
    return current_delay_ms
