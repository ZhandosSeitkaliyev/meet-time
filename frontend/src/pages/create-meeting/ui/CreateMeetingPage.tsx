import { useState, useEffect } from 'react';
import type { Participant } from '../../../entities/participant/model/types';
import { AddParticipant } from '../../../features/add-participant/ui/AddParticipant';
import { MeetingTimeline } from '../../../widgets/meeting-timeline/ui/MeetingTimeline';
import { MeetingSidebar } from '../../../widgets/meeting-sidebar/ui/MeetingSidebar';

export const CreateMeetingPage = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dayOffset, setDayOffset] = useState<number>(0);
  
  // НОВЫЕ ГЛОБАЛЬНЫЕ СОСТОЯНИЯ
  const [selectedOffset, setSelectedOffset] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(60); // По умолчанию 1 час

  useEffect(() => {
    fetch("http://localhost:8000/participants")
      .then(res => res.json())
      .then(data => setParticipants(data.participants))
      .catch(err => console.error("Ошибка загрузки участников:", err));
  }, []);

  const handleAddParticipant = async (newParticipant: Participant) => {
    if (participants.some(p => p.name.toLowerCase() === newParticipant.name.toLowerCase())) {
        return alert("Participant with this name is already added!");
    }
    setParticipants([...participants, newParticipant]);
  };

  const handleDeleteParticipant = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/participants/${id}`, { method: 'DELETE' });
      setParticipants(participants.filter(p => p.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  return (
    <main className="px-8 py-8 max-w-[1600px] mx-auto bg-gray-50 min-h-screen">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg text-sm font-medium text-gray-500">
            <button onClick={() => setDayOffset(-1)} className={`px-4 py-1.5 rounded-md transition-colors ${dayOffset === -1 ? 'text-gray-900 bg-white shadow-sm' : 'hover:text-gray-900'}`}>Yesterday</button>
            <button onClick={() => setDayOffset(0)} className={`px-4 py-1.5 rounded-md transition-colors ${dayOffset === 0 ? 'text-gray-900 bg-white shadow-sm' : 'hover:text-gray-900'}`}>Today</button>
            <button onClick={() => setDayOffset(1)} className={`px-4 py-1.5 rounded-md transition-colors ${dayOffset === 1 ? 'text-gray-900 bg-white shadow-sm' : 'hover:text-gray-900'}`}>Tomorrow</button>
          </div>
          <AddParticipant onParticipantAdded={handleAddParticipant} />
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 text-xs font-medium text-gray-500 cursor-default select-none">
        <span className="text-gray-400">Day periods</span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3.5 bg-[#A3E5C7] rounded-sm"></div>
          <span>Working Hours <span className="text-gray-400 font-normal">(09:00–18:00)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3.5 bg-[#F5DEAB] rounded-sm"></div>
          <span>Borderline <span className="text-gray-400 font-normal">(06:00–09:00, 18:00–22:00)</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3.5 bg-[#D9D9F0] rounded-sm"></div>
          <span>Night <span className="text-gray-400 font-normal">(22:00–06:00)</span></span>
        </div>
      </div>

      {/* НОВАЯ РАЗМЕТКА: Две колонки (Слева таймлайн, справа панель) */}
      <div className="flex gap-8 items-start">
        
        {/* ЛЕВАЯ ЧАСТЬ (Таймлайн) */}
        <div className="flex-1 overflow-x-auto">
          <MeetingTimeline 
            participants={participants} 
            onDelete={handleDeleteParticipant} 
            dayOffset={dayOffset} 
            selectedOffset={selectedOffset}
            onOffsetChange={setSelectedOffset}
            duration={duration}
          />
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Сайдбар) */}
        <MeetingSidebar 
          selectedOffset={selectedOffset}
          onClear={() => setSelectedOffset(null)}
          duration={duration}
          onDurationChange={setDuration}
        />

      </div>

    </main>
  );
};