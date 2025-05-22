import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import AddStrainModal from './AddStrainModal';
import AddDataSelectionModal from './AddDataSelectionModal';
import ImportTableModal from './ImportTableModal';
import { getMapCenter } from '../utils/mapUtils';
import { Point } from '../types/point';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const Map: React.FC = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isAddStrainModalOpen, setIsAddStrainModalOpen] = useState(false);
  const [isImportTableModalOpen, setIsImportTableModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; severity: string } | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const handleAddDataClick = () => {
    setIsSelectionModalOpen(true);
  };

  const handleFormSelect = () => {
    setIsSelectionModalOpen(false);
    setIsAddStrainModalOpen(true);
  };

  const handleImportSelect = () => {
    setIsSelectionModalOpen(false);
    setIsImportTableModalOpen(true);
  };

  const handleAddStrain = (data: any) => {
    // Handle adding new strain
    setNotification({
      message: 'Штамм успешно добавлен',
      severity: 'success'
    });
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

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

  return (
    <div className="map-container">
      <button
        className="add-data-button"
        onClick={handleAddDataClick}
      >
        Добавить данные
      </button>

      <MapContainer
        center={getMapCenter(points)}
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

      <AddDataSelectionModal
        open={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onFormSelect={handleFormSelect}
        onImportSelect={handleImportSelect}
      />

      <AddStrainModal
        open={isAddStrainModalOpen}
        onClose={() => setIsAddStrainModalOpen(false)}
        onSubmit={handleAddStrain}
      />

      <ImportTableModal
        open={isImportTableModalOpen}
        onClose={() => setIsImportTableModalOpen(false)}
      />

      {notification && (
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