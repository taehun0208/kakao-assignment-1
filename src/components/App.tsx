import { useState, useEffect } from 'react';
import type { Todo, FilterType } from '../types';
import { toDateString, formatDateLabel } from '../utils/date';
import WeekView from './WeekView';
import FilterTabs from './FilterTabs';
import TodoInput from './TodoInput';
import TodoList from './TodoList';

function loadTodos(): Todo[] {
  try {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadWeekOffset(): number {
  const saved = localStorage.getItem('weekOffset');
  return saved ? Number(saved) : 0;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateString(new Date()));
  const [weekOffset, setWeekOffset] = useState<number>(loadWeekOffset);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('weekOffset', String(weekOffset));
  }, [weekOffset]);

  function addTodo(text: string) {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false, date: selectedDate }]);
  }

  function toggleTodo(id: number) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function deleteTodo(id: number) {
    setTodos(prev => prev.filter(t => t.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function editTodo(id: number, text: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    setEditingId(null);
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    setEditingId(null);
  }

  function handleFilterChange(filter: FilterType) {
    setActiveFilter(filter);
    setEditingId(null);
  }

  const filteredTodos = todos.filter(todo => {
    if (todo.date !== selectedDate) return false;
    if (activeFilter === 'active') return !todo.completed;
    if (activeFilter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Todo</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDateLabel(selectedDate)}</p>
        </header>

        <WeekView
          todos={todos}
          selectedDate={selectedDate}
          weekOffset={weekOffset}
          onSelectDate={handleSelectDate}
          onMoveWeek={delta => setWeekOffset(prev => prev + delta)}
        />

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
          <TodoInput onAdd={addTodo} />
          <TodoList
            todos={filteredTodos}
            editingId={editingId}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onStartEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
          />
        </div>
      </div>
    </div>
  );
}
