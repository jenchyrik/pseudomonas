import { useState } from 'react'
import PropTypes from 'prop-types'
import { loginUser } from '../services/api'
import './Auth.scss'

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting login with email:', email)
      const data = await loginUser(email, password)
      console.log('Login response:', data)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('userEmail', email)
      console.log('Saved userEmail to localStorage:', email)
      onAuth(data.user)
    } catch (err) {
      console.error('Ошибка авторизации:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <h1 className="system-title">ГИС по Pseudomonas aeruginosa</h1>
      <div className="auth-form-container">
        <h2>Вход в систему</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Введите email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
Auth.propTypes = {
  onAuth: PropTypes.func.isRequired
}

