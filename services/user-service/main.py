from fastapi import FastAPI
from app.api.routes import router
from app.logger import log
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Agro-Price API - User Service",
    description="User Authentication and management",
    version="1.0.0"
)

# Configure CORS - MUST be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    expose_headers=["Content-Length", "X-Request-ID"],
    max_age=3600,
)

# Add OPTIONS handler for all routes
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {}

app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "User Service is running"}

if __name__ == "__main__":
    import uvicorn
    log.info("Starting User Service on Port 3001")
    uvicorn.run(app, host="0.0.0.0", port=3001)