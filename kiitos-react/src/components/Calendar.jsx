import { useEffect, useState } from 'react';

export default function Calendar({ currentDate, selectedDate, onDateSelect }) {
    const [calendarDays, setCalendarDays] = useState([]);

    useEffect(() => {
        generateCalendar();
    }, [currentDate]);

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

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

    return (
        <div className="calendar">
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
                            ${day.isCurrentMonth ? 'hover:bg-gray-100' : 'text-gray-400'}
                            ${day.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                            ${day.isToday && !day.isSelected ? 'bg-blue-100 text-blue-600' : ''}
                        `}
                        disabled={!day.isCurrentMonth}
                    >
                        {day.date.getDate()}
                    </button>
                ))}
            </div>
        </div>
    );
} 