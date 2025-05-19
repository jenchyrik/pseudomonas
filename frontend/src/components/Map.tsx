import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import AddStrainModal from './AddStrainModal';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import './Map.css';

const Map: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [points, setPoints] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(getApiUrl(API_ENDPOINTS.points.get), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPoints(response.data);
      } catch (error) {
        console.error('Error fetching points:', error);
      }
    };

    fetchPoints();
  }, []);

  const handleAddStrain = async (data: any) => {
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

      const response = await axios.post(getApiUrl(API_ENDPOINTS.points.create), data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPoints(prev => [...prev, response.data]);

      setNotification({
        open: true,
        message: 'Данные успешно добавлены',
        severity: 'success'
      });
    } catch (error: any) {
      console.error('Error adding strain:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Ошибка при добавлении данных',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Определяем центр карты
  const getMapCenter = (): [number, number] => {
    if (points.length > 0) {
      // Если есть точки, центрируем на первой точке
      return [points[0].latitude, points[0].longitude];
    }
    // Если точек нет, центрируем на Ростове-на-Дону
    return [47.2357, 39.7015];
  };

  return (
    <div className="map-container">
      <button
        className="add-data-button"
        onClick={() => setIsModalOpen(true)}
      >
        Добавить данные
      </button>

      <MapContainer
        center={getMapCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map((point, index) => (
          <Marker
            key={index}
            position={[point.latitude, point.longitude]}
          >
            <Popup>
              {point.name || 'Точка'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <AddStrainModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStrain}
      />

      {notification.open && (
        <div className={`notification ${notification.severity}`}>
          <div className="notification-content">
            {notification.message}
            <button className="notification-close" onClick={handleCloseNotification}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map; 