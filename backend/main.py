from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import City, CityCreate # Импортируем новые модели

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cities = [
    City(id=1, name="Astana", timezone="Asia/Almaty"),
    City(id=2, name="London", timezone="Europe/London"),
    City(id=3, name="New York", timezone="America/New_York"),
]

@app.get("/cities")
def get_cities():
    return {"cities": cities}

@app.post("/cities")
def add_city(city: CityCreate):
    # Генерируем новый ID
    new_id = max([c.id for c in cities], default=0) + 1
    # Создаем и сохраняем новый город
    new_city = City(id=new_id, name=city.name, timezone=city.timezone)
    cities.append(new_city)
    return new_city