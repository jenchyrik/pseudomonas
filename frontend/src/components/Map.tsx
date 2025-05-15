import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Button, Snackbar, Alert } from '@mui/material';
import AddStrainModal from './AddStrainModal';
import axios from 'axios';

const Map: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

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

      await axios.post('http://localhost:3000/points', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

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

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
      <Button
        variant="contained"
        onClick={() => setIsModalOpen(true)}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        Добавить данные
      </Button>

      <MapContainer
        center={[55.7558, 37.6173]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>

      <AddStrainModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStrain}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Map; 