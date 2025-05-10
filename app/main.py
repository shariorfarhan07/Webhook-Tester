# app/main.py
from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from app.routes import webhook_routes  # Import the router only
from app.routes.home_routes import router as home_router
from app.routes import delay_routes
from app.routes.delay_routes import router as delay_router
from app.routes.response_routes import router as response_router

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(webhook_routes.router)  # Use just the router
app.include_router(home_router)  # Use just the router

app.include_router(delay_routes.router)
app.include_router(delay_router)
app.include_router(response_router)