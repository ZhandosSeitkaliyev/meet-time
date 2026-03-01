import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  timezone: string;
}

export const ParticipantList = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/users")
      .then(res => res.json())
      .then(data => setUsers(data.users))
      .catch(err => console.error("Ошибка:", err));
  }, []);

  return (
    <div className="max-w-md mt-6 space-y-3">
      {users.map(user => (
        <div 
          key={user.id} 
          className="flex justify-between items-center p-4 bg-white shadow rounded-lg text-gray-800"
        >
          <span className="font-bold text-lg">{user.name}</span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {user.timezone}
          </span>
        </div>
      ))}
    </div>
  );
};