export const API_BASE_URL = 'http://localhost:3001'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    loginHistory: '/auth/login-history',
    protected: '/auth/protected'
  },
  points: {
    create: '/points',
    getAll: '/points',
    getOne: '/points/:id',
    update: '/points/:id',
    delete: '/points/:id'
  }
}

export const getApiUrl = endpoint => `${API_BASE_URL}${endpoint}`
