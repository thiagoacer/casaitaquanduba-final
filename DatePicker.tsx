import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  blockedDates?: Date[];
}

export default function DatePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  blockedDates = []
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(
      blocked =>
        blocked.getDate() === date.getDate() &&
        blocked.getMonth() === date.getMonth() &&
        blocked.getFullYear() === date.getFullYear()
    );
  };

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!checkIn && !checkOut) return false;

    const dateTime = date.getTime();
    const checkInTime = checkIn?.getTime();
    const checkOutTime = checkOut?.getTime();

    if (checkInTime && dateTime === checkInTime) return true;
    if (checkOutTime && dateTime === checkOutTime) return true;

    if (checkIn && checkOut && checkInTime && checkOutTime) {
      return dateTime > checkInTime && dateTime < checkOutTime;
    }

    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date) || isDateInPast(date)) return;

    if (selectingCheckIn) {
      onCheckInChange(date);
      onCheckOutChange(null);
      setSelectingCheckIn(false);
    } else {
      if (checkIn && date <= checkIn) {
        onCheckInChange(date);
        onCheckOutChange(null);
        setSelectingCheckIn(false);
      } else {
        onCheckOutChange(date);
        setSelectingCheckIn(true);
      }
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isBlocked = isDateBlocked(date);
      const isPast = isDateInPast(date);
      const isSelected = isDateSelected(date);
      const isCheckInDate = checkIn && date.getTime() === checkIn.getTime();
      const isCheckOutDate = checkOut && date.getTime() === checkOut.getTime();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isBlocked || isPast}
          className={`
            h-10 rounded-lg transition-all text-sm font-medium
            ${isBlocked || isPast
              ? 'text-gray-300 cursor-not-allowed line-through'
              : 'hover:bg-[#2EC4B6]/10 hover:text-[#0A7B9B]'
            }
            ${isCheckInDate || isCheckOutDate
              ? 'bg-[#0A7B9B] text-white hover:bg-[#0A7B9B]'
              : ''
            }
            ${isSelected && !isCheckInDate && !isCheckOutDate
              ? 'bg-[#2EC4B6]/20 text-[#0A7B9B]'
              : ''
            }
            ${!isBlocked && !isPast && !isSelected && !isCheckInDate && !isCheckOutDate
              ? 'text-gray-700'
              : ''
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0A7B9B]" />
          <h3 className="text-lg font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderCalendar()}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in
            </label>
            <div className="text-base font-semibold text-gray-900">
              {checkIn ? checkIn.toLocaleDateString('pt-BR') : 'Selecione'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out
            </label>
            <div className="text-base font-semibold text-gray-900">
              {checkOut ? checkOut.toLocaleDateString('pt-BR') : 'Selecione'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
