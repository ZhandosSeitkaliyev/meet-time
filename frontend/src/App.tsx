import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline'; 
import { CityGrid } from './components/CityGrid';

interface City {
  id: number;
  name: string;
  timezone: string;
}

interface SearchResult {
  id: number;
  name: string;
  country: string;
  timezone: string;
}

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [now, setNow] = useState(new Date()); // Добавили стейт времени для счетчика
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Состояния для поиска и выпадающего списка
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Загрузка стартовых городов с бэкенда
  useEffect(() => {
    fetch("http://localhost:8000/cities")
      .then(res => res.json())
      .then(data => setCities(data.cities))
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  // 2. Таймер для счетчика: обновляет `now` каждую минуту
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 3. Закрытие списка при клике вне него
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Поиск через Open-Meteo
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("Ошибка поиска:", e);
    }
  };

  // 5. Сохранение города
  const handleSelectAndSaveCity = async (result: SearchResult) => {
    if (!result.timezone) {
      alert("У этого города не указана таймзона в базе!");
      return;
    }

    const newCity = { name: result.name, timezone: result.timezone };

    try {
      const response = await fetch("http://localhost:8000/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCity),
      });

      if (response.ok) {
        const addedCity = await response.json();
        setCities([...cities, addedCity]); 
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }

    setIsDropdownOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // --- ЛОГИКА СЧЕТЧИКА АКТИВНЫХ ГОРОДОВ ---
  const workingCitiesCount = cities.filter(city => {
    const localHourStr = new Intl.DateTimeFormat('ru-RU', {
      timeZone: city.timezone,
      hour: '2-digit',
    }).format(now);
    const localHour = parseInt(localHourStr, 10);
    return localHour >= 9 && localHour < 18;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="px-8 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          
          {/* Левый блок с Заголовками и новым счетчиком */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">World Time</h1>
            <p className="mt-2 text-lg text-gray-500">Track time across cities</p>
            
            {/* НОВЫЙ ИНДИКАТОР РАБОЧЕГО ВРЕМЕНИ */}
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
              <span className="font-medium">
                {workingCitiesCount === 1 
                  ? "1 city in working hours" 
                  : `${workingCitiesCount} cities in working hours`}
              </span>
            </div>
          </div>
          
          {/* Правый блок с кнопками */}
          <div className="flex items-center gap-4">
            
            {/* КНОПКИ ПЕРЕКЛЮЧЕНИЯ ВИДА */}
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

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                + Add city
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={searchQuery}
                      placeholder="Search city..."
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                      autoFocus
                    />
                  </div>
                  
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectAndSaveCity(result)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex justify-between items-center transition-colors"
                      >
                        <span className="font-medium text-sm text-gray-900">
                          {result.name}, <span className="font-normal text-gray-500">{result.country}</span>
                        </span>
                        <span className="text-xs text-gray-400">{result.timezone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* УМНЫЙ РЕНДЕР: Показываем либо Линейку, либо Сетку */}
        {viewMode === 'list' ? (
          <Timeline cities={cities} />
        ) : (
          <CityGrid cities={cities} />
        )}
      </main>
    </div>
  );
}

export default App;