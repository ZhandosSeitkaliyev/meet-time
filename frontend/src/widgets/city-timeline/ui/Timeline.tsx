// src/widgets/city-timeline/ui/Timeline.tsx
import { useState, useEffect } from 'react';
import { getUtcOffsetString } from '../../../shared/lib/time';
import { ClockIcon } from '../../../shared/ui/icons';
import { getTimeOfDayInfo } from '../../../entities/city/model/types';
import type { City } from '../../../entities/city/model/types';

interface City {
  id: number;
  name: string;
  timezone: string;
}




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