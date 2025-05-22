import { useState } from 'react'
import PropTypes from 'prop-types'
import { loginUser } from '../services/api'
import './Auth.css'

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
    <main className="auth-container" role="main" aria-label="Страница авторизации">
      <h1 className="system-title">ГИС по P.aeruginosa</h1>
      <section className="auth-form-container" role="region" aria-label="Форма входа">
        <h2>Вход в систему</h2>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" role="form" aria-label="Форма авторизации">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Введите email"
              disabled={isLoading}
              aria-required="true"
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
              aria-required="true"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={isLoading}
            aria-label={isLoading ? 'Выполняется вход...' : 'Войти в систему'}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </section>
    </main>
  )
}

Auth.propTypes = {
  onAuth: PropTypes.func.isRequired
}
