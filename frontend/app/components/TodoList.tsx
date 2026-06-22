import { Check, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteTodo, toggleTodo } from "../actions";
import { buildTodoDetailPath } from "../lib/todo-query";
import type { FilterType, Todo } from "../lib/types";

interface Props {
  todos: Todo[];
  filter: FilterType;
  search: string;
  date: string;
  week: number;
}

export default function TodoList({ todos, filter, search, date, week }: Props) {
  if (todos.length === 0) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        조건에 맞는 할 일이 없습니다.
      </div>
    );
  }

  return (
    <ul className="mt-5 space-y-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
            todo.completed ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white"
          }`}
        >
          <form action={toggleTodo}>
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="completed" value={String(todo.completed)} />
            <button
              type="submit"
              aria-label={todo.completed ? "완료 취소" : "완료"}
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                todo.completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-gray-300 hover:border-emerald-400"
              }`}
            >
              {todo.completed && <Check size={11} strokeWidth={3} />}
            </button>
          </form>

          <span className={`min-w-0 flex-1 text-sm ${todo.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
            {todo.text}
          </span>

          <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
            <Link
              href={buildTodoDetailPath(todo.id, { filter, search, date, week })}
              aria-label="수정"
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <Pencil size={15} />
            </Link>
            <form action={deleteTodo}>
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                aria-label="삭제"
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
