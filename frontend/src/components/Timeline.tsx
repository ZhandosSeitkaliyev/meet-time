import { useState, useEffect } from 'react';

interface City {
  id: number;
  name: string;
  timezone: string;
}

// Вспомогательная функция для UTC (например, UTC+5)
const getUtcOffsetString = (timezone: string) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value.replace('GMT', 'UTC') : '';
  } catch (e) {
    return '';
  }
};

// --- ИКОНКИ ДЛЯ БЕЙДЖЕЙ ---
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

// Логика определения времени суток (цвета и иконки как в твоем Figma)
const getTimeOfDayInfo = (hour: number) => {
  if (hour >= 6 && hour < 12) return { label: 'Morning', colors: 'text-yellow-600 bg-yellow-50', Icon: SunIcon };
  if (hour >= 12 && hour < 18) return { label: 'Afternoon', colors: 'text-orange-600 bg-orange-50', Icon: SunIcon };
  if (hour >= 18 && hour < 22) return { label: 'Evening', colors: 'text-purple-600 bg-purple-50', Icon: MoonIcon };
  return { label: 'Night', colors: 'text-blue-500 bg-blue-50', Icon: MoonIcon };
};


export const Timeline = ({ cities }: { cities: City[] }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Создаем массив из 24 часов: от 12 часов назад до 11 часов вперед.
  // Таким образом, текущий час (смещение 0) всегда будет ровно в середине!
  const offsets = Array.from({ length: 24 }, (_, i) => i - 12);

  // Вычисляем позицию линии NOW внутри центрального блока
  const currentMinute = now.getMinutes();
  const nowPercent = ((12 + currentMinute / 60) / 24) * 100;

  return (
    <div className="relative pt-8 mt-2">
      
      {/* ЧЕРНАЯ ЛИНИЯ NOW (Нависает над всем блоком) */}
      {/* 13rem - это отступ слева (padding + ширина блока с названием города) */}
      {/* 11rem - это отступ справа (ширина блока со статусами) */}
      <div 
        className="absolute bottom-0 z-20 w-px bg-gray-900 pointer-events-none top-4"
        style={{ left: `calc(13rem + (100% - 13rem - 11rem) * ${nowPercent / 100})` }}
      >
        <div className="absolute px-3 py-1 text-[10px] font-bold tracking-widest text-white -translate-x-1/2 bg-gray-900 rounded-full -top-4">
          NOW
        </div>
      </div>

      {/* ШКАЛА ВРЕМЕНИ СВЕРХУ */}
      <div className="flex w-full px-4 mb-3">
        {/* Пустой блок-прокладка слева, чтобы выровнять цифры ровно над сеткой */}
        <div className="flex-shrink-0 w-48"></div>
        <div className="relative flex justify-between flex-1 text-xs font-semibold text-gray-400">
          {offsets.map((offset) => {
            const d = new Date(now);
            d.setHours(now.getHours() + offset);
            const h = d.getHours();
            return (
              <div key={offset} className="flex justify-center flex-1">
                 {/* Показываем часы каждые 2 часа, как у тебя в макете */}
                 {offset % 2 === 0 ? String(h).padStart(2, '0') : ''}
              </div>
            );
          })}
        </div>
        <div className="flex-shrink-0 w-40"></div>
      </div>

      {/* ГЛАВНЫЙ КОНТЕЙНЕР КАРТОЧЕК */}
      <div className="relative py-2 bg-white border border-gray-200 shadow-sm rounded-xl">
        
        {cities?.length > 0 ? (
          cities.map((city) => {
            // Узнаем, какое сейчас точное местное время в этом городе
            const localTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
              timeZone: city.timezone,
              hour: '2-digit',
              minute: '2-digit',
            });
            const localTimeStr = localTimeFormatter.format(now);
            const currentLocalHour = parseInt(localTimeStr.split(':')[0], 10);
            
            // Данные для бейджей
            const timeOfDay = getTimeOfDayInfo(currentLocalHour);
            const isWorkingHourNow = currentLocalHour >= 9 && currentLocalHour < 18;

            return (
              <div key={city.id} className="flex items-center w-full px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                
                {/* 1. Блок Информации (Слева) */}
                <div className="flex items-center justify-between flex-shrink-0 w-48 pr-6">
                  <div>
                    <div className="font-semibold text-gray-900">{city.name}</div>
                    <div className="mt-0.5 text-xs text-gray-400">{getUtcOffsetString(city.timezone)}</div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{localTimeStr}</div>
                </div>

                {/* 2. Сетка Таймлайна (По центру) */}
                <div className="relative flex flex-1 h-5 overflow-hidden rounded-md bg-gray-50 border border-gray-100">
                  {offsets.map((offset) => {
                    // Узнаем локальный час в городе для конкретной ячейки
                    const cellDate = new Date(now);
                    cellDate.setHours(now.getHours() + offset);
                    const cellHourStr = new Intl.DateTimeFormat('ru-RU', {
                      timeZone: city.timezone,
                      hour: '2-digit',
                    }).format(cellDate);
                    const cellHour = parseInt(cellHourStr, 10);
                    
                    // Жесткое правило: только 9-18 красятся
                    const isWorkingCell = cellHour >= 9 && cellHour < 18;

                    return (
                      <div 
                        key={offset} 
                        className={`flex-1 border-r border-white/60 last:border-0 ${isWorkingCell ? 'bg-green-400' : 'bg-gray-200'}`}
                        title={`${cellHourStr}:00 местное время`}
                      ></div>
                    );
                  })}
                </div>

                {/* 3. Статус Бейджики (Справа) */}
                <div className="flex items-center justify-end flex-shrink-0 w-40 pl-5 gap-2.5">
                  
                  {/* Бейдж времени суток (Утро/День/Вечер/Ночь) */}
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${timeOfDay.colors}`}>
                     <timeOfDay.Icon />
                     {timeOfDay.label}
                  </span>

                  {/* Бейдж In / Out */}
                  {isWorkingHourNow ? (
                     <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full shadow-sm">
                       <ClockIcon />
                       In
                     </span>
                  ) : (
                     <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full shadow-sm">
                       <ClockIcon />
                       Out
                     </span>
                  )}

                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-gray-500">
            Нет добавленных городов. Нажмите «+ Add city», чтобы начать!
          </div>
        )}
      </div>
    </div>
  );
};