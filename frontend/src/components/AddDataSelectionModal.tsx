import React from 'react';
import './AddDataSelectionModal.scss';

interface AddDataSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onFormSelect: () => void;
  onImportSelect: () => void;
}

const AddDataSelectionModal: React.FC<AddDataSelectionModalProps> = ({
  open,
  onClose,
  onFormSelect,
  onImportSelect,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="selection-container">
          <h2 className="selection-title">Выберите способ добавления данных</h2>
          <div className="selection-buttons">
            <button className="selection-button" onClick={onFormSelect}>
              Заполнить форму
            </button>
            <button className="selection-button" onClick={onImportSelect}>
              Импортировать таблицу
            </button>
          </div>
          <button className="cancel-button" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDataSelectionModal; 