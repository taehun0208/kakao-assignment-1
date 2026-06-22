import FilterTabs from "../components/FilterTabs";
import SearchForm from "../components/SearchForm";
import TodoCreateForm from "../components/TodoCreateForm";
import TodoList from "../components/TodoList";
import WeekView from "../components/WeekView";
import { fetchTodos } from "../actions";
import { formatDateLabel, toDateString } from "../lib/date";
import { parseTodoPageQuery } from "../lib/todo-query";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TodosPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseTodoPageQuery(params, toDateString(new Date()));
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const [visibleTodos, weekTodos] = await Promise.all([
    fetchTodos({ filter: query.filter, search: query.search, date: query.date }),
    fetchTodos({}),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-normal text-gray-900">Todo</h1>
          <p className="mt-1 text-sm text-gray-500">{formatDateLabel(query.date)}</p>
        </header>

        <WeekView todos={weekTodos} selectedDate={query.date} week={query.week} filter={query.filter} search={query.search} />

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <FilterTabs activeFilter={query.filter} search={query.search} date={query.date} week={query.week} />
          <SearchForm filter={query.filter} search={query.search} date={query.date} week={query.week} />
          <TodoCreateForm filter={query.filter} search={query.search} date={query.date} week={query.week} error={error} />
          <TodoList todos={visibleTodos} filter={query.filter} search={query.search} date={query.date} week={query.week} />
        </section>
      </div>
    </main>
  );
}
