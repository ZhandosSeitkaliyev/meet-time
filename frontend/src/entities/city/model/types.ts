// src/entities/city/model/types.ts

export interface City {
  id: number;
  name: string;
  timezone: string;
}

// Эту функцию мы тоже переносим сюда, так как она возвращает данные, 
// зависящие от иконок и логики статусов города.
import { SunIcon, MoonIcon } from '../../../shared/ui/icons';

export const getTimeOfDayInfo = (hour: number) => {
  if (hour >= 6 && hour < 12) return { label: 'Morning', colors: 'text-yellow-600 bg-yellow-50', Icon: SunIcon };
  if (hour >= 12 && hour < 18) return { label: 'Afternoon', colors: 'text-orange-600 bg-orange-50', Icon: SunIcon };
  if (hour >= 18 && hour < 22) return { label: 'Evening', colors: 'text-purple-600 bg-purple-50', Icon: MoonIcon };
  return { label: 'Night', colors: 'text-blue-500 bg-blue-50', Icon: MoonIcon };
};