import React from 'react';
import PropTypes from 'prop-types';
import './DateInput.scss';

export default function DateInput({ onRangeSelect }) {
  const handleDateChange = (type, value) => {
    const date = value ? new Date(value) : null;
    onRangeSelect?.({ [type]: date });
  };

  return (
    <div className="date-input-container">
      <h3 className="filter-title">Период</h3>
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">От</label>
          <input
            type="date"
            id="start-date"
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="date-input"
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">До</label>
          <input
            type="date"
            id="end-date"
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="date-input"
          />
        </div>
      </div>
    </div>
  );
}

DateInput.propTypes = {
  onRangeSelect: PropTypes.func
}; 