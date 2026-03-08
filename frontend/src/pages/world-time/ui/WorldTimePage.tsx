import { useState, useEffect } from 'react';
import type { City } from '../../../entities/city/model/types';
import { Header } from '../../../widgets/header/ui/Header';
import { Timeline } from '../../../widgets/city-timeline/ui/Timeline';
import { CityGrid } from '../../../widgets/city-grid/ui/CityGrid';
import { AddCity } from '../../../features/add-city/ui/AddCity';

export const WorldTimePage = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [now, setNow] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Загрузка городов при старте
  useEffect(() => {
    fetch("http://localhost:8000/cities")
      .then(res => res.json())
      .then(data => setCities(data.cities))
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  // Таймер для счетчика активных городов
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Подсчет рабочих городов
  const workingCitiesCount = cities.filter(city => {
    const localHourStr = new Intl.DateTimeFormat('ru-RU', {
      timeZone: city.timezone,
      hour: '2-digit',
    }).format(now);
    const localHour = parseInt(localHourStr, 10);
    return localHour >= 9 && localHour < 18;
  }).length;

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      <Header />
      <main className="px-8 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">World Time</h1>
            <p className="mt-2 text-lg text-gray-500">Track time across cities</p>
            
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
              <span className="font-medium">
                {workingCitiesCount === 1 
                  ? "1 city in working hours" 
                  : `${workingCitiesCount} cities in working hours`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Переключатель вида */}
            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                List
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Grid
              </button>
            </div>

            {/* НАША ФИЧА ДОБАВЛЕНИЯ ГОРОДА */}
            <AddCity onCityAdded={(newCity) => setCities([...cities, newCity])} />
          </div>
        </div>

        {viewMode === 'list' ? (
          <Timeline cities={cities} />
        ) : (
          <CityGrid cities={cities} />
        )}
      </main>
    </div>
  );
};