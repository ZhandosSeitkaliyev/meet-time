from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import User # Твой импорт модели

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"], # Разрешаем любые запросы (GET, POST и т.д.)
    allow_headers=["*"],
)
# ------------------------------------------

users = [
    User(id=1, name="Sam", timezone="America/Los_Angeles"),
    User(id=2, name="Maria", timezone="Europe/London"),
]

@app.get("/users")
def get_users():
    return {"users": users}