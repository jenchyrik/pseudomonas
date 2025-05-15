import { useEffect, useState } from 'react'
import { getApiUrl } from '../../config/api'
import '../../styles/admin.css'

export default function ErrorLogs() {
  const [errorLogs, setErrorLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    fetchErrorLogs()
  }, [])

  const fetchErrorLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl('/logs/errors'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch error logs')
      }

      const data = await response.json()
      setErrorLogs(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>
  }

  return (
    <div className="error-logs-container">
      <div className="admin-header">
        <h2>Журнал ошибок</h2>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Уровень</th>
              <th>Сообщение</th>
              <th>Дата и время</th>
            </tr>
          </thead>
          <tbody>
            {errorLogs.map(log => (
              <tr key={log.id} onClick={() => setSelectedLog(log)}>
                <td>{log.id}</td>
                <td>{log.level}</td>
                <td>{log.message}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
            <h3 className="modal-title">Детали ошибки</h3>
            <div className="error-details">
            <p><strong>ID:</strong> {selectedLog.id}</p>
            <p><strong>Уровень:</strong> {selectedLog.level}</p>
            <p><strong>Сообщение:</strong> {selectedLog.message}</p>
            <p><strong>Дата и время:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
            {selectedLog.stack && (
                <div className="stack-trace">
                <p><strong>Стек вызовов:</strong></p>
                <pre>{selectedLog.stack}</pre>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
