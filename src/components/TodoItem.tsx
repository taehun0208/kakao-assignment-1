import { useRef, useEffect, useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import type { Todo } from '../types';

interface Props {
  todo: Todo;
  isEditing: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onStartEdit: (id: string) => void;
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
  const [editError, setEditError] = useState(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
      setEditError(false);
    }
  }, [isEditing]);

  function confirmEdit() {
    const value = inputRef.current?.value.trim() ?? '';
    if (!value) {
      setEditError(true);
      inputRef.current?.focus();
      return;
    }
    onEdit(todo.id, value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) confirmEdit();
    if (e.key === 'Escape') onCancelEdit();
  }

  return (
    <li className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors mb-2 ${
      todo.completed
        ? 'bg-gray-50 border-gray-100'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <button
        type="button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? '완료 취소' : '완료'}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {todo.completed && <Check size={10} strokeWidth={3} />}
      </button>

      {isEditing ? (
        <div className="flex-1 flex flex-col gap-1">
          <input
            ref={inputRef}
            type="text"
            defaultValue={todo.text}
            onKeyDown={handleKeyDown}
            onBlur={confirmEdit}
            onChange={() => setEditError(false)}
            className={`border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 ${
              editError
                ? 'border-red-400 focus:ring-red-200'
                : 'border-indigo-400 focus:ring-indigo-300'
            }`}
          />
          {editError && (
            <p className="text-xs text-red-500">할 일을 입력해주세요.</p>
          )}
        </div>
      ) : (
        <span className={`flex-1 text-sm ${
          todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
        }`}>
          {todo.text}
        </span>
      )}

      {!isEditing && (
        <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onStartEdit(todo.id)}
            aria-label="수정"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            aria-label="삭제"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </li>
  );
}
