import { useEffect, useState } from 'react';

// Описываем тип данных для нашего пользователя
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
      .then(data => setUsers(data.users));
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
        
          {user.id} - {user.name} — {user.timezone}
          
        </li>
      ))}
    </ul>
  );
};