import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import '../styles/Header.scss'

Header.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
}

export default function Header({ user, onLogout }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="header" role="banner">
      <div className="header-left">
        <img
          src="/rospotrebnadzor_emb_n9349.png"
          alt="Логотип РПН"
          className="header-logo"
        />
        <div className="institute-name-wrapper">
          <h1 className="institute-name">
            ФКУЗ РОСТОВСКИЙ-НА-ДОНУ
            <br />
            ПРОТИВОЧУМНЫЙ ИНСТИТУТ
            <br />
            РОСПОТРЕБНАДЗОРА
          </h1>
        </div>
      </div>

      <button 
        className={`burger-menu ${isMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Открыть меню"
        aria-expanded={isMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className="header-right" role="navigation" aria-label="Основная навигация">
        <ul className="header-nav">
          <li>
            <a
              href="https://gis.antiplague.ru/contacts.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Контакты
            </a>
          </li>
          <li>
            <a
              href="https://gis.antiplague.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Геопортал
            </a>
          </li>
          <li>
            <a
              href="https://antiplague.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Сайт института
            </a>
          </li>
          {user ? (
            <li className="user-menu">
              <span className="username" aria-label={`Пользователь: ${user.email}`}>{user.email}</span>
              <button 
                className="logout-button" 
                onClick={onLogout}
                aria-label="Выйти из системы"
              >
                Выйти
              </button>
            </li>
          ) : (
            !isLoginPage && (
              <li>
                <Link to="/login" className="login-button" aria-label="Войти в систему">
                  Войти
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>

      <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`} role="navigation" aria-label="Мобильная навигация">
        <ul className="header-nav">
          <li>
            <a
              href="https://gis.antiplague.ru/contacts.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              onClick={closeMenu}
            >
              Контакты
            </a>
          </li>
          <li>
            <a
              href="https://gis.antiplague.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              onClick={closeMenu}
            >
              Геопортал
            </a>
          </li>
          <li>
            <a
              href="https://antiplague.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              onClick={closeMenu}
            >
              Сайт института
            </a>
          </li>
          {user ? (
            <li className="user-menu">
              <span className="username" aria-label={`Пользователь: ${user.email}`}>{user.email}</span>
              <button 
                className="logout-button" 
                onClick={() => {
                  onLogout()
                  closeMenu()
                }}
                aria-label="Выйти из системы"
              >
                Выйти
              </button>
            </li>
          ) : (
            !isLoginPage && (
              <li>
                <Link to="/login" className="login-button" onClick={closeMenu} aria-label="Войти в систему">
                  Войти
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  )
}
