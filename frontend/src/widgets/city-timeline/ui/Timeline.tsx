import { useState, useEffect, useRef } from 'react';
import { getUtcOffsetString } from '../../../shared/lib/time';
import { ClockIcon, TrashIcon } from '../../../shared/ui/icons';
import { getTimeOfDayInfo } from '../../../entities/city/model/types';
import type { City } from '../../../entities/city/model/types';

export const Timeline = ({ cities, onDelete }: { cities: City[], onDelete: (id: number) => void }) => {
  const [now, setNow] = useState(new Date());

  // --- СОСТОЯНИЯ ДЛЯ HOVER и CLICK (Probe) ---
  const [probeOffset, setProbeOffset] = useState<number | null>(null); // Временный сдвиг при наведении
  const [pinnedOffset, setPinnedOffset] = useState<number | null>(null); // Зафиксированный сдвиг по клику

  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Обновление текущего времени
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Клик ВНЕ зоны таймлайна сбрасывает закрепление (Pinned)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPinnedOffset(null);
        setProbeOffset(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Высчитываем сдвиг мыши с шагом в 10 минут
  const calculateOffsetMinutes = (clientX: number): number | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();

    // Если курсор вышел за пределы самой сетки (навел на города или бейджи) -> прячем
    if (clientX < rect.left || clientX > rect.right) {
      return null;
    }

    const x = clientX - rect.left;
    const percent = x / rect.width;
    const rawMinutesFromLeft = percent * (24 * 60);
    const snappedMinutesFromLeft = Math.round(rawMinutesFromLeft / 10) * 10; // ШАГ 10 МИНУТ
    const nowMinutesFromLeft = (12 * 60) + now.getMinutes();

    return snappedMinutesFromLeft - nowMinutesFromLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (pinnedOffset !== null) return; // Если закрепили кликом, ховер не работает
    setProbeOffset(calculateOffsetMinutes(e.clientX));
  };

  const handleMouseLeave = () => {
    if (pinnedOffset !== null) return; // Если закреплено, не прячем при уходе мыши
    setProbeOffset(null);
  };

  const handleGridClick = (e: React.MouseEvent) => {
    const offset = calculateOffsetMinutes(e.clientX);
    if (offset !== null) {
      // Клик по сетке - закрепляем (или переносим закрепление на новое место)
      setPinnedOffset(offset);
      setProbeOffset(offset);
    }
  };

  // Вычисляем активный сдвиг (закрепленный или от наведения)
  const activeOffsetMinutes = pinnedOffset !== null ? pinnedOffset : probeOffset;
  const isProbeActive = activeOffsetMinutes !== null;

  // Математика NOW и PROBE
  const offsets = Array.from({ length: 24 }, (_, i) => i - 12);
  const nowMinutesFromLeft = (12 * 60) + now.getMinutes();
  const nowPercent = (nowMinutesFromLeft / 1440) * 100;
  
  // Безопасный расчет позиции для ползунка PROBE
  const probePercent = isProbeActive ? (((nowMinutesFromLeft + activeOffsetMinutes!) / 1440) * 100) : 0;

  return (
    <div className="relative pt-8 mt-2 select-none" ref={containerRef}>
      
      {/* ЧЕРНАЯ ЛИНИЯ: NOW */}
      <div 
        className="absolute bottom-0 z-20 w-px bg-gray-900 pointer-events-none top-4"
        style={{ left: `calc(13rem + (100% - 26rem) * ${nowPercent / 100})` }}
      >
        <div className="absolute px-3 py-1 text-[10px] font-bold tracking-widest text-white -translate-x-1/2 bg-gray-900 rounded-full -top-4">
          NOW
        </div>
      </div>

      {/* СИНЯЯ ЛИНИЯ: PROBE (Появляется только при наведении или клике) */}
      {isProbeActive && (
        <div 
          className="absolute bottom-0 z-30 flex justify-center w-6 ml-[-12px] top-4 pointer-events-none transition-all duration-75"
          style={{ left: `calc(13rem + (100% - 26rem) * ${Math.max(0, Math.min(100, probePercent)) / 100})` }}
        >
          {/* Линия (ярче, если зафиксирована кликом) */}
          <div className={`w-px h-full ${pinnedOffset !== null ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-blue-400'}`}></div>
          <div className={`absolute px-3 py-0.5 text-[10px] font-bold tracking-widest border rounded-full shadow-sm -top-4 ${pinnedOffset !== null ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-500 border-blue-300'}`}>
            PROBE
          </div>
        </div>
      )}

      {/* ШКАЛА ВРЕМЕНИ СВЕРХУ */}
      <div className="flex w-full px-4 mb-3">
        <div className="flex-shrink-0 w-48 pr-6"></div>
        {/* Ref сетки для вычисления координат */}
        <div className="relative flex justify-between flex-1 text-xs font-semibold text-gray-400" ref={gridRef}>
          {offsets.map((offset) => {
            const d = new Date(now);
            d.setHours(now.getHours() + offset);
            const h = d.getHours();
            return (
              <div key={offset} className="flex justify-center flex-1">
                 {offset % 2 === 0 ? String(h).padStart(2, '0') : ''}
              </div>
            );
          })}
        </div>
        <div className="flex-shrink-0 w-48 pl-5"></div>
      </div>

      {/* ГЛАВНЫЙ КОНТЕЙНЕР (Слушает движения мыши и клики) */}
      <div 
        className="relative py-2 bg-white border border-gray-200 shadow-sm rounded-xl cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleGridClick}
      >
        
        {cities?.length > 0 ? (
          cities.map((city) => {
            // ВРЕМЯ NOW
            const localNowFormatter = new Intl.DateTimeFormat('ru-RU', {
              timeZone: city.timezone, hour: '2-digit', minute: '2-digit'
            });
            const localNowStr = localNowFormatter.format(now);

            // ВРЕМЯ PROBE (если не активно, то равно NOW)
            const activeDate = new Date(now.getTime() + (activeOffsetMinutes || 0) * 60000);
            const localActiveStr = localNowFormatter.format(activeDate);
            
            // Статусы
            const activeLocalHour = parseInt(localActiveStr.split(':')[0], 10);
            const timeOfDay = getTimeOfDayInfo(activeLocalHour);
            const isWorkingHour = activeLocalHour >= 9 && activeLocalHour < 18;

            return (
              <div key={city.id} className="flex items-center w-full px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                
                {/* 1. Блок Информации и ЧАСЫ (Слева) */}
                <div className="flex items-center justify-between flex-shrink-0 w-48 pr-6">
                  <div className="flex-1 truncate pr-2">
                    <div className="font-semibold text-gray-900 leading-tight truncate">{city.name}</div>
                    <div className="text-[11px] text-gray-400">{getUtcOffsetString(city.timezone)}</div>
                  </div>
                  
                  {/* ЧАСЫ: Всегда стильные (Оранжевый на черном) */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#1A1A1A] text-[#FFB020] px-2.5 py-1.5 rounded-lg text-lg font-bold tracking-widest leading-none shadow-sm min-w-[70px] text-center">
                      {localActiveStr}
                    </div>
                    {/* Текст "Now:" появляется только когда Probe активен, чтобы не прыгала высота, держим h-3 */}
                    <div className="mt-1 text-[9px] text-gray-400 font-medium h-3 text-center">
                      {isProbeActive ? `Now: ${localNowStr}` : ''}
                    </div>
                  </div>
                </div>

                {/* 2. Сетка Таймлайна (По центру) */}
                <div className="relative flex flex-1 h-5 overflow-hidden rounded-md bg-gray-50 border border-gray-100">
                  {offsets.map((offset) => {
                    const cellDate = new Date(now);
                    cellDate.setHours(now.getHours() + offset);
                    const cellHourStr = new Intl.DateTimeFormat('ru-RU', {
                      timeZone: city.timezone, hour: '2-digit'
                    }).format(cellDate);
                    const cellHour = parseInt(cellHourStr, 10);
                    
                    const isWorkingCell = cellHour >= 9 && cellHour < 18;

                    return (
                      <div 
                        key={offset} 
                        className={`flex-1 border-r border-white/60 last:border-0 ${isWorkingCell ? 'bg-[#A3E5C7]' : 'bg-[#E5E7EB]'}`}
                        title={`${cellHourStr}:00 местное время`}
                      ></div>
                    );
                  })}
                </div>

                {/* 3. Статус Бейджики И КНОПКА УДАЛЕНИЯ (Справа) */}
                <div className="flex items-center justify-end flex-shrink-0 w-48 pl-5 gap-2.5">
                  
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${timeOfDay.colors}`}>
                     <timeOfDay.Icon />
                     {timeOfDay.label}
                  </span>

                  {isWorkingHour ? (
                     <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-full shadow-sm transition-colors">
                       <ClockIcon />
                       In
                     </span>
                  ) : (
                     <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full shadow-sm transition-colors">
                       <ClockIcon />
                       Out
                     </span>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Чтобы клик по кнопке не ставил PROBE
                      onDelete(city.id);
                    }}
                    className="p-1.5 ml-1 text-gray-400 transition-colors rounded-md hover:text-red-500 hover:bg-red-50"
                    title="Delete city"
                  >
                    <TrashIcon />
                  </button>

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