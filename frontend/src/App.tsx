import { Header } from './components/Header';
import { ParticipantList } from './components/ParticipantList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      {/* Главный контейнер с отступами */}
      <main className="px-8 py-8 max-w-[1600px] mx-auto">
        
        {/* Верхний блок: Заголовок слева, кнопки справа */}
        <div className="flex items-end justify-between mb-6">
          
          {/* Текстовая часть */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">World Time</h1>
            <p className="mt-2 text-lg text-gray-500">Track time across cities</p>
          </div>

          {/* Кнопки управления */}
          <div className="flex items-center gap-4">
            
            {/* Переключатель List / Grid */}
            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-100 rounded-md text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                List
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Grid
              </button>
            </div>

            {/* Кнопка Add city */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add city
            </button>
          </div>
        </div>

        {/* Индикаторы статуса (точки) */}
        <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>0 cities in working hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>3 cities in night</span>
          </div>
        </div>

        {/* Контейнер для таймлайна (пока вставим сюда наш старый список для теста) */}
        <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
           <ParticipantList />
        </div>

      </main>
    </div>
  );
}

export default App;