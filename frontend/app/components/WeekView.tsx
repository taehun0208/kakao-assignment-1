import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getWeekDates, toDateString } from "../lib/date";
import { buildTodoListPath } from "../lib/todo-query";
import type { FilterType, Todo } from "../lib/types";

interface Props {
  todos: Todo[];
  selectedDate: string;
  week: number;
  filter: FilterType;
  search: string;
}

const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

export default function WeekView({ todos, selectedDate, week, filter, search }: Props) {
  const weekDates = getWeekDates(week);
  const today = toDateString(new Date());
  const countByDate = todos.reduce<Record<string, number>>((acc, todo) => {
    acc[todo.date] = (acc[todo.date] ?? 0) + 1;
    return acc;
  }, {});
  const first = weekDates[0];
  const last = weekDates[6];

  return (
    <section className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={buildTodoListPath({ filter, search, date: toDateString(getWeekDates(week - 1)[0]), week: week - 1 })}
          aria-label="이전 주"
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <ChevronLeft size={18} />
        </Link>
        <span className="text-sm font-semibold text-gray-600">
          {first.getMonth() + 1}월 {first.getDate()}일 - {last.getMonth() + 1}월 {last.getDate()}일
        </span>
        <Link
          href={buildTodoListPath({ filter, search, date: toDateString(getWeekDates(week + 1)[0]), week: week + 1 })}
          aria-label="다음 주"
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <ChevronRight size={18} />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date, i) => {
          const dateStr = toDateString(date);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const count = countByDate[dateStr] ?? 0;

          return (
            <Link
              key={dateStr}
              href={buildTodoListPath({ filter, search, date: dateStr, week })}
              className={`flex min-h-16 flex-col items-center justify-center rounded-lg px-1 py-2 text-xs transition ${
                isSelected
                  ? "bg-indigo-600 text-white"
                  : isToday
                    ? "bg-indigo-50 text-indigo-700"
                    : "hover:bg-gray-50"
              }`}
            >
              <span className={isSelected ? "text-indigo-100" : i === 6 ? "text-red-400" : i === 5 ? "text-blue-400" : "text-gray-400"}>
                {dayNames[i]}
              </span>
              <span className="mt-0.5 text-sm font-semibold">{date.getDate()}</span>
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${count > 0 ? (isSelected ? "bg-indigo-200" : "bg-indigo-400") : "bg-transparent"}`} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
