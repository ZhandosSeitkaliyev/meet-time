// src/widgets/meeting-sidebar/ui/MeetingSidebar.tsx
import { useState, useEffect } from 'react';

interface MeetingSidebarProps {
  selectedOffset: number | null;
  onClear: () => void;
  duration: number;
  onDurationChange: (duration: number) => void;
}

export const MeetingSidebar = ({ selectedOffset, onClear, duration, onDurationChange }: MeetingSidebarProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Высчитываем реальное время начала и конца
  const startTime = selectedOffset !== null ? new Date(now.getTime() + selectedOffset * 60000) : null;
  const endTime = startTime ? new Date(startTime.getTime() + duration * 60000) : null;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <aside className="w-[320px] flex-shrink-0 space-y-4">
      
      {/* 1. ПАНЕЛЬ ВЫБРАННОГО ВРЕМЕНИ (Pinned Time) */}
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Pinned Time</h3>
          {selectedOffset !== null && (
            <button onClick={onClear} className="text-xs font-medium text-gray-900 transition-colors hover:text-red-500">
              Clear
            </button>
          )}
        </div>
        
        {selectedOffset !== null && startTime && endTime ? (
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900">
              {formatTime(startTime)}–{formatTime(endTime)}
            </div>
            <div className="mt-1.5 text-xs text-gray-500">
              Today &middot; Your time (Astana UTC+5)
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-16 text-sm text-center text-gray-400 border border-gray-100 border-dashed rounded-xl bg-gray-50">
            Hover or click timeline <br/> to select a time slot
          </div>
        )}
      </div>

      {/* 2. ПАНЕЛЬ ПРОДОЛЖИТЕЛЬНОСТИ (Duration) */}
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">Duration</h3>
        <div className="flex items-center gap-2">
          {[30, 60, 90].map((dur) => (
            <button
              key={dur}
              onClick={() => onDurationChange(dur)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                duration === dur 
                  ? 'bg-gray-200 text-gray-900' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {dur}m
            </button>
          ))}
        </div>
      </div>

      {/* 3. КОМФОРТ И SUGGESTIONS (Заглушки из макета) */}
      <div className="p-5 bg-white border border-gray-200 shadow-sm opacity-50 pointer-events-none rounded-2xl">
         <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">Comfort</h3>
         <div className="flex items-center gap-3 mb-4 text-xs font-medium">
            <span className="px-2 py-0.5 text-red-600 bg-red-50 border border-red-100 rounded-md">Risky</span>
            <span className="text-green-600">0w</span> &middot; 
            <span className="text-yellow-600">1b</span> &middot; 
            <span className="text-blue-500">9n</span>
         </div>
         <button className="w-full py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg">
           View details
         </button>
      </div>

      {/* 4. КНОПКА GOOGLE CALENDAR (Пока заглушка) */}
      <div className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">Meeting Details</h3>
        <button className="w-full py-2.5 mt-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2">
          Create Meeting
        </button>
      </div>

    </aside>
  );
};