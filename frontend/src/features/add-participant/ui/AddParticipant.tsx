import { useState, useRef, useEffect } from 'react';
import type { Participant } from '../../../entities/participant/model/types';

interface SearchResult {
  id: number;
  name: string;
  country: string;
  timezone: string;
}

export const AddParticipant = ({ onParticipantAdded }: { onParticipantAdded: (participant: Participant) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<SearchResult | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Поиск городов (API Open-Meteo)
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedCity(null); // Сбрасываем выбранный город, если юзер начал печатать заново
    
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

  const handleSelectCity = (result: SearchResult) => {
    setSelectedCity(result);
    setSearchQuery(`${result.name} (${result.timezone})`);
    setSearchResults([]);
  };

const handleAddSubmit = async () => {
    if (!personName.trim()) return alert("Please enter a name");
    if (!selectedCity) return alert("Please select a valid city from the list");

    // Формируем данные для отправки на бэк (без ID)
    const newPersonData = {
      name: personName.trim(),
      cityName: selectedCity.name,
      timezone: selectedCity.timezone,
    };

    try {
      // Отправляем POST запрос
      const response = await fetch("http://localhost:8000/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPersonData),
      });

      if (response.ok) {
        // Бэкенд вернул нам готового участника с присвоенным ID
        const addedParticipant = await response.json();
        onParticipantAdded(addedParticipant); // Добавляем на экран
      }
    } catch (error) {
      console.error("Ошибка при сохранении участника:", error);
    }

    // Очищаем форму и закрываем модалку
    setPersonName("");
    setSearchQuery("");
    setSelectedCity(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Главная кнопка открытия модалки */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
      >
        + Add person
      </button>

      {/* Оверлей (Темный фон) и Само окно */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">Add participant</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="mb-6 text-sm text-gray-500">Add a meeting participant with their city/timezone.</p>

            <div className="space-y-4">
              {/* Инпут Имени */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-900">Name</label>
                <input 
                  type="text" 
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Elena"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:bg-white"
                  autoFocus
                />
              </div>

              {/* Инпут Города с выпадающим списком */}
              <div className="relative" ref={dropdownRef}>
                <label className="block mb-1.5 text-sm font-medium text-gray-900">City / Timezone</label>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type city name..."
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto py-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectCity(result)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex justify-between items-center"
                      >
                        <span className="font-medium text-sm text-gray-900">{result.name}, {result.country}</span>
                        <span className="text-xs text-gray-400">{result.timezone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600"
              >
                Add participant
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};