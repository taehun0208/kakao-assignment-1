import { useRef, useEffect } from 'react';
import type { Todo } from '../types';

interface Props {
  todo: Todo;
  isEditing: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
}

export default function TodoItem({
  todo,
  isEditing,
  onToggle,
  onDelete,
  onEdit,
  onStartEdit,
  onCancelEdit,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function confirmEdit() {
    const value = inputRef.current?.value.trim() ?? '';
    if (value) onEdit(todo.id, value);
    else onCancelEdit();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) confirmEdit();
    if (e.key === 'Escape') onCancelEdit();
  }

  return (
    <li className={`flex items-center gap-3 p-3 rounded-lg border ${todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'} mb-2`}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          defaultValue={todo.text}
          onKeyDown={handleKeyDown}
          onBlur={confirmEdit}
          className="flex-1 border border-indigo-400 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
        />
      ) : (
        <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {todo.text}
        </span>
      )}

      {!isEditing && (
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggle(todo.id)}
            className={`text-xs px-2 py-1 rounded ${todo.completed ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
          >
            {todo.completed ? '취소' : '완료'}
          </button>
          <button
            type="button"
            onClick={() => onStartEdit(todo.id)}
            className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
}
