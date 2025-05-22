import { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../../services/api'
import '../../styles/components/_admin.scss'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add', 'edit', 'password'
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setModalMode('add')
    setFormData({ email: '', password: '', role: 'user' })
    setShowModal(true)
  }

  const handleEditUser = user => {
    setModalMode('edit')
    setSelectedUser(user)
    setFormData({ email: user.email, role: user.role })
    setShowModal(true)
  }

  const handleChangePassword = user => {
    setModalMode('password')
    setSelectedUser(user)
    setFormData({ password: '' })
    setShowModal(true)
  }

  const handleDeleteUser = async userId => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await deleteUser(userId)
        await fetchUsers()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (modalMode === 'add') {
        await createUser(formData)
      } else if (modalMode === 'edit') {
        await updateUser(selectedUser.id, formData)
      } else if (modalMode === 'password') {
        await changePassword(selectedUser.id, formData.password)
      }
      await fetchUsers()
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>
  }

  return (
    <div className="users-container" style={{ paddingBottom: '10px' }}>
      <div className="admin-header">
        <div className="admin-actions">
          <button className="action-button add" onClick={handleAddUser}>
            Добавить пользователя
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  {user.role === 'admin' 
                    ? 'Администратор' 
                    : user.role === 'editor' 
                      ? 'Редактор' 
                      : 'Пользователь'}
                </td>
                <td>
                  <button
                    className="action-button edit"
                    onClick={() => handleEditUser(user)}
                  >
                    Изменить
                  </button>
                  <button
                    className="action-button edit"
                    onClick={() => handleChangePassword(user)}
                  >
                    Сменить пароль
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <button 
              className="modal-close" 
              onClick={() => setShowModal(false)}
              aria-label="Закрыть окно"
            >
              ×
            </button>
            <h3 id="modal-title" className="modal-title">
              {modalMode === 'add' && 'Добавить пользователя'}
              {modalMode === 'edit' && 'Редактировать пользователя'}
              {modalMode === 'password' && 'Изменить пароль'}
            </h3>
            <form className="admin-form" onSubmit={handleSubmit} role="form" aria-label="Форма управления пользователем">
              {(modalMode === 'add' || modalMode === 'edit') && (
                <>
                  <div className="form-group">
                    <label htmlFor="user-email">Email</label>
                    <input
                      type="email"
                      id="user-email"
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="user-role">Роль</label>
                    <select
                      id="user-role"
                      value={formData.role}
                      onChange={e =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      required
                      aria-required="true"
                    >
                      <option value="user">Пользователь</option>
                      <option value="editor">Редактор</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                </>
              )}
              {(modalMode === 'add' || modalMode === 'password') && (
                <div className="form-group">
                  <label htmlFor="user-password">Пароль</label>
                  <input
                    type="password"
                    id="user-password"
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    aria-required="true"
                  />
                </div>
              )}
              <button 
                type="submit" 
                className="action-button edit"
                aria-label={
                  modalMode === 'add' ? 'Добавить пользователя' :
                  modalMode === 'edit' ? 'Сохранить изменения' :
                  'Изменить пароль'
                }
              >
                {modalMode === 'add' && 'Добавить'}
                {modalMode === 'edit' && 'Сохранить'}
                {modalMode === 'password' && 'Изменить пароль'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
