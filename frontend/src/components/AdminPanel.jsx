import { useState } from 'react'
import PropTypes from 'prop-types'
import LoginHistory from './admin/LoginHistory'
import ErrorLogs from './admin/ErrorLogs'
import PointsManagement from './admin/PointsManagement'
import UserManagement from './admin/UserManagement'
import './AdminPanel.scss'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users')

  const tabs = [
    { id: 'users', label: 'Пользователи' },
    { id: 'logins', label: 'История входов' },
    { id: 'errors', label: 'Логи ошибок' },
    { id: 'points', label: 'Штаммы' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />
      case 'logins':
        return <LoginHistory />
      case 'errors':
        return <ErrorLogs />
      case 'points':
        return <PointsManagement />
      default:
        return null
    }
  }

  return (
    <main className="admin-panel" role="main">
      <h1 className="admin-title">Панель администратора</h1>
      <nav className="admin-tabs" role="tablist" aria-label="Навигация по разделам">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section 
        className="admin-content"
        role="tabpanel"
        aria-labelledby={`${activeTab}-tab`}
        id={`${activeTab}-panel`}
      >
        {renderContent()}
      </section>
    </main>
  )
}

AdminPanel.propTypes = {
  // Add any necessary prop types here
}
