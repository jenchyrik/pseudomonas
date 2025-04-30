import { useState } from 'react'

export default function LoginHistory() {
  const [loginHistory] = useState([
    {
      id: 1,
      username: 'admin',
      action: 'Вход',
      timestamp: '2024-02-20 10:30:15',
      ip: '192.168.1.1',
    },
    {
      id: 2,
      username: 'user1',
      action: 'Вход',
      timestamp: '2024-02-20 11:15:22',
      ip: '192.168.1.2',
    },
    {
      id: 3,
      username: 'admin',
      action: 'Выход',
      timestamp: '2024-02-20 12:45:30',
      ip: '192.168.1.1',
    },
  ])

  return (
    <div>
      <div className="admin-header">
        <h2>История входов</h2>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Действие</th>
            <th>Дата и время</th>
            <th>IP адрес</th>
          </tr>
        </thead>
        <tbody>
          {loginHistory.map(entry => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.username}</td>
              <td>{entry.action}</td>
              <td>{entry.timestamp}</td>
              <td>{entry.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 