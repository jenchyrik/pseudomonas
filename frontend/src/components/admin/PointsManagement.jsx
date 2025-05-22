import { useEffect, useState } from 'react'
import { getApiUrl } from '../../config/api'

export default function PointsManagement() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [formData, setFormData] = useState({
    strainName: '',
    crisprType: '',
    indelGenotype: '',
    serogroup: '',
    flagellarAntigen: '',
    mucoidPhenotype: '',
    exoS: '',
    exoU: '',
    latitude: '',
    longitude: '',
    date: '',
    isolationObject: ''
  })
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPointDetails, setSelectedPointDetails] = useState(null);

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl('/points'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch points')
      }

      const data = await response.json()
      setPoints(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPoint = point => {
    setSelectedPoint(point)
    setFormData({
      strainName: point.strainName || '',
      crisprType: point.crisprType || '',
      indelGenotype: point.indelGenotype || '',
      serogroup: point.serogroup || '',
      flagellarAntigen: point.flagellarAntigen || '',
      mucoidPhenotype: point.mucoidPhenotype || '',
      exoS: point.exoS || '',
      exoU: point.exoU || '',
      latitude: point.latitude || '',
      longitude: point.longitude || '',
      date: point.date ? new Date(point.date).toISOString().split('T')[0] : '',
      isolationObject: point.isolationObject || ''
    })
    setShowModal(true)
  }

  const handleDeletePoint = async pointId => {
    if (window.confirm('Вы уверены, что хотите удалить эту точку?')) {
      try {
        const response = await fetch(getApiUrl(`/points/${pointId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to delete point')
        }

        await fetchPoints()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const isDuplicate = (newPoint) => {
    return points.some(point => 
      point.strainName === newPoint.strainName &&
      point.latitude === parseFloat(newPoint.latitude) &&
      point.longitude === parseFloat(newPoint.longitude) &&
      new Date(point.date).toISOString().split('T')[0] === newPoint.date
    );
  };

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      // Преобразуем числовые значения
      const formattedData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        createdBy: localStorage.getItem('userEmail') || 'unknown'
      }

      // Проверяем на дубликат
      if (isDuplicate(formattedData)) {
        setError('Штамм с такими данными уже существует');
        return;
      }

      const response = await fetch(getApiUrl(`/points/${selectedPoint.id}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update point')
      }

      await fetchPoints()
      setShowModal(false)
    } catch (err) {
      setError(err.message)
      console.error('Error updating point:', err)
    }
  }

  const handleShowDetails = (point) => {
    setSelectedPointDetails(point);
    setShowDetailsModal(true);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>
  }

  return (
    <div className="points-container" style={{ paddingBottom: '10px' }}>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Штамм</th>
              <th>Дата</th>
              <th>Автор</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {points.map(point => (
              <tr key={point.id}>
                <td>{point.id}</td>
                <td>{point.strainName}</td>
                <td>{new Date(point.date).toLocaleDateString()}</td>
                <td>{point.createdBy}</td>
                <td>
                  <button
                    className="action-button details"
                    onClick={() => handleShowDetails(point)}
                  >
                    Подробнее
                  </button>
                  <button
                    className="action-button edit"
                    onClick={() => handleEditPoint(point)}
                  >
                    Изменить
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeletePoint(point.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedPointDetails && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <button 
              className="modal-close" 
              onClick={() => setShowDetailsModal(false)}
              aria-label="Закрыть окно"
            >
              ×
            </button>
            <h3 id="modal-title" className="modal-title">Подробная информация о штамме</h3>
            <div className="details-content">
              <dl>
                <dt>ID:</dt>
                <dd>{selectedPointDetails.id}</dd>
                
                <dt>Название штамма:</dt>
                <dd>{selectedPointDetails.strainName}</dd>
                
                <dt>CRISPR тип:</dt>
                <dd>{selectedPointDetails.crisprType}</dd>
                
                <dt>Indel генотип:</dt>
                <dd>{selectedPointDetails.indelGenotype}</dd>
                
                <dt>Серогруппа:</dt>
                <dd>{selectedPointDetails.serogroup}</dd>
                
                <dt>Жгутиковый антиген:</dt>
                <dd>{selectedPointDetails.flagellarAntigen}</dd>
                
                <dt>Мукоидный фенотип:</dt>
                <dd>{selectedPointDetails.mucoidPhenotype}</dd>
                
                <dt>ExoS:</dt>
                <dd>{selectedPointDetails.exoS}</dd>
                
                <dt>ExoU:</dt>
                <dd>{selectedPointDetails.exoU}</dd>
                
                <dt>Широта:</dt>
                <dd>{selectedPointDetails.latitude}</dd>
                
                <dt>Долгота:</dt>
                <dd>{selectedPointDetails.longitude}</dd>
                
                <dt>Дата выделения:</dt>
                <dd>{new Date(selectedPointDetails.date).toLocaleDateString()}</dd>
                
                <dt>Объект выделения:</dt>
                <dd>{selectedPointDetails.isolationObject}</dd>
                
                <dt>Добавлено:</dt>
                <dd>{new Date(selectedPointDetails.createdAt).toLocaleString()}</dd>
                
                <dt>Добавил:</dt>
                <dd>{selectedPointDetails.createdBy}</dd>
              </dl>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <h3 className="modal-title">Редактировать точку</h3>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Наименование штамма</label>
                <input
                  type="text"
                  value={formData.strainName}
                  onChange={e =>
                    setFormData({ ...formData, strainName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Тип CRISPR</label>
                <input
                  type="text"
                  value={formData.crisprType}
                  onChange={e =>
                    setFormData({ ...formData, crisprType: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Генотип indel</label>
                <input
                  type="text"
                  value={formData.indelGenotype}
                  onChange={e =>
                    setFormData({ ...formData, indelGenotype: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Серогруппа</label>
                <input
                  type="text"
                  value={formData.serogroup}
                  onChange={e =>
                    setFormData({ ...formData, serogroup: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Жгутиковый антиген</label>
                <input
                  type="text"
                  value={formData.flagellarAntigen}
                  onChange={e =>
                    setFormData({ ...formData, flagellarAntigen: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Мукоидный фенотип</label>
                <input
                  type="text"
                  value={formData.mucoidPhenotype}
                  onChange={e =>
                    setFormData({ ...formData, mucoidPhenotype: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>ExoS</label>
                <input
                  type="text"
                  value={formData.exoS}
                  onChange={e =>
                    setFormData({ ...formData, exoS: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>ExoU</label>
                <input
                  type="text"
                  value={formData.exoU}
                  onChange={e =>
                    setFormData({ ...formData, exoU: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Широта</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={e =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Долгота</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={e =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Дата выделения</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Объект выделения</label>
                <input
                  type="text"
                  value={formData.isolationObject}
                  onChange={e =>
                    setFormData({ ...formData, isolationObject: e.target.value })
                  }
                  required
                />
              </div>
              <button type="submit" className="action-button edit" style={{ width: '100%', marginTop: 'auto' }}>
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 