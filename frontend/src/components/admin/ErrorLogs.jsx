import { useState } from 'react'

export default function ErrorLogs() {
  const [errorLogs] = useState([
    {
      id: 1,
      timestamp: '2024-02-20 09:15:30',
      level: 'ERROR',
      message: 'Failed to connect to database',
      stack: 'Error: Connection timeout...',
    },
    {
      id: 2,
      timestamp: '2024-02-20 10:22:45',
      level: 'WARNING',
      message: 'Invalid request parameters',
      stack: 'Warning: Missing required field...',
    },
    {
      id: 3,
      timestamp: '2024-02-20 11:05:12',
      level: 'ERROR',
      message: 'Authentication failed',
      stack: 'Error: Invalid credentials...',
    },
  ])

  const [selectedLog, setSelectedLog] = useState(null)

  return (
    <div>
      <div className="admin-header">
        <h2>Логи ошибок</h2>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата и время</th>
            <th>Уровень</th>
            <th>Сообщение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {errorLogs.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.timestamp}</td>
              <td>
                <span className={`log-level ${log.level.toLowerCase()}`}>
                  {log.level}
                </span>
              </td>
              <td>{log.message}</td>
              <td>
                <button
                  className="action-button edit"
                  onClick={() => setSelectedLog(log)}
                >
                  Подробнее
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setSelectedLog(null)}
            >
              ×
            </button>
            <h3 className="modal-title">Детали ошибки</h3>
            <div className="error-details">
              <p>
                <strong>ID:</strong> {selectedLog.id}
              </p>
              <p>
                <strong>Дата и время:</strong> {selectedLog.timestamp}
              </p>
              <p>
                <strong>Уровень:</strong>{' '}
                <span
                  className={`log-level ${selectedLog.level.toLowerCase()}`}
                >
                  {selectedLog.level}
                </span>
              </p>
              <p>
                <strong>Сообщение:</strong> {selectedLog.message}
              </p>
              <div className="stack-trace">
                <strong>Stack Trace:</strong>
                <pre>{selectedLog.stack}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
