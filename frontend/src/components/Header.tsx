import { useState, useEffect } from 'react';

export const Header = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Функция, которая вычисляет и форматирует текущее время
    const updateTime = () => {
      const now = new Date();
      // Получаем время именно в часовом поясе Астаны в формате ЧЧ:ММ
      const formattedTime = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Asia/Almaty',
        hour: '2-digit',
        minute: '2-digit',
      }).format(now);
      
      setCurrentTime(formattedTime);
    };

    updateTime(); // Вызываем сразу при загрузке страницы
    
    // Запускаем таймер, который будет обновлять время каждую минуту (60000 мс)
    const intervalId = setInterval(updateTime, 60000);

    // Очищаем таймер, если компонент будет удален с экрана
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
      
      {/* Левая часть: Логотип и навигация */}
      <div className="flex items-center gap-10">
        <div className="text-xl font-bold tracking-tight text-black">
          Meet Time
        </div>
        
        <nav className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-semibold text-black bg-gray-100 rounded-lg">
            World Time
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 transition-colors rounded-lg hover:text-black hover:bg-gray-50">
            Create Meeting
          </button>
        </nav>
      </div>

      {/* Правая часть: Локация, время и настройки */}
      <div className="flex items-center gap-6">
        
        {/* Индикатор текущего времени и локации */}
        <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black border border-gray-200 rounded-full shadow-sm">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {/* Выводим наше "живое" состояние времени */}
          <span>{currentTime} &middot; Astana <span className="font-normal text-gray-400">(UTC+5)</span></span>
        </div>

        {/* Кнопка настроек */}
        <button className="text-gray-700 transition-colors rounded-full hover:text-black hover:bg-gray-100 p-1.5">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
    </header>
  );
};