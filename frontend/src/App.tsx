import { useState } from 'react';
import { Header } from './widgets/header/ui/Header';
import { WorldTimePage } from './pages/world-time/ui/WorldTimePage';
import { CreateMeetingPage } from './pages/create-meeting/ui/CreateMeetingPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'world-time' | 'create-meeting'>('world-time');

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      {/* Header теперь глобальный и управляет переключением страниц */}
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {/* Рендерим нужную страницу */}
      {currentPage === 'world-time' ? <WorldTimePage /> : <CreateMeetingPage />}
    </div>
  );
}

export default App;