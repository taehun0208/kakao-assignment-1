import type { Todo } from '../types';
import TodoItem from './TodoItem';

interface Props {
  todos: Todo[];
  editingId: number | null;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
}

export default function TodoList({ todos, editingId, onToggle, onDelete, onEdit, onStartEdit, onCancelEdit }: Props) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10">할 일이 없어요 ☀️</p>
    );
  }

  return (
    <ul className="mt-3">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isEditing={editingId === todo.id}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
        />
      ))}
    </ul>
  );
}
