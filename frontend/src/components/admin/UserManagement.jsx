import { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deleteUser, changePassword } from '../../services/api'

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
    <div>
      <div className="admin-header">
        <h2>Управление пользователями</h2>
        <button className="action-button edit" onClick={handleAddUser}>
          Добавить пользователя
        </button>
      </div>

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
              <td>{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3 className="modal-title">
              {modalMode === 'add' && 'Добавить пользователя'}
              {modalMode === 'edit' && 'Редактировать пользователя'}
              {modalMode === 'password' && 'Изменить пароль'}
            </h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              {(modalMode === 'add' || modalMode === 'edit') && (
                <>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Роль</label>
                    <select
                      value={formData.role}
                      onChange={e =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      required
                    >
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                </>
              )}
              {(modalMode === 'add' || modalMode === 'password') && (
                <div className="form-group">
                  <label>Пароль</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}
              <button type="submit" className="action-button edit">
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
