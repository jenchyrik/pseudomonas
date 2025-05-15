import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, Stack } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

interface AddStrainModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const AddStrainModal: React.FC<AddStrainModalProps> = ({ open, onClose, onSubmit }) => {
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
    date: null as Date | null,
    isolationObject: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.strainName) newErrors.strainName = 'Обязательное поле';
    if (!formData.crisprType) newErrors.crisprType = 'Обязательное поле';
    if (!formData.indelGenotype) newErrors.indelGenotype = 'Обязательное поле';
    if (!formData.serogroup) newErrors.serogroup = 'Обязательное поле';
    if (!formData.flagellarAntigen) newErrors.flagellarAntigen = 'Обязательное поле';
    if (!formData.mucoidPhenotype) newErrors.mucoidPhenotype = 'Обязательное поле';
    if (!formData.exoS) newErrors.exoS = 'Обязательное поле';
    if (!formData.exoU) newErrors.exoU = 'Обязательное поле';
    if (!formData.date) newErrors.date = 'Обязательное поле';
    if (!formData.isolationObject) newErrors.isolationObject = 'Обязательное поле';

    // Валидация координат
    if (!formData.latitude) {
      newErrors.latitude = 'Обязательное поле';
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Широта должна быть от -90 до 90';
      }
    }

    if (!formData.longitude) {
      newErrors.longitude = 'Обязательное поле';
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Долгота должна быть от -180 до 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Исходная дата:', formData.date);
      console.log('Тип даты:', formData.date instanceof Date);
      
      const submitData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date
      };

      console.log('Данные для отправки:', submitData);
      console.log('Тип даты после форматирования:', typeof submitData.date);
      console.log('Значение даты:', submitData.date);
      
      onSubmit(submitData);
      // Очищаем форму после успешной отправки
      setFormData({
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
        date: null,
        isolationObject: '',
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="add-strain-modal"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Добавить данные о штамме
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              name="strainName"
              label="Название штамма"
              value={formData.strainName}
              onChange={handleChange}
              error={!!errors.strainName}
              helperText={errors.strainName}
              required
              fullWidth
            />
            <TextField
              name="crisprType"
              label="CRISPR тип"
              value={formData.crisprType}
              onChange={handleChange}
              error={!!errors.crisprType}
              helperText={errors.crisprType}
              required
              fullWidth
            />
            <TextField
              name="indelGenotype"
              label="Indel генотип"
              value={formData.indelGenotype}
              onChange={handleChange}
              error={!!errors.indelGenotype}
              helperText={errors.indelGenotype}
              required
              fullWidth
            />
            <TextField
              name="serogroup"
              label="Серогруппа"
              value={formData.serogroup}
              onChange={handleChange}
              error={!!errors.serogroup}
              helperText={errors.serogroup}
              required
              fullWidth
            />
            <TextField
              name="flagellarAntigen"
              label="Тип жгутикового антигена"
              value={formData.flagellarAntigen}
              onChange={handleChange}
              error={!!errors.flagellarAntigen}
              helperText={errors.flagellarAntigen}
              required
              fullWidth
            />
            <TextField
              name="mucoidPhenotype"
              label="Мукоидный фенотип"
              value={formData.mucoidPhenotype}
              onChange={handleChange}
              error={!!errors.mucoidPhenotype}
              helperText={errors.mucoidPhenotype}
              required
              fullWidth
            />
            <TextField
              name="exoS"
              label="exoS"
              value={formData.exoS}
              onChange={handleChange}
              error={!!errors.exoS}
              helperText={errors.exoS}
              required
              fullWidth
            />
            <TextField
              name="exoU"
              label="ExoU"
              value={formData.exoU}
              onChange={handleChange}
              error={!!errors.exoU}
              helperText={errors.exoU}
              required
              fullWidth
            />
            <TextField
              name="latitude"
              label="Широта"
              type="number"
              value={formData.latitude}
              onChange={handleChange}
              error={!!errors.latitude}
              helperText={errors.latitude}
              required
              fullWidth
              inputProps={{ step: "0.00000001" }}
            />
            <TextField
              name="longitude"
              label="Долгота"
              type="number"
              value={formData.longitude}
              onChange={handleChange}
              error={!!errors.longitude}
              helperText={errors.longitude}
              required
              fullWidth
              inputProps={{ step: "0.00000001" }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Дата"
                value={formData.date}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.date,
                    helperText: errors.date
                  }
                }}
              />
            </LocalizationProvider>
            <TextField
              name="isolationObject"
              label="Объект выделения"
              value={formData.isolationObject}
              onChange={handleChange}
              error={!!errors.isolationObject}
              helperText={errors.isolationObject}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" onClick={onClose}>
                Отмена
              </Button>
              <Button variant="contained" type="submit">
                Добавить
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Modal>
  );
};

export default AddStrainModal; 