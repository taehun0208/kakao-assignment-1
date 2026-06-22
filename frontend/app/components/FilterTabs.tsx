import Link from "next/link";
import { buildTodoListPath } from "../lib/todo-query";
import type { FilterType } from "../lib/types";

interface Props {
  activeFilter: FilterType;
  search: string;
  date: string;
  week: number;
}

const filters: Array<{ value: FilterType; label: string }> = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행 중" },
  { value: "completed", label: "완료" },
];

export default function FilterTabs({ activeFilter, search, date, week }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;

        return (
          <Link
            key={filter.value}
            href={buildTodoListPath({ filter: filter.value, search, date, week })}
            className={`rounded-md px-3 py-2 text-center text-sm font-semibold transition ${
              isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
