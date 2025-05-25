import React, { useState, useEffect } from 'react';
import './ImportTableModal.scss';
import ExcelJS from 'exceljs';
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

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('Файл не содержит данных');
      }

      // Получаем заголовки из первой строки
      const headers = worksheet.getRow(1).values as string[];
      if (!headers || headers.length === 0) {
        throw new Error('Файл не содержит заголовков');
      }

      // Преобразуем заголовки в нижний регистр для сравнения
      const normalizedHeaders = headers.map(h => h?.toString().toLowerCase() || '');

      // Проверяем наличие обязательных полей
      const dateColumnNames = ['дата', 'date', 'дата выделения'];
      const dateFieldIndex = normalizedHeaders.findIndex(h => dateColumnNames.includes(h));
      
      if (dateFieldIndex === -1) {
        throw new Error(`В таблице отсутствует столбец с датой. Возможные названия: ${dateColumnNames.join(', ')}`);
      }

      const requiredFields = ['название штамма', 'широта', 'долгота'];
      const missingFields = requiredFields.filter(field => 
        !normalizedHeaders.includes(field)
      );
      
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

      // Начинаем со второй строки (пропускаем заголовки)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        if (!row || !row.values) continue;

        try {
          const rowData: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            if (header) {
              rowData[header] = row.getCell(index).value;
            }
          });

          const dateValue = rowData[headers[dateFieldIndex]];
          const parsedDate = parseDate(dateValue);
          
          const point: Point = {
            strainName: rowData['Название штамма']?.toString() || '',
            crisprType: rowData['CRISPR тип']?.toString() || '',
            indelGenotype: rowData['Indel генотип']?.toString() || '',
            serogroup: rowData['Серогруппа']?.toString() || '',
            flagellarAntigen: rowData['Тип жгутикового антигена']?.toString() || '',
            mucoidPhenotype: rowData['Мукоидный фенотип']?.toString() || '',
            exoS: rowData['ExoS']?.toString() || '',
            exoU: rowData['ExoU']?.toString() || '',
            date: parsedDate,
            isolationObject: rowData['Объект выделения']?.toString() || '',
            latitude: typeof rowData['Широта'] === 'string' ? parseFloat(rowData['Широта']) : Number(rowData['Широта']),
            longitude: typeof rowData['Долгота'] === 'string' ? parseFloat(rowData['Долгота']) : Number(rowData['Долгота']),
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
          console.error('Error processing row:', rowNumber, error);
          throw new Error(`Ошибка в строке ${rowNumber}: ${error.message}`);
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
        setLoading(false);
        return;
      }

      if (processedPoints.length === 0) {
        setError('Нет новых данных для импорта');
        setLoading(false);
        return;
      }

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

      setSuccess(`Успешно импортировано ${processedPoints.length} записей`);
      setLoading(false);
      
      // Добавляем небольшую задержку перед закрытием, чтобы пользователь увидел сообщение
      setTimeout(() => {
        onImportSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error importing data:', error);
      setError(error.message);
      setLoading(false);
    }
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

          <div className="modal-actions">
            <button 
              className="import-button" 
              onClick={handleImport}
              disabled={!file || loading}
            >
              {loading ? 'Импорт...' : 'Импорт'}
            </button>
            <button className="cancel-button" onClick={onClose}>
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportTableModal; 