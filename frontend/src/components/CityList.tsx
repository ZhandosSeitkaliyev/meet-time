interface City {
  id: number;
  name: string;
  timezone: string;
}

// Компонент просто принимает готовый массив городов (cities) из App.tsx
export const CityList = ({ cities }: { cities: City[] }) => {
  return (
    <div className="max-w-md mt-6 space-y-3">
      {cities.map(city => (
        <div 
          key={city.id} 
          className="flex items-center justify-between p-4 text-gray-800 bg-white border border-gray-100 rounded-lg shadow-sm"
        >
          <span className="text-lg font-bold">{city.name}</span>
          <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded">
            {city.timezone}
          </span>
        </div>
      ))}
    </div>
  );
};