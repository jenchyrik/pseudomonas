import React, { useState, useEffect } from 'react';
import './ImportTableModal.css';
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

  const handleClose = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
    setLoading(false);
    onClose();
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
      // Пробуем разные форматы даты
      const dateFormats = [
        'DD.MM.YYYY',
        'YYYY-MM-DD',
        'DD/MM/YYYY',
        'YYYY/MM/DD'
      ];

      for (const format of dateFormats) {
        try {
          let date: Date;
          
          if (format === 'DD.MM.YYYY') {
            const [day, month, year] = dateValue.split('.');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else if (format === 'YYYY-MM-DD') {
            date = new Date(dateValue);
          } else if (format === 'DD/MM/YYYY') {
            const [day, month, year] = dateValue.split('/');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else if (format === 'YYYY/MM/DD') {
            const [year, month, day] = dateValue.split('/');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }

          if (date && !isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Если это уже объект Date
    if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) {
        throw new Error('Некорректный объект даты');
      }
      return dateValue.toISOString();
    }

    throw new Error(`Неподдерживаемый формат даты: ${dateValue}`);
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

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ImportedRow>(worksheet);

        console.log('Imported Excel data:', jsonData);

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
            const parsedDate = parseDate(row['Дата']);
            if (!parsedDate) {
              throw new Error('Неверный формат даты');
            }

            const point: Point = {
              strainName: row['Название штамма'],
              crisprType: row['CRISPR тип'],
              indelGenotype: row['Indel генотип'],
              serogroup: row['Серогруппа'],
              flagellarAntigen: row['Тип жгутикового антигена'],
              mucoidPhenotype: row['Мукоидный фенотип'],
              exoS: row['ExoS'],
              exoU: row['ExoU'],
              date: parsedDate,
              isolationObject: row['Объект выделения'],
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="import-container">
          <h2 className="import-title">Импорт таблицы</h2>
          <div className="import-content">
            <div className="file-upload">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <button 
                className="import-button"
                onClick={handleImport}
                disabled={!file || loading}
              >
                {loading ? 'Импорт...' : 'Импортировать'}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <p className="import-info">
              Поддерживаемые форматы: .xlsx, .xls<br />
              Структура таблицы (порядок столбцов):<br />
              1. Название штамма<br />
              2. CRISPR тип<br />
              3. Indel генотип<br />
              4. Серогруппа<br />
              5. Тип жгутикового антигена<br />
              6. Мукоидный фенотип<br />
              7. ExoS<br />
              8. ExoU<br />
              9. Дата (в формате ДД.ММ.ГГГГ)<br />
              10. Объект выделения<br />
              11. Широта<br />
              12. Долгота<br />
              <br />
              Примечание: для пустых ячеек используйте прочерк (-)
            </p>
          </div>
          <button className="close-button" onClick={handleClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportTableModal; 