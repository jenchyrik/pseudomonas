import React, { useState, useEffect } from 'react';
import './ImportTableModal.scss';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

interface ImportTableModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface ImportedRow {
  'Название штамма': string;
  'CRISPR тип': string;
  'Indel генотип': string;
  'Серогруппа': string;
  'Тип жгутикового антигена': string;
  'Мукоидный фенотип': string;
  'ExoS': string;
  'ExoU': string;
  'Дата': string;
  'Объект выделения': string;
  'Широта': string | number;
  'Долгота': string | number;
}

interface Point {
  strainName: string;
  crisprType: string;
  indelGenotype: string;
  serogroup: string;
  flagellarAntigen: string;
  mucoidPhenotype: string;
  exoS: string;
  exoU: string;
  date: string;
  isolationObject: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  createdBy: string;
}

const ImportTableModal: React.FC<ImportTableModalProps> = ({ open, onClose, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Сброс состояния при открытии/закрытии модального окна
  useEffect(() => {
    if (open) {
      setFile(null);
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [open]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFile(null);
    setError(null);
    setSuccess(null);
    setLoading(false);
    onClose();
  };

  // Добавляем обработчик для закрытия по клику вне модального окна
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const parseDate = (dateValue: any): string => {
    if (!dateValue) {
      throw new Error('Дата не может быть пустой');
    }

    console.log('Parsing date value:', dateValue, 'Type:', typeof dateValue);

    // Если это число (Excel дата)
    if (typeof dateValue === 'number') {
      // Excel даты хранятся как количество дней с 1 января 1900 года
      // 25569 - это количество дней между 1900-01-01 и 1970-01-01 (начало Unix эпохи)
      const milliseconds = (dateValue - 25569) * 24 * 60 * 60 * 1000;
      const date = new Date(milliseconds);
      
      if (isNaN(date.getTime())) {
        throw new Error(`Некорректное числовое значение даты: ${dateValue}`);
      }
      
      return date.toISOString();
    }

    // Если это строка
    if (typeof dateValue === 'string') {
      // Удаляем лишние пробелы
      const trimmedValue = dateValue.trim();
      
      // Пробуем разные форматы даты
      const dateFormats = [
        { pattern: /^(\d{2})\.(\d{2})\.(\d{4})$/, handler: (match: RegExpMatchArray) => {
          const [_, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }},
        { pattern: /^(\d{4})-(\d{2})-(\d{2})$/, handler: (match: RegExpMatchArray) => {
          const [_, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }},
        { pattern: /^(\d{2})\/(\d{2})\/(\d{4})$/, handler: (match: RegExpMatchArray) => {
          const [_, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }},
        { pattern: /^(\d{4})\/(\d{2})\/(\d{2})$/, handler: (match: RegExpMatchArray) => {
          const [_, year, month, day] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }}
      ];

      for (const format of dateFormats) {
        const match = trimmedValue.match(format.pattern);
        if (match) {
          const date = format.handler(match);
          if (date && !isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
      }

      // Если не удалось распарсить ни один формат, пробуем напрямую
      const directDate = new Date(trimmedValue);
      if (!isNaN(directDate.getTime())) {
        return directDate.toISOString();
      }
    }

    // Если это уже объект Date
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        throw new Error('Некорректный объект даты');
      }
      return dateValue.toISOString();
    }

    throw new Error(`Неподдерживаемый формат даты: ${dateValue}. Поддерживаемые форматы: ДД.ММ.ГГГГ, ГГГГ-ММ-ДД, ДД/ММ/ГГГГ, ГГГГ/ММ/ДД`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ImportedRow>(worksheet);

        console.log('Imported Excel data:', jsonData);

        if (jsonData.length === 0) {
          throw new Error('Файл не содержит данных');
        }

        // Выводим все доступные поля из первой строки для отладки
        console.log('Available fields:', Object.keys(jsonData[0]));

        // Проверяем наличие обязательных полей с учетом возможных вариантов названий
        const dateColumnNames = ['Дата', 'дата', 'ДАТА', 'Date', 'date', 'DATE', 'Дата выделения', 'дата выделения'];
        const dateField = Object.keys(jsonData[0]).find(key => dateColumnNames.includes(key));

        if (!dateField) {
          throw new Error(`В таблице отсутствует столбец с датой. Возможные названия: ${dateColumnNames.join(', ')}`);
        }

        // Проверяем остальные обязательные поля
        const requiredFields = ['Название штамма', 'Широта', 'Долгота'];
        const missingFields = requiredFields.filter(field => !jsonData[0].hasOwnProperty(field));
        
        if (missingFields.length > 0) {
          throw new Error(`В таблице отсутствуют обязательные поля: ${missingFields.join(', ')}`);
        }

        // Получаем существующие точки для проверки дубликатов
        const existingPointsResponse = await fetch(getApiUrl('/points'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const existingPoints = await existingPointsResponse.json() as Point[];

        // Функция проверки дубликатов
        const isDuplicate = (newPoint: Point, pointsToCheck: Point[]) => {
          return pointsToCheck.some(point => {
            const existingDate = new Date(point.date).toISOString().split('T')[0];
            const newDate = new Date(newPoint.date).toISOString().split('T')[0];
            
            return point.strainName === newPoint.strainName &&
                   Math.abs(point.latitude - newPoint.latitude) < 0.000001 &&
                   Math.abs(point.longitude - newPoint.longitude) < 0.000001 &&
                   existingDate === newDate;
          });
        };

        // Преобразуем данные в нужный формат и проверяем на дубликаты
        const processedPoints: Point[] = [];
        const duplicates: Point[] = [];
        const internalDuplicates: Point[] = [];

        for (const row of jsonData) {
          try {
            const dateValue = row[dateField];
            console.log('Processing date value:', dateValue, 'from field:', dateField);
            
            const parsedDate = parseDate(dateValue);
            if (!parsedDate) {
              throw new Error('Неверный формат даты');
            }

            const point: Point = {
              strainName: row['Название штамма'],
              crisprType: row['CRISPR тип'] || '',
              indelGenotype: row['Indel генотип'] || '',
              serogroup: row['Серогруппа'] || '',
              flagellarAntigen: row['Тип жгутикового антигена'] || '',
              mucoidPhenotype: row['Мукоидный фенотип'] || '',
              exoS: row['ExoS'] || '',
              exoU: row['ExoU'] || '',
              date: parsedDate,
              isolationObject: row['Объект выделения'] || '',
              latitude: typeof row['Широта'] === 'string' ? parseFloat(row['Широта']) : row['Широта'],
              longitude: typeof row['Долгота'] === 'string' ? parseFloat(row['Долгота']) : row['Долгота'],
              createdAt: new Date().toISOString(),
              createdBy: localStorage.getItem('userEmail') || 'unknown'
            };

            // Проверяем на дубликат с существующими точками
            if (isDuplicate(point, existingPoints)) {
              duplicates.push(point);
              continue;
            }

            // Проверяем на дубликат внутри загружаемой таблицы
            if (isDuplicate(point, processedPoints)) {
              internalDuplicates.push(point);
              continue;
            }

            processedPoints.push(point);
          } catch (error) {
            console.error('Error processing row:', row, error);
            throw new Error(`Ошибка в строке данных: ${error.message}`);
          }
        }

        // Если есть дубликаты, показываем предупреждение
        if (duplicates.length > 0 || internalDuplicates.length > 0) {
          let errorMessage = '';
          if (duplicates.length > 0) {
            errorMessage += `Найдено ${duplicates.length} дубликатов с существующими данными:\n`;
            duplicates.forEach(point => {
              errorMessage += `- Штамм ${point.strainName} с координатами (${point.latitude}, ${point.longitude}) и датой ${new Date(point.date).toLocaleDateString()}\n`;
            });
          }
          if (internalDuplicates.length > 0) {
            errorMessage += `\nНайдено ${internalDuplicates.length} дубликатов внутри загружаемой таблицы:\n`;
            internalDuplicates.forEach(point => {
              errorMessage += `- Штамм ${point.strainName} с координатами (${point.latitude}, ${point.longitude}) и датой ${new Date(point.date).toLocaleDateString()}\n`;
            });
          }
          setError(errorMessage);
          return;
        }

        if (processedPoints.length === 0) {
          setError('Нет новых данных для импорта');
          return;
        }

        console.log('Processed points:', processedPoints);

        // Отправляем данные на сервер
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/points/import'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ points: processedPoints }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при импорте данных');
        }

        onImportSuccess?.();
        onClose();
      } catch (error) {
        console.error('Error importing data:', error);
        setError(error.message);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="import-container">
          <h2 className="import-title">Импорт данных</h2>
          
          <div className="import-content">
            <div className="file-upload">
              <input
                type="file"
                id="file-input"
                className="file-input"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
              <label htmlFor="file-input" className="file-input-label">
                <div className="upload-icon">📁</div>
                <div className="upload-text">Выберите файл Excel</div>
                <div className="upload-hint">или перетащите его сюда</div>
              </label>
              {file && <div className="file-name">{file.name}</div>}
            </div>

            <div className="import-info">
              <h3>Инструкция по импорту:</h3>
              <ol>
                <li>Подготовьте Excel файл (.xlsx или .xls) со следующими обязательными столбцами:
                  <ul>
                    <li>Название штамма</li>
                    <li>Дата (в формате ДД.ММ.ГГГГ)</li>
                    <li>Широта</li>
                    <li>Долгота</li>
                  </ul>
                </li>
                <li>Дополнительные столбцы (необязательные):
                  <ul>
                    <li>CRISPR тип</li>
                    <li>Indel генотип</li>
                    <li>Серогруппа</li>
                    <li>Тип жгутикового антигена</li>
                    <li>Мукоидный фенотип</li>
                    <li>ExoS</li>
                    <li>ExoU</li>
                    <li>Объект выделения</li>
                  </ul>
                </li>
                <li>Загрузите файл, нажав на кнопку выше или перетащив его в область загрузки</li>
                <li>Система автоматически проверит данные на корректность и наличие дубликатов</li>
              </ol>
              <p>Примечание: Все даты должны быть в формате ДД.ММ.ГГГГ. Координаты должны быть указаны в десятичном формате.</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </div>

          <button className="cancel-button" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTableModal; 