import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEffect, useRef, useState } from 'react'
import './DateRangePicker.css'

export default function DateRangePicker({ onRangeSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
  const [displayValue, setDisplayValue] = useState('Выберите даты')
  const [currentYear, setCurrentYear] = useState(2025)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState(null)
  const calendarRef = useRef(null)
  const yearSelectorRef = useRef(null)
  const yearsRef = useRef({
    prevFar: currentYear - 2,
    prev: currentYear - 1,
    current: currentYear,
    next: currentYear + 1,
    nextFar: currentYear + 2,
  })

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
    if (year === currentYear || isAnimating) return
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
      <div className="date-picker-input" onClick={() => setIsOpen(!isOpen)}>
        {displayValue}
      </div>

      {isOpen && (
        <div className="calendar-popup-overlay">
          <div className="calendar-popup" ref={calendarRef}>
            <div className="calendar-header">
              <button
                onClick={() => handleYearClick(currentYear - 1)}
                className="year-nav-button"
                disabled={isAnimating}
              >
                ←
              </button>
              <div className="year-selector" role="group" aria-label="Выбор года">
                <div className="year-selector-inner" ref={yearSelectorRef}>
                  <button
                    type="button"
                    className="adjacent-year far"
                    onClick={() => handleYearClick(currentYear - 2)}
                    aria-label={`Выбрать ${currentYear - 2} год`}
                  >
                    {currentYear - 2}
                  </button>
                  <button
                    type="button"
                    className="adjacent-year prev"
                    onClick={() => handleYearClick(currentYear - 1)}
                    aria-label={`Выбрать ${currentYear - 1} год`}
                  >
                    {currentYear - 1}
                  </button>
                  <button
                    type="button"
                    className="current-year"
                    aria-label={`Текущий год: ${currentYear}`}
                    aria-current="true"
                  >
                    {currentYear}
                  </button>
                  <button
                    type="button"
                    className="adjacent-year next"
                    onClick={() => handleYearClick(currentYear + 1)}
                    aria-label={`Выбрать ${currentYear + 1} год`}
                  >
                    {currentYear + 1}
                  </button>
                  <button
                    type="button"
                    className="adjacent-year far"
                    onClick={() => handleYearClick(currentYear + 2)}
                    aria-label={`Выбрать ${currentYear + 2} год`}
                  >
                    {currentYear + 2}
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleYearClick(currentYear + 1)}
                className="year-nav-button"
                disabled={isAnimating}
                aria-label="Следующий год"
              >
                →
              </button>
            </div>

            <div className="calendar-grid">
              {Array.from({ length: 12 }, (_, monthIndex) => (
                <div key={monthIndex} className="month-container">
                  <div className="month-header">{months[monthIndex]}</div>
                  <div className="days-header">
                    <div>Пн</div>
                    <div>Вт</div>
                    <div>Ср</div>
                    <div>Чт</div>
                    <div>Пт</div>
                    <div>Сб</div>
                    <div>Вс</div>
                  </div>
                  <div className="days-grid">
                    {generateMonthDays(currentYear, monthIndex).map(
                      (date, index) => (
                        <div
                          key={index}
                          className={`day-cell ${getDateCellClass(date)}`}
                          onClick={() => date && handleDateClick(date)}
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
              <button onClick={handleCancel} className="calendar-button cancel">
                Отменить
              </button>
              <button
                onClick={handleConfirm}
                className="calendar-button confirm"
                disabled={!selectedRange.start || !selectedRange.end}
              >
                Выбрать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
