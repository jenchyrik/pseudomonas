import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import PropTypes from 'prop-types';
import DateRangePicker from './DateRangePicker.jsx';
import './Map.css';
import SaveImageModal from './SaveImageModal.jsx';
import AddStrainModal from './AddStrainModal';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import 'leaflet.markercluster';

// Исправляем проблему с иконками маркеров
let DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ user }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [points, setPoints] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddStrainModalOpen, setIsAddStrainModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    genotype: {
      indel1: false,
      indel2: false
    },
    resistanceGenes: {
      blaVIM: false,
      blaNDM: false,
      carbapenems: false
    },
    source: {
      blood: false,
      sputum: false,
      water: false
    }
  });

  // Функция для получения точек с сервера
  const fetchPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(getApiUrl(API_ENDPOINTS.points.getAll), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPoints(response.data);
    } catch (error) {
      console.error('Error fetching points:', error);
      setNotification({
        open: true,
        message: 'Ошибка при загрузке данных',
        severity: 'error'
      });
    }
  };

  // Функция для отображения точек на карте
  const displayPoints = () => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;

    // Очищаем существующие маркеры
    clusterGroupRef.current.clearLayers();

    points.forEach(point => {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: L.icon({
          iconUrl: '/images/marker-icon.png',
          shadowUrl: '/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      });

      const popupContent = `
        <div class="marker-popup">
          <h3>${point.strainName}</h3>
          <p><strong>CRISPR тип:</strong> ${point.crisprType}</p>
          <p><strong>Indel генотип:</strong> ${point.indelGenotype}</p>
          <p><strong>Серогруппа:</strong> ${point.serogroup}</p>
          <p><strong>Тип жгутикового антигена:</strong> ${point.flagellarAntigen}</p>
          <p><strong>Мукоидный фенотип:</strong> ${point.mucoidPhenotype}</p>
          <p><strong>exoS:</strong> ${point.exoS}</p>
          <p><strong>exoU:</strong> ${point.exoU}</p>
          <p><strong>Дата:</strong> ${new Date(point.date).toLocaleDateString()}</p>
          <p><strong>Объект выделения:</strong> ${point.isolationObject}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      clusterGroupRef.current.addLayer(marker);
    });

    // Если есть маркеры, центрируем карту на них
    if (points.length > 0) {
      const bounds = clusterGroupRef.current.getBounds();
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50]
      });
    }
  };

  // Загружаем точки при монтировании компонента
  useEffect(() => {
    fetchPoints();
  }, []);

  // Обновляем маркеры при изменении точек или карты
  useEffect(() => {
    displayPoints();
  }, [points, mapInstanceRef.current]);

  const handleFilterChange = (category, name, checked) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: checked
      }
    }))
  }

  const handleDateRangeSelect = (range) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range
    }))
    console.log('Selected range:', range)
  }

  const handleAddStrain = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotification({
          open: true,
          message: 'Необходимо авторизоваться',
          severity: 'error'
        });
        return;
      }

      console.log('Полученные данные:', data);
      console.log('Тип даты:', typeof data.date);
      console.log('Значение даты:', data.date);

      const formattedData = {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        date: data.date
      };

      console.log('Отформатированные данные:', formattedData);
      console.log('Тип даты после форматирования:', typeof formattedData.date);
      console.log('Полный объект для отправки:', JSON.stringify(formattedData, null, 2));

      const response = await axios.post(getApiUrl(API_ENDPOINTS.points.create), formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Ответ сервера:', response.data);

      // Обновляем список точек после успешного добавления
      await fetchPoints();

      setNotification({
        open: true,
        message: 'Данные успешно добавлены',
        severity: 'success'
      });
      
      setTimeout(() => {
        setNotification(prev => ({
          ...prev,
          open: false
        }));
      }, 3000);
    } catch (error) {
      console.error('Error adding strain:', error);
      console.error('Детали ошибки:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Ошибка при добавлении данных',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    // Apply filters to map data when filters change
    if (mapInstanceRef.current) {
      console.log('Applying filters:', filters)
      // Here you would implement the logic to filter the map data based on the selected filters
    }
  }, [filters, mapInstanceRef.current])

  useEffect(() => {
    console.log('Карта инициализируется...')

    const map = L.map('map', {
      zoomControl: false,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      minZoom: 0,
      maxZoom: 19,
      zoomSnap: 0.5,
      zoomDelta: 0.5
    }).setView([47.2313, 39.7233], 13)

    mapInstanceRef.current = map
    mapRef.current = map

    // Базовый слой OpenStreetMap
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      zIndex: 1,
      maxZoom: 19
    })

    // Слой antiplague.ru
    const antiplagueLayer = L.tileLayer('http://localhost:3001/tiles/Khersonskaya/{z}/{x}/{y}.png', {
      attribution: '© Antiplague',
      opacity: 1,
      zIndex: 2,
      maxZoom: 19,
      minZoom: 0,
      crossOrigin: true,
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      tileSize: 256,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    })

    // Добавляем слои в правильном порядке
    osmLayer.addTo(map)
    antiplagueLayer.addTo(map)

    // Добавляем обработчик ошибок загрузки тайлов
    antiplagueLayer.on('tileerror', function(e) {
      e.tile.src = antiplagueLayer.options.errorTileUrl;
    });

    // Отключаем вывод ошибок в консоль для тайлов
    const originalConsoleError = console.error;
    console.error = function(...args) {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('Ошибка загрузки тайла')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Создаем группу кластеризации после инициализации карты
    clusterGroupRef.current = new L.MarkerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      spiderLegPolylineOptions: { weight: 1.5, color: '#222', opacity: 0.5 }
    });

    // Добавляем группу кластеризации на карту
    map.addLayer(clusterGroupRef.current);

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
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
      }
      map.remove();
    }
  }, []);

  return (
    <div className="map-wrapper">
      <div id="map"></div>

      {user?.role === 'editor' && (
        <button 
          className="add-data-button"
          onClick={() => setIsAddStrainModalOpen(true)}
        >
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
      )}

      <div className="map-control-panel">
        <div className="panel-header">
          <h2 className="system-title">ГИС по P.aeruginosa</h2>
        </div>

        <div className="panel-content">
          <DateRangePicker
            onRangeSelect={handleDateRangeSelect}
          />
          
          <div className="filter-section">
            <div className="filter-group">
              <h3 className="filter-title">Генотип</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="genotype-indel1" 
                    checked={filters.genotype.indel1}
                    onChange={(e) => handleFilterChange('genotype', 'indel1', e.target.checked)}
                  />
                  <span>INDEL-1</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="genotype-indel2" 
                    checked={filters.genotype.indel2}
                    onChange={(e) => handleFilterChange('genotype', 'indel2', e.target.checked)}
                  />
                  <span>INDEL-2</span>
                </label>
              </div>
            </div>
            
            <div className="filter-group">
              <h3 className="filter-title">Гены резистентности</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="resistance-blaVIM" 
                    checked={filters.resistanceGenes.blaVIM}
                    onChange={(e) => handleFilterChange('resistanceGenes', 'blaVIM', e.target.checked)}
                  />
                  <span>blaVIM</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="resistance-blaNDM" 
                    checked={filters.resistanceGenes.blaNDM}
                    onChange={(e) => handleFilterChange('resistanceGenes', 'blaNDM', e.target.checked)}
                  />
                  <span>blaNDM</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="resistance-carbapenems" 
                    checked={filters.resistanceGenes.carbapenems}
                    onChange={(e) => handleFilterChange('resistanceGenes', 'carbapenems', e.target.checked)}
                  />
                  <span>карбапенемазы</span>
                </label>
              </div>
            </div>
            
            <div className="filter-group">
              <h3 className="filter-title">Источник</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="source-blood" 
                    checked={filters.source.blood}
                    onChange={(e) => handleFilterChange('source', 'blood', e.target.checked)}
                  />
                  <span>Кровь</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="source-sputum" 
                    checked={filters.source.sputum}
                    onChange={(e) => handleFilterChange('source', 'sputum', e.target.checked)}
                  />
                  <span>Мокрота</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    name="source-water" 
                    checked={filters.source.water}
                    onChange={(e) => handleFilterChange('source', 'water', e.target.checked)}
                  />
                  <span>Вода</span>
                </label>
              </div>
            </div>
          </div>
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
        mapInstance={mapInstanceRef.current}
      />

      <AddStrainModal
        open={isAddStrainModalOpen}
        onClose={() => setIsAddStrainModalOpen(false)}
        onSubmit={handleAddStrain}
      />

      {notification && (
        <div className={`notification ${notification.severity}`}>
          {notification.message}
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

Map.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired
  })
}

export default Map;
