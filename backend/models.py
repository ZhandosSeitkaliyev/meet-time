from pydantic import BaseModel

class City(BaseModel):
    id: int
    name: str       # Например: "Tokyo"
    timezone: str   # Например: "Asia/Tokyo"

# То, что мы получаем от кнопки "+ Add city"
class CityCreate(BaseModel):
    name: str
    timezone: str

class ParticipantCreate(BaseModel):
    name: str
    cityName: str
    timezone: str

class Participant(ParticipantCreate):
    id: int