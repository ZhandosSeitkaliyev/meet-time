import { useState, useRef, useEffect } from 'react';
import type { City } from '../../../entities/city/model/types';

interface SearchResult {
  id: number;
  name: string;
  country: string;
  timezone: string;
}

// Компонент принимает функцию, чтобы сказать странице: "Эй, я добавил новый город!"
export const AddCity = ({ onCityAdded }: { onCityAdded: (city: City) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Поиск через Open-Meteo
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

  // Сохранение города на бэкенд
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
        onCityAdded(addedCity); // Передаем добавленный город наверх
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }

    setIsDropdownOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
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
  );
};