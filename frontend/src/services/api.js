import { API_BASE_URL } from '../config/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
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

    return response.json()
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
