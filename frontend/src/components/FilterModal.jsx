import React from 'react';
import PropTypes from 'prop-types';
import DateInput from './DateInput.jsx';
import './FilterModal.scss';

const FilterModal = ({ isOpen, onClose, filters, onFilterChange, onDateRangeSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="filter-modal-overlay">
      <div className="modal-container">
        <img src="/logo.png" alt="Logo" className="modal-logo" />
        <div className="filter-modal">
          <div className="filter-modal-header">
            <h2>Фильтры</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          
          <div className="filter-modal-content">
            <DateInput
              onRangeSelect={onDateRangeSelect}
            />
            
            <section className="filter-section">
              <div className="filter-group">
                <h3 className="filter-title">Штамм</h3>
                <input
                  type="text"
                  placeholder="Поиск по названию"
                  value={filters.strainName}
                  onChange={(e) => onFilterChange('strainName', '', e.target.value)}
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
                      onChange={(e) => onFilterChange('flagellarAntigen', 'A1', e.target.checked)}
                    />
                    <span>A1</span>
                  </label>
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={filters.flagellarAntigen.A2}
                      onChange={(e) => onFilterChange('flagellarAntigen', 'A2', e.target.checked)}
                    />
                    <span>A2</span>
                  </label>
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={filters.flagellarAntigen.B}
                      onChange={(e) => onFilterChange('flagellarAntigen', 'B', e.target.checked)}
                    />
                    <span>B</span>
                  </label>
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={filters.flagellarAntigen['не определен']}
                      onChange={(e) => onFilterChange('flagellarAntigen', 'не определен', e.target.checked)}
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
                      onChange={(e) => onFilterChange('mucoidPhenotype', 'mutant', e.target.checked)}
                    />
                    <span>Mutant</span>
                  </label>
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={filters.mucoidPhenotype['wild type']}
                      onChange={(e) => onFilterChange('mucoidPhenotype', 'wild type', e.target.checked)}
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
                      onChange={(e) => onFilterChange('exoS', '+', e.target.checked)}
                    />
                    <span>+</span>
                  </label>
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={filters.exoS['-']}
                      onChange={(e) => onFilterChange('exoS', '-', e.target.checked)}
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
                      onChange={(e) => onFilterChange('exoU', '+', e.target.checked)}
                    />
                    <span>+</span>
                  </label>
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox" 
                      checked={filters.exoU['-']}
                      onChange={(e) => onFilterChange('exoU', '-', e.target.checked)}
                    />
                    <span>-</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          <div className="filter-modal-footer">
            <button className="apply-button" onClick={onClose}>
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onDateRangeSelect: PropTypes.func.isRequired
};

export default FilterModal; 