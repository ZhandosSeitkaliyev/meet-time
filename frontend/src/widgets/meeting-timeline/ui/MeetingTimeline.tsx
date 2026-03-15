import { useState, useEffect, useRef } from 'react';
import type { Participant } from '../../../entities/participant/model/types';
import { TrashIcon, ClockIcon } from '../../../shared/ui/icons';

const getCellColor = (hour: number) => {
  if (hour >= 9 && hour < 18) return 'bg-[#A3E5C7]';
  if ((hour >= 6 && hour < 9) || (hour >= 18 && hour < 22)) return 'bg-[#F5DEAB]';
  return 'bg-[#D9D9F0]';
};

// ПРИНИМАЕМ dayOffset ИЗ ПРОПСОВ
export const MeetingTimeline = ({ 
  participants, 
  onDelete, 
  dayOffset,
  selectedOffset, 
  onOffsetChange, 
  duration 
}: { 
  participants: Participant[], 
  onDelete: (id: number) => void, 
  dayOffset: number,
  selectedOffset: number | null,
  onOffsetChange: (offset: number | null) => void,
  duration: number
}) => {
  const [now, setNow] = useState(new Date());
  

  const [isDragging, setIsDragging] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOffsetChange(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateOffsetMinutes = (clientX: number): number | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    
    const percent = x / rect.width;
    const rawMinutesFromLeft = percent * 1440;
    const snappedMinutesFromLeft = Math.round(rawMinutesFromLeft / 10) * 10;
    
    // МАТЕМАТИКА: учитываем сдвиг дней (dayOffset * 24 часа)
    const nowMinutesFromLeft = 60 + now.getMinutes() - (dayOffset * 24 * 60); 
    
    return snappedMinutesFromLeft - nowMinutesFromLeft;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const offset = calculateOffsetMinutes(e.clientX);
    if (offset !== null) {
      onOffsetChange(offset);
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const offset = calculateOffsetMinutes(e.clientX);
      if (offset !== null) {
        onOffsetChange(offset);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, now, dayOffset]); // Добавили dayOffset в зависимости

  // СДВИГАЕМ СЕТКУ ЧАСОВ (+24 или -24 часа)
  const offsets = Array.from({ length: 24 }, (_, i) => i - 1 + (dayOffset * 24)); 
  
  const currentMinute = now.getMinutes();
  const nowMinutesFromLeft = 60 + currentMinute - (dayOffset * 24 * 60);
  const nowPercent = (nowMinutesFromLeft / 1440) * 100;
  
  const durationWidthPercent = (duration / 1440) * 100;
  const activePercent = selectedOffset !== null ? (((nowMinutesFromLeft + selectedOffset) / 1440) * 100) : 0;

  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-gray-400 border-2 border-gray-200 border-dashed rounded-2xl">
        No participants added. Click "+ Add person" to start scheduling.
      </div>
    );
  }

  return (
    <div className="relative pb-8 select-none" ref={containerRef}>
      
      <div className="flex w-full px-4 mb-3">
        <div className="flex-shrink-0 w-72 pr-6"></div>
        <div className="relative flex justify-between flex-1 text-xs font-semibold text-gray-400" ref={gridRef}>
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
        <div className="flex-shrink-0 pl-4 w-32"></div>
      </div>

      <div 
        className="relative py-2 bg-white border border-gray-200 shadow-sm rounded-xl cursor-ew-resize"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: '19rem', right: '9rem' }}>
          
          {/* УМНАЯ ЛИНИЯ NOW: Показывается ТОЛЬКО если она в пределах текущего дня */}
          {nowPercent >= 0 && nowPercent <= 100 && (
            <div 
              className="absolute top-0 bottom-0 w-px bg-gray-900"
              style={{ left: `${nowPercent}%` }}
            >
              <div className="absolute px-2 py-1 text-[9px] font-bold text-white -translate-x-1/2 bg-gray-900 rounded-full -top-4">
                NOW
              </div>
            </div>
          )}

          {selectedOffset !== null && (
            <div 
              className={`absolute top-0 bottom-0 bg-blue-500/15 border-x border-blue-400 transition-all ${isDragging ? 'duration-0' : 'duration-100'}`}
              style={{ 
                left: `${Math.max(0, Math.min(100 - durationWidthPercent, activePercent))}%`, 
                width: `${durationWidthPercent}%` 
              }}
            />
          )}
        </div>

        {participants.map((p) => {
          const localNowFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: p.timezone, hour: '2-digit', minute: '2-digit' });
          const localNowStr = localNowFormatter.format(now);

          // Если выделения нет, часы показывают базу текущего выбранного дня (now + сдвиг дней)
          const baseDragOffset = selectedOffset !== null ? selectedOffset : (dayOffset * 24 * 60);
          const activeDate = new Date(now.getTime() + baseDragOffset * 60000);
          const localActiveStr = localNowFormatter.format(activeDate);
          
          const activeLocalHour = parseInt(localActiveStr.split(':')[0], 10);
          let statusLabel = 'Night';
          let statusColor = 'text-blue-500 bg-blue-50 border-blue-100';
          if (activeLocalHour >= 9 && activeLocalHour < 18) {
            statusLabel = 'Work';
            statusColor = 'text-green-600 bg-green-50 border-green-100';
          } else if ((activeLocalHour >= 6 && activeLocalHour < 9) || (activeLocalHour >= 18 && activeLocalHour < 22)) {
            statusLabel = 'Borderline';
            statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-100';
          }

          return (
            <div key={p.id} className="flex items-center w-full px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              
              <div className="flex items-center justify-between flex-shrink-0 pr-6 w-72">
                <div className="flex-1 pr-2 truncate">
                  <div className="font-semibold text-gray-900 truncate">
                    {p.name.split(',')[0]}
                    <span className="font-normal text-gray-400 text-[11px] ml-1.5">&middot; {p.cityName}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-[#1A1A1A] text-[#FFB020] px-2 py-1 rounded-md text-sm font-bold tracking-widest leading-none shadow-sm text-center">
                    {localActiveStr}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium w-16">
                    Now: {localNowStr}
                  </div>
                </div>
              </div>

              <div className="relative flex flex-1 overflow-hidden rounded-sm h-3.5 gap-0.5">
                {offsets.map((offset) => {
                  const cellDate = new Date(now);
                  cellDate.setHours(now.getHours() + offset);
                  const cellHourStr = new Intl.DateTimeFormat('en-GB', { timeZone: p.timezone, hour: '2-digit' }).format(cellDate);
                  const cellHour = parseInt(cellHourStr, 10);
                  
                  return (
                    <div 
                      key={offset} 
                      className={`flex-1 opacity-90 ${getCellColor(cellHour)}`}
                      title={`${cellHourStr}:00`}
                    ></div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end flex-shrink-0 pl-4 w-32 gap-2">
                <span className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium border rounded-md transition-colors ${statusColor}`}>
                  <ClockIcon />
                  {statusLabel}
                </span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  className="p-1 text-gray-300 transition-colors rounded-md hover:text-red-500 hover:bg-red-50 z-20 relative"
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