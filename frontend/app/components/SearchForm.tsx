import { Search } from "lucide-react";
import { updateSearch } from "../actions";
import type { FilterType } from "../lib/types";

interface Props {
  filter: FilterType;
  search: string;
  date: string;
  week: number;
}

export default function SearchForm({ filter, search, date, week }: Props) {
  return (
    <form action={updateSearch} className="mt-3 flex gap-2">
      <input type="hidden" name="filter" value={filter} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="week" value={week} />
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="검색어 입력"
          className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <button className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white">
        검색
      </button>
    </form>
  );
}

