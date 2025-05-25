import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import './DateRangePicker.scss'

export default function DateRangePicker({ onRangeSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [displayValue, setDisplayValue] = useState('Выберите даты')
  const [currentYear, setCurrentYear] = useState(2025)
  const calendarRef = useRef(null)
  const yearSelectorRef = useRef(null)

  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ]

  const generateMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      if (i !== 0) {
        days.push(null)
      }
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const handleDateClick = date => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null })
    } else {
      if (date < selectedRange.start) {
        setSelectedRange({ start: date, end: selectedRange.start })
      } else {
        setSelectedRange({ start: selectedRange.start, end: date })
      }
    }
  }

  const handleConfirm = () => {
    if (selectedRange.start && selectedRange.end) {
      const formattedStart = format(selectedRange.start, 'dd.MM.yyyy', {
        locale: ru,
      })
      const formattedEnd = format(selectedRange.end, 'dd.MM.yyyy', {
        locale: ru,
      })
      
      if (selectedRange.start.getTime() === selectedRange.end.getTime()) {
        setDisplayValue(formattedStart)
      } else {
        setDisplayValue(`${formattedStart} - ${formattedEnd}`)
      }
      
      onRangeSelect?.(selectedRange)
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setSelectedRange({ start: null, end: null })
    setIsOpen(false)
  }

  const isDateInRange = date => {
    if (!selectedRange.start || !date) return false
    if (!selectedRange.end) return false
    return date > selectedRange.start && date < selectedRange.end
  }

  const isDateSelected = date => {
    if (!date || !selectedRange.start) return false
    return (
      date.getTime() === selectedRange.start.getTime() ||
      (selectedRange.end && date.getTime() === selectedRange.end.getTime())
    )
  }

  const getDateCellClass = date => {
    if (!date) return 'empty'

    const classes = []
    if (isDateSelected(date)) {
      classes.push('selected')
      if (date.getTime() === selectedRange.start.getTime()) {
        classes.push('range-start')
      }
      if (selectedRange.end && date.getTime() === selectedRange.end.getTime()) {
        classes.push('range-end')
      }
    } else if (isDateInRange(date)) {
      classes.push('in-range')
    }

    return classes.join(' ')
  }

  const handleYearClick = year => {
    if (year === currentYear) return
    setCurrentYear(year)
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        handleCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="date-picker-container">
      <div 
        className="date-picker-input" 
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="calendar-popup"
      >
        {displayValue}
      </div>

      {isOpen && createPortal(
        <div className="calendar-popup-overlay">
          <div 
            className="calendar-popup" 
            ref={calendarRef}
            role="dialog"
            aria-modal="true"
            aria-label="Выбор даты"
            id="calendar-popup"
          >
            <div className="calendar-header">
              <button
                onClick={() => handleYearClick(currentYear - 1)}
                className="year-nav-button"
                disabled={false}
                aria-label="Предыдущий год"
              >
                ←
              </button>
              <div className="year-selector">
                <div className="year-selector-inner" ref={yearSelectorRef}>
                  <span
                    className="adjacent-year far"
                    onClick={() => handleYearClick(currentYear - 2)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Год ${currentYear - 2}`}
                  >
                    {currentYear - 2}
                  </span>
                  <span
                    className="adjacent-year prev"
                    onClick={() => handleYearClick(currentYear - 1)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Год ${currentYear - 1}`}
                  >
                    {currentYear - 1}
                  </span>
                  <span className="current-year" aria-label={`Текущий год ${currentYear}`}>{currentYear}</span>
                  <span
                    className="adjacent-year next"
                    onClick={() => handleYearClick(currentYear + 1)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Год ${currentYear + 1}`}
                  >
                    {currentYear + 1}
                  </span>
                  <span
                    className="adjacent-year far"
                    onClick={() => handleYearClick(currentYear + 2)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Год ${currentYear + 2}`}
                  >
                    {currentYear + 2}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleYearClick(currentYear + 1)}
                className="year-nav-button"
                disabled={false}
                aria-label="Следующий год"
              >
                →
              </button>
            </div>

            <div className="calendar-grid" role="grid">
              {Array.from({ length: 12 }, (_, monthIndex) => (
                <div key={monthIndex} className="month-container" role="gridcell">
                  <div className="month-header">{months[monthIndex]}</div>
                  <div className="days-header" role="row">
                    <div role="columnheader">Пн</div>
                    <div role="columnheader">Вт</div>
                    <div role="columnheader">Ср</div>
                    <div role="columnheader">Чт</div>
                    <div role="columnheader">Пт</div>
                    <div role="columnheader">Сб</div>
                    <div role="columnheader">Вс</div>
                  </div>
                  <div className="days-grid" role="rowgroup">
                    {generateMonthDays(currentYear, monthIndex).map(
                      (date, index) => (
                        <div
                          key={index}
                          className={`day-cell ${getDateCellClass(date)}`}
                          onClick={() => date && handleDateClick(date)}
                          role="gridcell"
                          tabIndex={date ? 0 : -1}
                          aria-label={date ? date.toLocaleDateString() : ''}
                          aria-selected={date && isDateSelected(date)}
                        >
                          {date ? date.getDate() : ''}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="calendar-footer">
              <button onClick={handleCancel} className="calendar-button cancel" aria-label="Отменить выбор даты">
                Отменить
              </button>
              <button
                onClick={handleConfirm}
                className="calendar-button confirm"
                disabled={!selectedRange.start || !selectedRange.end}
                aria-label="Подтвердить выбор даты"
              >
                Выбрать
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

DateRangePicker.propTypes = {
  onRangeSelect: PropTypes.func
}
