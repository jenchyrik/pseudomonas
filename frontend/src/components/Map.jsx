import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react'
import DateRangePicker from './DateRangePicker.jsx'
import './Map.css'
import SaveImageModal from './SaveImageModal.jsx'

export default function Map() {
  const [mapInstance, setMapInstance] = useState(null)
  const mapRef = useRef(null)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  useEffect(() => {
    console.log('Карта инициализируется...')

    const map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
    }).setView([47.2313, 39.7233], 13)

    setMapInstance(map)
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map)

    const zoomControlContainer = L.DomUtil.create('div', 'custom-zoom-control')

    const buttonsContainer = L.DomUtil.create(
      'div',
      'zoom-buttons-container',
      zoomControlContainer
    )

    const zoomInButton = L.DomUtil.create(
      'button',
      'zoom-in-button',
      buttonsContainer
    )
    zoomInButton.innerHTML = '+'

    const zoomOutButton = L.DomUtil.create(
      'button',
      'zoom-out-button',
      buttonsContainer
    )
    zoomOutButton.innerHTML = '−' 

    L.DomEvent.on(zoomInButton, 'click', function () {
      map.zoomIn()
    })

    L.DomEvent.on(zoomOutButton, 'click', function () {
      map.zoomOut()
    })

    L.DomEvent.disableClickPropagation(zoomControlContainer)

    const CustomZoomControl = L.Control.extend({
      options: {
        position: 'bottomright',
      },

      onAdd: function () {
        return zoomControlContainer
      },
    })

    map.addControl(new CustomZoomControl())

    setTimeout(() => {
      map.invalidateSize()
      setTimeout(() => map.invalidateSize(), 100)
    }, 0)

    document.getElementById('map').addEventListener(
      'wheel',
      function (e) {
        e.stopPropagation()
      },
      { passive: false }
    )

    return () => {
      map.remove()
    }
  }, [])

  return (
    <div className="map-wrapper">
      <div id="map"></div>

      <button className="add-data-button">
        <svg
          className="download-icon"
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
        </svg>
        Добавить данные
      </button>

      <div className="map-control-panel">
        <div className="panel-header">
          <h2 className="system-title">ГИС по P.aeruginosa</h2>
        </div>

        <div className="panel-content">
          <DateRangePicker
            onRangeSelect={range => {
              console.log('Selected range:', range)
            }}
          />
        </div>

        <div className="panel-footer">
          <button className="download-button">
            <svg
              className="download-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path
                d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                fill="currentColor"
              />
            </svg>
            Сохранить таблицу
          </button>
          <button
            className="download-button"
            onClick={() => setIsSaveModalOpen(true)}
          >
            <svg
              className="download-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path
                d="M4 5h13v7h2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8v-2H4V5zm19 11h-4v-4h-2v4h-4v2h4v4h2v-4h4v-2z"
                fill="currentColor"
              />
            </svg>
            Сохранить изображение
          </button>
        </div>
      </div>

      <SaveImageModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        mapInstance={mapInstance}
      />
    </div>
  )
}
