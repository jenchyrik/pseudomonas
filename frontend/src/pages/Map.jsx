import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import '../styles/Map.css'

const Map = ({ user, onLogout }) => {
  const mapRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [screenshot, setScreenshot] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  const handleScreenshot = async () => {
    if (!mapRef.current) return

    setIsLoading(true)
    try {
      const screenshot = await html2canvas(mapRef.current, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#1a1a1a',
      })

      const imgData = screenshot.toDataURL('image/png')
      setScreenshot(imgData)
      setShowPopup(true)
    } catch (error) {
      console.error('Ошибка при создании скриншота:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h2>Добро пожаловать, {user.fullName}!</h2>
        <div className="user-info">
          <button className="logout-button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="map-content">
        <div className="map-placeholder" ref={mapRef}>
          <h3>Карта</h3>
          <p>Здесь будет отображаться карта</p>
        </div>
      </div>

      <button className="screenshot-button" onClick={handleScreenshot}>
        Сделать скриншот
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Предпросмотр скриншота</h3>
            {isLoading && (
              <div className="loading-preview">Загрузка предпросмотра...</div>
            )}
            {screenshot && (
              <img
                src={screenshot}
                alt="Скриншот карты"
                className="popup-map"
              />
            )}
            <button
              className="close-button"
              onClick={() => setShowPopup(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Map
