import Link from "next/link";
import { updateTodo } from "../../actions";
import { getTodo } from "../../lib/api";
import { toDateString } from "../../lib/date";
import { buildTodoListPath, parseTodoPageQuery } from "../../lib/todo-query";

interface Props {
  params: Promise<{ todoId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EditTodoPage({ params, searchParams }: Props) {
  const { todoId } = await params;
  const paramsQuery = await searchParams;
  const id = Number(todoId);
  const todo = Number.isInteger(id) && id > 0 ? await getTodo(id).catch(() => undefined) : undefined;
  const query = parseTodoPageQuery(paramsQuery, todo?.date || toDateString(new Date()));

  if (!todo) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">Todo를 찾을 수 없습니다.</h1>
          <Link href={buildTodoListPath(query)} className="mt-4 inline-block text-sm font-semibold text-indigo-600">
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Todo 수정</h1>
        <form action={updateTodo} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={todo.id} />
          <input type="hidden" name="filter" value={query.filter} />
          <input type="hidden" name="search" value={query.search} />
          <input type="hidden" name="week" value={query.week} />
          <label className="block">
            <span className="text-sm font-semibold text-gray-600">내용</span>
            <input
              name="text"
              defaultValue={todo.text}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-600">날짜</span>
            <input
              type="date"
              name="date"
              defaultValue={todo.date}
              className="mt-1 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="completed" value="true" defaultChecked={todo.completed} />
            완료
          </label>
          <div className="flex gap-2">
            <button className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
              저장
            </button>
            <Link href={buildTodoListPath(query)} className="flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-gray-500 hover:text-gray-800">
              취소
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
