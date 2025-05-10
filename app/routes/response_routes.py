# app/routes/response_routes.py
from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
import json

router = APIRouter()

# Global variables for response settings
current_status_code = 200
current_response = '{"message": "Webhook received", "status": "success"}'

@router.post("/api/set_status_code")
async def set_status_code(status_code: int = Form(...)):
    global current_status_code
    # Validate status code is in acceptable range
    if 100 <= status_code <= 599:
        current_status_code = status_code
        return JSONResponse({"message": "Status code updated", "status_code": current_status_code})
    else:
        return JSONResponse({"error": "Invalid status code"}, status_code=400)

@router.get("/api/get_status_code")
async def get_status_code():
    return JSONResponse({"status_code": current_status_code})

@router.post("/api/set_response")
async def set_response(response: str = Form(...)):
    global current_response
    # Validate JSON
    try:
        json.loads(response)  # Just to validate
        current_response = response
        return JSONResponse({"message": "Response updated", "response": current_response})
    except json.JSONDecodeError:
        return JSONResponse({"error": "Invalid JSON format"}, status_code=400)

@router.get("/api/get_response")
async def get_response():
    return JSONResponse({"response": current_response})

# Utility function to get current response settings
def get_current_response_settings():
    try:
        response_json = json.loads(current_response)
        return current_status_code, response_json
    except json.JSONDecodeError:
        # Return a default response if invalid JSON
        return current_status_code, {"message": "Webhook received", "status": "success"}