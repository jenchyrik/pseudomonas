import html2canvas from 'html2canvas'
import PropTypes from 'prop-types'
import { useCallback, useEffect, useState } from 'react'
import './SaveImageModal.css'

export default function SaveImageModal({ isOpen, onClose, mapInstance }) {
  const [imageFormat, setImageFormat] = useState('png')
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const generatePreview = useCallback(async () => {
    if (!mapInstance) return

    try {
      const container = mapInstance.getContainer()
      const mapControlPanel = document.querySelector('.map-control-panel')

      const mapRect = container.getBoundingClientRect()
      const panelRect = mapControlPanel?.getBoundingClientRect()

      const leftOffset = panelRect ? panelRect.width : 0

      const visibleWidth = mapRect.width - leftOffset

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false,
        imageTimeout: 0,
        width: visibleWidth,
        x: leftOffset,
        onclone: (clonedDoc, element) => {
          const mapElements = element.querySelectorAll(
            '.leaflet-tile, .leaflet-marker-icon, .leaflet-popup, .leaflet-tooltip'
          )
          mapElements.forEach(el => {
            el.style.borderRadius = '0'
            el.style.overflow = 'hidden'
          })

          const zoomControls = element.querySelectorAll(
            '.leaflet-control-container'
          )
          zoomControls.forEach(control => {
            control.remove()
          })

          element.style.borderRadius = '0'
          const mapPane = element.querySelector('.leaflet-map-pane')
          if (mapPane) {
            mapPane.style.borderRadius = '0'
          }
        },
      })

      canvas.toBlob(
        blob => {
          const url = URL.createObjectURL(blob)
          setPreviewUrl(url)
        },
        `image/${imageFormat}`,
        imageFormat === 'jpeg' ? 0.9 : 1.0
      )
    } catch (error) {
      console.error('Ошибка при создании предпросмотра:', error)
    }
  }, [mapInstance, imageFormat])

  useEffect(() => {
    if (isOpen && mapInstance) {
      generatePreview()
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }, [isOpen, mapInstance, generatePreview])

  const handleSave = async () => {
    if (!mapInstance || !previewUrl) return

    setIsLoading(true)
    try {
      const link = document.createElement('a')
      link.href = previewUrl
      link.download = `map-screenshot-${new Date()
        .toISOString()
        .slice(0, 10)}.${imageFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Ошибка при сохранении изображения:', error)
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  const handleOverlayClick = e => {
    if (e.target.className === 'save-image-modal-overlay') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="save-image-modal-overlay" onClick={handleOverlayClick}>
      <div className="save-image-modal">
        <h2>Сохранить изображение карты</h2>

        <div className="modal-content">
          <div className="preview-container">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Предпросмотр карты"
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                Загрузка предпросмотра...
              </div>
            )}
          </div>

          <div className="controls-container">
            <div className="format-selector">
              <div className="format-toggle">
                <input
                  type="radio"
                  id="png"
                  name="format"
                  value="png"
                  checked={imageFormat === 'png'}
                  onChange={e => {
                    setImageFormat(e.target.value)
                    generatePreview()
                  }}
                />
                <label htmlFor="png">PNG</label>

                <input
                  type="radio"
                  id="jpeg"
                  name="format"
                  value="jpeg"
                  checked={imageFormat === 'jpeg'}
                  onChange={e => {
                    setImageFormat(e.target.value)
                    generatePreview()
                  }}
                />
                <label htmlFor="jpeg">JPEG</label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-button save"
                onClick={handleSave}
                disabled={isLoading || !previewUrl}
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                className="modal-button cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

SaveImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mapInstance: PropTypes.object,
}
