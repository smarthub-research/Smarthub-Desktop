from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, db
from constants import ALLOWED_ORIGINS, API_HOST, API_PORT

app = FastAPI()

app.include_router(auth.router)
app.include_router(db.router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)