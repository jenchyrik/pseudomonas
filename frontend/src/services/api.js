import { API_BASE_URL } from '../config/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

// Функция для проверки срока действия токена
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Функция для обновления токена
const refreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    localStorage.setItem('token', data.access_token)
    // Обновляем информацию о пользователе в localStorage
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('userEmail', data.user.email)
    }
    return data.access_token
  } catch (error) {
    console.error('Error refreshing token:', error)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    window.location.href = '/login'
    throw error
  }
}

// Обертка для fetch с автоматическим обновлением токена
export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('token')
  
  if (isTokenExpired(token)) {
    token = await refreshToken()
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    token = await refreshToken()
    headers['Authorization'] = `Bearer ${token}`
    return fetch(url, { ...options, headers })
  }

  return response
}

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Ошибка авторизации')
    }

    const data = await response.json()
    localStorage.setItem('token', data.access_token)
    return data
  } catch (error) {
    throw new Error(error.message || 'Ошибка соединения с сервером')
  }
}

export const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Ошибка при получении списка пользователей')
    }

    return response.json()
  } catch (error) {
    throw new Error(error.message || 'Ошибка соединения с сервером')
  }
}

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Ошибка при создании пользователя')
    }

    return response.json()
  } catch (error) {
    throw new Error(error.message || 'Ошибка соединения с сервером')
  }
}

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Ошибка при обновлении пользователя')
    }

    return response.json()
  } catch (error) {
    throw new Error(error.message || 'Ошибка соединения с сервером')
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Ошибка при удалении пользователя')
    }
  } catch (error) {
    throw new Error(error.message || 'Ошибка соединения с сервером')
  }
}

export const changePassword = async (id, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      throw new Error('Ошибка при изменении пароля')
    }
  } catch (error) {
    throw new Error(error.message || 'Ошибка соединения с сервером')
  }
}
