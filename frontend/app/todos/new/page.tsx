import Link from "next/link";
import TodoCreateForm from "../../components/TodoCreateForm";
import { toDateString } from "../../lib/date";
import { buildTodoListPath, parseTodoPageQuery } from "../../lib/todo-query";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NewTodoPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = parseTodoPageQuery(params, toDateString(new Date()));
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">새 Todo</h1>
        <TodoCreateForm filter={query.filter} search={query.search} date={query.date} week={query.week} error={error} />
        <Link href={buildTodoListPath(query)} className="mt-4 inline-block text-sm font-semibold text-gray-500 hover:text-gray-800">
          목록으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

