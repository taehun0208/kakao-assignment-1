import { Plus } from "lucide-react";
import { createTodo } from "../actions";
import type { FilterType } from "../lib/types";

interface Props {
  filter: FilterType;
  search: string;
  date: string;
  week: number;
  error?: string;
}

export default function TodoCreateForm({ filter, search, date, week, error }: Props) {
  return (
    <form action={createTodo} className="mt-4">
      <input type="hidden" name="filter" value={filter} />
      <input type="hidden" name="search" value={search} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="week" value={week} />
      <div className="flex gap-2">
        <input
          name="text"
          placeholder="오늘 할 일 추가"
          className="h-11 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          aria-label="추가"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
        </button>
      </div>
      {error === "empty" && <p className="mt-2 text-xs text-red-500">할 일을 입력해주세요.</p>}
    </form>
  );
}

