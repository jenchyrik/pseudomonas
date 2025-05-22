import { useState } from 'react'
import LoginHistory from './admin/LoginHistory'
import ErrorLogs from './admin/ErrorLogs'
import PointsManagement from './admin/PointsManagement'
import UserManagement from './admin/UserManagement'
import './AdminPanel.css'

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
    <div className="admin-panel">
      <h1 className="admin-title">Панель администратора</h1>
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  )
}
