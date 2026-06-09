import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Todo } from '../types';
import { toDateString, getWeekDates } from '../utils/date';

interface Props {
  todos: Todo[];
  selectedDate: string;
  weekOffset: number;
  onSelectDate: (dateStr: string) => void;
  onMoveWeek: (delta: number) => void;
}

const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];

export default function WeekView({ todos, selectedDate, weekOffset, onSelectDate, onMoveWeek }: Props) {
  const weekDates = getWeekDates(weekOffset);
  const today = toDateString(new Date());

  const countByDate = useMemo(
    () => todos.reduce<Record<string, number>>((acc, t) => {
      acc[t.date] = (acc[t.date] ?? 0) + 1;
      return acc;
    }, {}),
    [todos],
  );

  const first = weekDates[0];
  const last = weekDates[6];
  const weekRangeLabel = `${first.getMonth() + 1}월 ${first.getDate()}일 — ${last.getMonth() + 1}월 ${last.getDate()}일`;

  return (
    <div className="mb-4 border border-gray-200 rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onMoveWeek(-1)}
          aria-label="이전 주"
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-600">{weekRangeLabel}</span>
        <button
          type="button"
          onClick={() => onMoveWeek(1)}
          aria-label="다음 주"
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const dateStr = toDateString(date);
          const count = countByDate[dateStr] ?? 0;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isSat = i === 5;
          const isSun = i === 6;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs transition-colors ${
                isSelected
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : isToday
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className={`text-[11px] font-medium mb-0.5 ${
                isSelected
                  ? 'text-indigo-200'
                  : isSun
                  ? 'text-red-400'
                  : isSat
                  ? 'text-blue-400'
                  : 'text-gray-400'
              }`}>
                {DAY_NAMES[i]}
              </span>
              <span className={`font-semibold text-sm ${
                isSelected ? 'text-white' : isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-700'
              }`}>
                {date.getDate()}
              </span>
              <span className={`mt-1 w-1.5 h-1.5 rounded-full ${
                count > 0
                  ? isSelected ? 'bg-indigo-300' : 'bg-indigo-400'
                  : 'bg-transparent'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
