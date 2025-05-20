import { useEffect, useState } from 'react'
import { getApiUrl } from '../../config/api'
import '../../styles/admin.css'

export default function LoginHistory() {
  const [loginHistory, setLoginHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLoginHistory()
  }, [])

  const fetchLoginHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl('/auth/login-history'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch login history')
      }

      const data = await response.json()
      setLoginHistory(data)
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
    <div className="login-history-container" style={{ paddingBottom: '10px' }}>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Действие</th>
              <th>Дата и время</th>
            </tr>
          </thead>
          <tbody>
            {loginHistory.map(entry => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.user.email}</td>
                <td>{entry.action}</td>
                <td>{new Date(entry.timestamp).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 