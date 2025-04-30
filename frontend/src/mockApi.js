// Пример мок-данных для авторизации
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    role: 'admin',
    fullName: 'Администратор',
  },
  {
    id: 2,
    username: 'user',
    password: 'user',
    role: 'user',
    fullName: 'Пользователь',
  },
]

// Имитация токена
let mockToken = null
let currentUser = null

// Функция имитации запроса авторизации
export const mockLogin = async (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(
        u => u.username === username && u.password === password
      )

      if (user) {
        // Создаем фейковый токен
        mockToken = `mock-jwt-token-${Date.now()}`
        currentUser = { ...user }
        delete currentUser.password

        resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: mockToken,
              user: currentUser,
            }),
        })
      } else {
        resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              message: 'Неверное имя пользователя или пароль',
            }),
        })
      }
    }, 500) // Имитация задержки сети
  })
}

// Функция имитации проверки авторизации
export const mockCheckAuth = async token => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (token && mockToken === token && currentUser) {
        resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              authenticated: true,
              user: currentUser,
            }),
        })
      } else {
        resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              authenticated: false,
            }),
        })
      }
    }, 300)
  })
}

// Функция имитации выхода из системы
export const mockLogout = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      mockToken = null
      currentUser = null
      resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    }, 300)
  })
}
