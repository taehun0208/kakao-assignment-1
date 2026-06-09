import { useMemo } from 'react';
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
  const weekRangeLabel = `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 — ${last.getMonth() + 1}월 ${last.getDate()}일`;

  return (
    <div className="mb-4 border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onMoveWeek(-1)}
          aria-label="이전 주"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-600">{weekRangeLabel}</span>
        <button
          type="button"
          onClick={() => onMoveWeek(1)}
          aria-label="다음 주"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const dateStr = toDateString(date);
          const count = countByDate[dateStr] ?? 0;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isWeekend = i >= 5;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-colors ${
                isSelected
                  ? 'bg-indigo-500 text-white'
                  : isToday
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'hover:bg-gray-100 text-gray-700'
              } ${isWeekend && !isSelected ? 'text-red-400' : ''}`}
            >
              <span className="font-medium">{DAY_NAMES[i]}</span>
              <span className={`mt-0.5 ${isSelected ? 'text-white' : ''}`}>{date.getDate()}</span>
              <span className={`mt-1 text-xs font-semibold ${
                isSelected ? 'text-indigo-200' : count > 0 ? 'text-indigo-500' : 'text-gray-300'
              }`}>
                {count > 0 ? count : '·'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
