import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { CityList } from './components/CityList'; 

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
  
  // Состояния для поиска и выпадающего списка
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Загрузка стартовых городов с бэкенда (ВЕРНУЛИ НА МЕСТО!)
  useEffect(() => {
    fetch("http://localhost:8000/cities")
      .then(res => res.json())
      .then(data => setCities(data.cities))
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  // 2. Закрытие списка при клике вне него (Отдельный useEffect)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Поиск через Open-Meteo
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("Ошибка поиска:", e);
    }
  };

  // 4. Единая функция: берет данные из клика и СРАЗУ отправляет на бэк
  const handleSelectAndSaveCity = async (result: SearchResult) => {
    if (!result.timezone) {
      alert("У этого города не указана таймзона в базе!");
      return;
    }

    const newCity = { name: result.name, timezone: result.timezone };

    try {
      // Отправляем на бэкенд
      const response = await fetch("http://localhost:8000/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCity),
      });

      if (response.ok) {
        const addedCity = await response.json();
        setCities([...cities, addedCity]); // Добавляем в список на экране
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }

    // Закрываем и очищаем выпадающее меню
    setIsDropdownOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="px-8 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">World Time</h1>
            <p className="mt-2 text-lg text-gray-500">Track time across cities</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-100 rounded-md text-gray-900">
                List
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
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
                      autoFocus // Автоматически ставит курсор в поле
                    />
                  </div>
                  
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectAndSaveCity(result)} // Вызываем новую функцию
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex justify-between items-center transition-colors"
                      >
                        <span className="font-medium text-sm">{result.name}</span>
                        <span className="text-xs text-gray-400">{result.timezone.split('/')[1] || result.timezone}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
           <CityList cities={cities} />
        </div>
      </main>
    </div>
  );
}

export default App;