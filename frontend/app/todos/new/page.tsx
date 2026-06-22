import Link from "next/link";
import TodoCreateForm from "../../components/TodoCreateForm";
import { toDateString } from "../../lib/date";
import type { FilterType } from "../../lib/types";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewTodoPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = (firstValue(params.filter) || "all") as FilterType;
  const search = firstValue(params.search) || "";
  const date = firstValue(params.date) || toDateString(new Date());
  const week = Number(firstValue(params.week) || 0);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">새 Todo</h1>
        <TodoCreateForm filter={filter} search={search} date={date} week={week} />
        <Link href="/todos" className="mt-4 inline-block text-sm font-semibold text-gray-500 hover:text-gray-800">
          목록으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

