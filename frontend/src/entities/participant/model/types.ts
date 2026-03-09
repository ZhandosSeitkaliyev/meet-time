// src/entities/participant/model/types.ts

export interface Participant {
  id: number;
  name: string;  
  cityName: string;
  timezone: string;  // Часовой пояс (например, "Europe/Berlin")
}