from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import City, CityCreate, Participant, ParticipantCreate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cities = []

participants = []

# РОУТЫ ДЛЯ ГОРОДОВ

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

# РОУТЫ ДЛЯ УЧАСТНИКОВ
@app.get("/participants")
def get_participants():
    return {"participants": participants}

@app.post("/participants")
def add_participant(participant: ParticipantCreate):
    new_id = max([p.id for p in participants], default=0) + 1
    new_participant = Participant(
        id=new_id, 
        name=participant.name, 
        cityName=participant.cityName, 
        timezone=participant.timezone
    )
    participants.append(new_participant)
    return new_participant


@app.delete("/cities/{city_id}")
def delete_city(city_id: int):
    global cities
    # Перезаписываем список, оставляя только те города, чей ID не совпадает с удаляемым
    cities = [c for c in cities if c.id != city_id]
    return {"message": f"City {city_id} deleted"}

@app.delete("/participants/{participant_id}")
def delete_participant(participant_id: int):
    global participants
    participants = [p for p in participants if p.id != participant_id]
    return {"message": f"Participant {participant_id} deleted"}