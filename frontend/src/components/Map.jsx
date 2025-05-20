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
import * as XLSX from 'xlsx';

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
    strainName: '',
    flagellarAntigen: {
      A1: false,
      A2: false,
      B: false,
      UNDEFINED: false
    },
    mucoidPhenotype: {
      'mutant': false,
      'wild type': false
    },
    exoS: {
      '+': false,
      '-': false
    },
    exoU: {
      '+': false,
      '-': false
    }
  });
  const [filteredPoints, setFilteredPoints] = useState([]);

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

  // Функция для фильтрации точек
  const filterPoints = (points) => {
    return points.filter(point => {
      // Фильтр по названию штамма
      if (filters.strainName && !point.strainName.toLowerCase().includes(filters.strainName.toLowerCase())) {
        return false;
      }

      // Фильтр по жгутиковому антигену
      const hasFlagellarAntigen = Object.entries(filters.flagellarAntigen).some(([key, value]) => value && point.flagellarAntigen === key);
      if (Object.values(filters.flagellarAntigen).some(v => v) && !hasFlagellarAntigen) {
        return false;
      }

      // Фильтр по мукоидному фенотипу
      const hasMucoidPhenotype = Object.entries(filters.mucoidPhenotype).some(([key, value]) => value && point.mucoidPhenotype === key);
      if (Object.values(filters.mucoidPhenotype).some(v => v) && !hasMucoidPhenotype) {
        return false;
      }

      // Фильтр по ExoS
      const hasExoS = Object.entries(filters.exoS).some(([key, value]) => value && point.exoS === key);
      if (Object.values(filters.exoS).some(v => v) && !hasExoS) {
        return false;
      }

      // Фильтр по ExoU
      const hasExoU = Object.entries(filters.exoU).some(([key, value]) => value && point.exoU === key);
      if (Object.values(filters.exoU).some(v => v) && !hasExoU) {
        return false;
      }

      // Фильтр по дате
      if (filters.dateRange.start && filters.dateRange.end) {
        const pointDate = new Date(point.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (pointDate < startDate || pointDate > endDate) {
          return false;
        }
      }

      return true;
    });
  };

  // Обновляем отфильтрованные точки при изменении фильтров или точек
  useEffect(() => {
    setFilteredPoints(filterPoints(points));
  }, [filters, points]);

  // Обновляем маркеры при изменении отфильтрованных точек
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;

    // Очищаем существующие маркеры
    clusterGroupRef.current.clearLayers();

    filteredPoints.forEach(point => {
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
    if (filteredPoints.length > 0) {
      const bounds = clusterGroupRef.current.getBounds();
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50]
      });
    }
  }, [filteredPoints, mapInstanceRef.current]);

  // Загружаем точки при монтировании компонента
  useEffect(() => {
    fetchPoints();
  }, []);

  const handleFilterChange = (category, name, value) => {
    if (category === 'strainName') {
      setFilters(prev => ({
        ...prev,
        strainName: value
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [name]: value
        }
      }));
    }
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

  const handleExportToExcel = () => {
    // Подготавливаем данные для экспорта
    const exportData = filteredPoints.map(point => ({
      'Название штамма': point.strainName,
      'CRISPR тип': point.crisprType,
      'Indel генотип': point.indelGenotype,
      'Серогруппа': point.serogroup,
      'Тип жгутикового антигена': point.flagellarAntigen,
      'Мукоидный фенотип': point.mucoidPhenotype,
      'ExoS': point.exoS,
      'ExoU': point.exoU,
      'Дата': new Date(point.date).toLocaleDateString(),
      'Объект выделения': point.isolationObject,
      'Широта': point.latitude,
      'Долгота': point.longitude
    }));

    // Создаем рабочую книгу Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Устанавливаем ширину столбцов
    const colWidths = [
      { wch: 20 }, // Название штамма
      { wch: 15 }, // CRISPR тип
      { wch: 15 }, // Indel генотип
      { wch: 15 }, // Серогруппа
      { wch: 20 }, // Тип жгутикового антигена
      { wch: 20 }, // Мукоидный фенотип
      { wch: 10 }, // ExoS
      { wch: 10 }, // ExoU
      { wch: 15 }, // Дата
      { wch: 20 }, // Объект выделения
      { wch: 12 }, // Широта
      { wch: 12 }  // Долгота
    ];
    ws['!cols'] = colWidths;

    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(wb, ws, 'Точки');

    // Генерируем имя файла с текущей датой
    const fileName = `points_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Сохраняем файл
    XLSX.writeFile(wb, fileName);
  };

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
              <h3 className="filter-title">Штамм</h3>
              <input
                type="text"
                placeholder="Поиск по названию"
                value={filters.strainName}
                onChange={(e) => handleFilterChange('strainName', '', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Жгутиковый антиген</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.flagellarAntigen.A1}
                    onChange={(e) => handleFilterChange('flagellarAntigen', 'A1', e.target.checked)}
                  />
                  <span>A1</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.flagellarAntigen.A2}
                    onChange={(e) => handleFilterChange('flagellarAntigen', 'A2', e.target.checked)}
                  />
                  <span>A2</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.flagellarAntigen.B}
                    onChange={(e) => handleFilterChange('flagellarAntigen', 'B', e.target.checked)}
                  />
                  <span>B</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.flagellarAntigen.UNDEFINED}
                    onChange={(e) => handleFilterChange('flagellarAntigen', 'UNDEFINED', e.target.checked)}
                  />
                  <span>Не определен</span>
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">Мукоидный фенотип</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.mucoidPhenotype['mutant']}
                    onChange={(e) => handleFilterChange('mucoidPhenotype', 'mutant', e.target.checked)}
                  />
                  <span>Mutant</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.mucoidPhenotype['wild type']}
                    onChange={(e) => handleFilterChange('mucoidPhenotype', 'wild type', e.target.checked)}
                  />
                  <span>wild type</span>
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">ExoS</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.exoS['+']}
                    onChange={(e) => handleFilterChange('exoS', '+', e.target.checked)}
                  />
                  <span>+</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.exoS['-']}
                    onChange={(e) => handleFilterChange('exoS', '-', e.target.checked)}
                  />
                  <span>-</span>
                </label>
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-title">ExoU</h3>
              <div className="filter-checkboxes">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.exoU['+']}
                    onChange={(e) => handleFilterChange('exoU', '+', e.target.checked)}
                  />
                  <span>+</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.exoU['-']}
                    onChange={(e) => handleFilterChange('exoU', '-', e.target.checked)}
                  />
                  <span>-</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button 
            className="download-button"
            onClick={handleExportToExcel}
          >
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

