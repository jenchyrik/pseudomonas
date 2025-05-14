import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminPanel from './components/AdminPanel'
import Auth from './components/Auth'
import Header from './components/Header'
import Map from './components/Map'
import { API_ENDPOINTS, getApiUrl } from './config/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Проверяем, если пользователь уже авторизован
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setLoading(false)
          return
        }

        const response = await fetch(getApiUrl(API_ENDPOINTS.auth.protected), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Функция для авторизации пользователя
  const handleAuth = userData => {
    setUser(userData)
  }

  // Функция для выхода из системы
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')

      if (token) {
        await fetch(getApiUrl(API_ENDPOINTS.auth.logout), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('token')
    }
  }

  // Функция для проверки роли пользователя
  const isAdmin = () => {
    return user && user.role === 'admin'
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route
              path="/admin"
              element={
                user ? (
                  isAdmin() ? (
                    <AdminPanel />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/login"
              element={
                user ? (
                  isAdmin() ? (
                    <Navigate to="/admin" />
                  ) : (
                    <Navigate to="/" />
                  )
                ) : (
                  <Auth onAuth={handleAuth} />
                )
              }
            />
            <Route
              path="/"
              element={
                user ? (
                  isAdmin() ? (
                    <Navigate to="/admin" />
                  ) : (
                    <Map />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
