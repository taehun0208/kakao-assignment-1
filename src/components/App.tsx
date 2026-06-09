import { useTodos } from '../hooks/useTodos';
import { formatDateLabel } from '../utils/date';
import WeekView from './WeekView';
import FilterTabs from './FilterTabs';
import TodoInput from './TodoInput';
import TodoList from './TodoList';

export default function App() {
  const {
    todos,
    filteredTodos,
    activeFilter,
    selectedDate,
    weekOffset,
    editingId,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    selectDate,
    changeFilter,
    setWeekOffset,
    setEditingId,
  } = useTodos();

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
          onSelectDate={selectDate}
          onMoveWeek={delta => setWeekOffset(prev => prev + delta)}
        />

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <FilterTabs activeFilter={activeFilter} onFilterChange={changeFilter} />
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
