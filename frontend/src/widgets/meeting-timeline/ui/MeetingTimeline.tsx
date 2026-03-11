// src/widgets/meeting-timeline/ui/MeetingTimeline.tsx
import { useState, useEffect } from 'react';
import type { Participant } from '../../../entities/participant/model/types';
import { TrashIcon } from '../../../shared/ui/icons';

const getCellColor = (hour: number) => {
  if (hour >= 9 && hour < 18) return 'bg-[#A3E5C7]'; // Working Hours (Green)
  if ((hour >= 6 && hour < 9) || (hour >= 18 && hour < 22)) return 'bg-[#F5DEAB]'; // Borderline (Yellow)
  return 'bg-[#D9D9F0]'; // Night (Purple/Blue)
};

export const MeetingTimeline = ({ participants, onDelete }: { participants: Participant[], onDelete: (id: number) => void }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const offsets = Array.from({ length: 24 }, (_, i) => i - 12);
  const currentMinute = now.getMinutes();
  const nowPercent = ((12 + currentMinute / 60) / 24) * 100;

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
        No participants added. Click "+ Add person" to start scheduling.
      </div>
    );
  }

  return (
    <div className="relative pb-8">
      
      {/* Шапка времени (00 02 04 ...) */}
      <div className="flex w-full px-4 mb-4">
        <div className="w-56 flex-shrink-0"></div> {/* Пустое место над именами */}
        <div className="relative flex justify-between flex-1 text-xs font-semibold text-gray-400">
          {offsets.map((offset) => {
            const d = new Date(now);
            d.setHours(now.getHours() + offset);
            return (
              <div key={offset} className="flex justify-center flex-1">
                 {offset % 2 === 0 ? String(d.getHours()).padStart(2, '0') : ''}
              </div>
            );
          })}
        </div>
        <div className="w-24 flex-shrink-0"></div> {/* Пустое место над бейджами */}
      </div>
      

      {/* Контейнер для строк */}
      <div className="relative space-y-2">
        
        {/* Линия NOW */}
        <div 
          className="absolute top-0 bottom-0 z-20 w-px bg-gray-900 pointer-events-none -mt-6"
          style={{ left: `calc(15rem + (100% - 15rem - 6rem) * ${nowPercent / 100})` }}
        >
          <div className="absolute px-2 py-1 text-[10px] font-bold text-white -translate-x-1/2 bg-gray-900 rounded-full -top-4">
            NOW
          </div>
        </div>

        {participants.map((p) => {
          // Вычисляем локальное время участника
          const localTimeStr = new Intl.DateTimeFormat('en-GB', {
            timeZone: p.timezone, hour: '2-digit', minute: '2-digit'
          }).format(now);
          const currentLocalHour = parseInt(localTimeStr.split(':')[0], 10);

          let statusLabel = 'Night';
          let statusColor = 'text-blue-600 bg-blue-50 border-blue-100';
          if (currentLocalHour >= 9 && currentLocalHour < 18) {
            statusLabel = 'Work';
            statusColor = 'text-green-600 bg-green-50 border-green-100';
          } else if ((currentLocalHour >= 6 && currentLocalHour < 9) || (currentLocalHour >= 18 && currentLocalHour < 22)) {
            statusLabel = 'Borderline';
            statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-100';
          }

          return (
            <div key={p.id} className="flex items-center w-full px-4 py-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm">
              
              {/* 1. Имя и Город */}
              <div className="flex items-center justify-between w-56 flex-shrink-0 pr-6">
                <div>
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <span className="text-gray-400 text-sm ml-1.5">&middot; {p.cityName}</span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {localTimeStr}
                </div>
              </div>

              {/* 2. Полоска времени */}
              <div className="flex flex-1 h-3.5 gap-0.5 overflow-hidden rounded-sm">
                {offsets.map((offset) => {
                  const cellDate = new Date(now);
                  cellDate.setHours(now.getHours() + offset);
                  const cellHourStr = new Intl.DateTimeFormat('en-GB', { timeZone: p.timezone, hour: '2-digit' }).format(cellDate);
                  const cellHour = parseInt(cellHourStr, 10);
                  
                  return (
                    <div 
                      key={offset} 
                      className={`flex-1 ${getCellColor(cellHour)} opacity-90`}
                      title={`${cellHourStr}:00`}
                    ></div>
                  );
                })}
              </div>

              {/* 3. Бейдж справа и Корзина */}
              <div className="flex items-center justify-end w-32 flex-shrink-0 pl-4 gap-2">
                <span className={`px-2 py-0.5 text-[11px] font-medium border rounded-md ${statusColor}`}>
                  {statusLabel}
                </span>
                
                {/* НОВАЯ КНОПКА */}
                <button 
                  onClick={() => onDelete(p.id)}
                  className="p-1 text-gray-300 transition-colors rounded-md hover:text-red-500 hover:bg-red-50"
                >
                  <TrashIcon />
                </button>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};