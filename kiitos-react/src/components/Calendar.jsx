import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Calendar({ currentDate, selectedDate, onDateSelect }) {
    console.log('Renderizando Calendar'); // Para debug
    const [calendarDays, setCalendarDays] = useState([]);
    const [displayDate, setDisplayDate] = useState(currentDate);

    useEffect(() => {
        console.log('Calendar useEffect - Generando calendario'); // Para debug
        generateCalendar();
    }, [displayDate, selectedDate]);

    const generateCalendar = () => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();

        // Primer día del mes
        const firstDay = new Date(year, month, 1);
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0);

        // Ajustar el primer día de la semana (0 = Domingo, 1 = Lunes)
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7;

        const days = [];

        // Días del mes anterior
        for (let i = startDay - 1; i > 0; i--) {
            const prevDate = new Date(year, month, 1 - i);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                isToday: isSameDay(prevDate, new Date()),
                isSelected: isSameDay(prevDate, selectedDate)
            });
        }

        // Días del mes actual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const currentDate = new Date(year, month, i);
            days.push({
                date: currentDate,
                isCurrentMonth: true,
                isToday: isSameDay(currentDate, new Date()),
                isSelected: isSameDay(currentDate, selectedDate)
            });
        }

        // Días del mes siguiente
        const remainingDays = 42 - days.length; // 6 semanas * 7 días
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, month + 1, i);
            days.push({
                date: nextDate,
                isCurrentMonth: false,
                isToday: isSameDay(nextDate, new Date()),
                isSelected: isSameDay(nextDate, selectedDate)
            });
        }

        setCalendarDays(days);
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const changeMonth = (increment) => {
        console.log('Cambiando mes:', increment); // Para debug
        const newDate = new Date(displayDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setDisplayDate(newDate);
    };

    return (
        <div className="calendar">
            {/* Cabecera del calendario */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                >
                    <FontAwesomeIcon icon="chevron-left" className="text-gray-600" />
                </button>
                <h3 className="text-lg font-medium text-gray-900">
                    {displayDate.toLocaleString('es', { month: 'long', year: 'numeric' }).toUpperCase()}
                </h3>
                <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                >
                    <FontAwesomeIcon icon="chevron-right" className="text-gray-600" />
                </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div
                        key={index}
                        className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => onDateSelect(day.date)}
                        className={`
                            h-8 flex items-center justify-center text-sm rounded-lg transition-colors
                            ${!day.isCurrentMonth ? 'text-gray-400' : 'hover:bg-gray-100'}
                            ${day.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                            ${day.isToday && !day.isSelected ? 'bg-blue-100 text-blue-600' : ''}
                        `}
                        type="button"
                    >
                        {day.date.getDate()}
                    </button>
                ))}
            </div>
        </div>
    );
} 