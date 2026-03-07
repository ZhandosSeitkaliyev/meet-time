import { useState, useEffect } from 'react';

interface City {
  id: number;
  name: string;
  timezone: string;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ИКОНКИ ---
// (Такие же, как в Timeline, чтобы компонент был независимым)
const getUtcOffsetString = (timezone: string) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'shortOffset' });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value.replace('GMT', 'UTC') : '';
  } catch (e) {
    return '';
  }
};

const SunIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const getTimeOfDayInfo = (hour: number) => {
  if (hour >= 6 && hour < 12) return { label: 'Morning', colors: 'text-yellow-600 bg-yellow-50', Icon: SunIcon };
  if (hour >= 12 && hour < 18) return { label: 'Afternoon', colors: 'text-orange-600 bg-orange-50', Icon: SunIcon };
  if (hour >= 18 && hour < 22) return { label: 'Evening', colors: 'text-purple-600 bg-purple-50', Icon: MoonIcon };
  return { label: 'Night', colors: 'text-blue-500 bg-blue-50', Icon: MoonIcon };
};

export const CityGrid = ({ cities }: { cities: City[] }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const baseHours = Array.from({ length: 24 }, (_, i) => i);

  if (!cities || cities.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Нет добавленных городов. Нажмите «+ Add city», чтобы начать!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => {
        // Форматируем время и узнаем день недели (для выходных)
        const localFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          weekday: 'short',
        });
        const parts = localFormatter.formatToParts(now);
        const localHourStr = parts.find((p) => p.type === 'hour')?.value || '00';
        const localMinuteStr = parts.find((p) => p.type === 'minute')?.value || '00';
        const weekday = parts.find((p) => p.type === 'weekday')?.value;

        const currentLocalHour = parseInt(localHourStr, 10);
        const currentLocalMinute = parseInt(localMinuteStr, 10);
        
        // Логика статусов
        const isWorkingHourNow = currentLocalHour >= 9 && currentLocalHour < 18;
        const isWeekend = weekday === 'Sat' || weekday === 'Sun'; // Проверка на выходные
        const timeOfDay = getTimeOfDayInfo(currentLocalHour);
        
        // Позиция ползунка на мини-таймлайне (%)
        const nowPercent = ((currentLocalHour * 60 + currentLocalMinute) / (24 * 60)) * 100;

        return (
          <div key={city.id} className="p-6 transition-shadow bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
            
            {/* Шапка: Город и UTC */}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{city.name}</h3>
              <p className="mt-0.5 text-xs text-gray-400">{getUtcOffsetString(city.timezone)}</p>
            </div>

            {/* Огромные часы */}
            <div className="mt-4 mb-4 text-5xl font-bold tracking-tight text-gray-900">
              {localHourStr}:{localMinuteStr}
            </div>

            {/* Бейджи статусов */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${timeOfDay.colors}`}>
                <timeOfDay.Icon />
                {timeOfDay.label}
              </span>
              <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${isWorkingHourNow ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                <ClockIcon />
                {isWorkingHourNow ? 'Working hours' : 'Outside working hours'}
              </span>
            </div>

            {/* Статус рабочего дня */}
            <div className="mb-2 text-xs font-medium text-gray-400">
              {isWeekend ? 'Outside working days' : 'Working day'}
            </div>

            {/* Мини-таймлайн с ползунком */}
            <div className="relative mt-2">
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-sm">
                {baseHours.map((hour) => (
                  <div
                    key={hour}
                    className={`flex-1 ${hour >= 9 && hour < 18 ? 'bg-blue-300' : 'bg-blue-100'}`}
                  ></div>
                ))}
              </div>

              {/* Черный маркер (Пин) текущего времени */}
              <div 
                className="absolute top-0 bottom-0 z-10 w-px bg-gray-900 pointer-events-none"
                style={{ left: `${nowPercent}%` }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rounded-full top-[-6px]"></div>
                <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-900 top-[-2px]"></div>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};