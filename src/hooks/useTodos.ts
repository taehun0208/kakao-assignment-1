import { useState, useEffect, useMemo } from 'react';
import type { Todo, FilterType } from '../types';
import { toDateString } from '../utils/date';
import { loadTodos, saveTodos, loadWeekOffset, saveWeekOffset } from '../utils/storage';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateString(new Date()));
  const [weekOffset, setWeekOffset] = useState<number>(loadWeekOffset);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { saveTodos(todos); }, [todos]);
  useEffect(() => { saveWeekOffset(weekOffset); }, [weekOffset]);

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

  function selectDate(dateStr: string) {
    setSelectedDate(dateStr);
    setEditingId(null);
  }

  function changeFilter(filter: FilterType) {
    setActiveFilter(filter);
    setEditingId(null);
  }

  const filteredTodos = useMemo(
    () => todos.filter(todo => {
      if (todo.date !== selectedDate) return false;
      if (activeFilter === 'active') return !todo.completed;
      if (activeFilter === 'completed') return todo.completed;
      return true;
    }),
    [todos, selectedDate, activeFilter],
  );

  return {
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
  };
}
