import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import '../styles/Header.css'

Header.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }),
  onLogout: PropTypes.func.isRequired,
}

export default function Header({ user, onLogout }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <header className="header">
      <div className="header-left">
        <img
          src="/rospotrebnadzor_emb_n9349.png"
          alt="Логотип РПН"
          className="header-logo"
        />
        <div className="institute-name-wrapper">
          <span className="institute-name">
            ФКУЗ РОСТОВСКИЙ-НА-ДОНУ
            <br />
            ПРОТИВОЧУМНЫЙ ИНСТИТУТ
            <br />
            РОСПОТРЕБНАДЗОРА
          </span>
        </div>
      </div>

      {/* Правый блок: навигация */}
      <div className="header-right">
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
            <>
              <li className="divider"></li>
              <li className="user-menu">
                <span className="username">{user.email}</span>
                <button className="logout-button" onClick={onLogout}>
                  Выйти
                </button>
              </li>
            </>
          ) : (
            !isLoginPage && (
              <li>
                <Link to="/login" className="login-button">
                  Войти
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </header>
  )
}
