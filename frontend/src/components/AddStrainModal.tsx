import React, { useState } from 'react';
import { MucoidPhenotype, ExoStatus, FlagellarAntigen } from '../types/point';
import './AddStrainModal.scss';

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
    flagellarAntigen: FlagellarAntigen.UNDEFINED,
    mucoidPhenotype: MucoidPhenotype.WILD_TYPE,
    exoS: ExoStatus.NEGATIVE,
    exoU: ExoStatus.NEGATIVE,
    latitude: '',
    longitude: '',
    date: new Date().toISOString().split('T')[0],
    isolationObject: '',
    createdBy: localStorage.getItem('userEmail') || 'unknown'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.value as ExoStatus
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);
    onSubmit({
      ...formData,
      createdBy: localStorage.getItem('userEmail') || 'unknown'
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <dialog className="modal" open={open} aria-label="Добавление нового штамма">
        <form onSubmit={handleSubmit} className="form">
          <h2 className="form-title">Добавить новый штамм</h2>
          
          <div className="form-grid">
            <fieldset className="form-group">
              <label htmlFor="strainName">Наименование штамма</label>
              <input
                type="text"
                id="strainName"
                name="strainName"
                value={formData.strainName}
                onChange={handleChange}
                required
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="crisprType">Тип CRISPR</label>
              <input
                type="text"
                id="crisprType"
                name="crisprType"
                value={formData.crisprType}
                onChange={handleChange}
                required
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="indelGenotype">Генотип indel</label>
              <input
                type="text"
                id="indelGenotype"
                name="indelGenotype"
                value={formData.indelGenotype}
                onChange={handleChange}
                required
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="serogroup">Серогруппа</label>
              <input
                type="text"
                id="serogroup"
                name="serogroup"
                value={formData.serogroup}
                onChange={handleChange}
                required
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="flagellarAntigen">Жгутиковый антиген</label>
              <select
                id="flagellarAntigen"
                name="flagellarAntigen"
                value={formData.flagellarAntigen}
                onChange={handleChange}
                required
                className="form-select"
                aria-required="true"
              >
                {Object.values(FlagellarAntigen).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="mucoidPhenotype">Мукоидный фенотип</label>
              <select
                id="mucoidPhenotype"
                name="mucoidPhenotype"
                value={formData.mucoidPhenotype}
                onChange={handleChange}
                required
                className="form-select"
                aria-required="true"
              >
                {Object.values(MucoidPhenotype).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset className="exotoxin-group">
              <legend>Экзотоксины</legend>
              <div className="exotoxin-control">
                <label>Экзотоксин S</label>
                <div className="radio-group" role="radiogroup" aria-label="Экзотоксин S">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="exoS"
                      value={ExoStatus.POSITIVE}
                      checked={formData.exoS === ExoStatus.POSITIVE}
                      onChange={handleRadioChange('exoS')}
                      aria-label="Экзотоксин S положительный"
                    />
                    <span>+</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="exoS"
                      value={ExoStatus.NEGATIVE}
                      checked={formData.exoS === ExoStatus.NEGATIVE}
                      onChange={handleRadioChange('exoS')}
                      aria-label="Экзотоксин S отрицательный"
                    />
                    <span>-</span>
                  </label>
                </div>
              </div>

              <div className="exotoxin-control">
                <label>Экзотоксин U</label>
                <div className="radio-group" role="radiogroup" aria-label="Экзотоксин U">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="exoU"
                      value={ExoStatus.POSITIVE}
                      checked={formData.exoU === ExoStatus.POSITIVE}
                      onChange={handleRadioChange('exoU')}
                      aria-label="Экзотоксин U положительный"
                    />
                    <span>+</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="exoU"
                      value={ExoStatus.NEGATIVE}
                      checked={formData.exoU === ExoStatus.NEGATIVE}
                      onChange={handleRadioChange('exoU')}
                      aria-label="Экзотоксин U отрицательный"
                    />
                    <span>-</span>
                  </label>
                </div>
              </div>
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="latitude">Широта</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                step="any"
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="longitude">Долгота</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                step="any"
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="date">Дата выделения</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input"
                aria-required="true"
              />
            </fieldset>

            <fieldset className="form-group">
              <label htmlFor="isolationObject">Объект выделения</label>
              <input
                type="text"
                id="isolationObject"
                name="isolationObject"
                value={formData.isolationObject}
                onChange={handleChange}
                required
                className="form-input"
                aria-required="true"
              />
            </fieldset>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              aria-label="Добавить штамм"
            >
              Добавить
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              aria-label="Отменить добавление штамма"
            >
              Отмена
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default AddStrainModal; 