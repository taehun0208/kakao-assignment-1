import type { Todo } from '../types';

export function loadTodos(): Todo[] {
  try {
    const saved = localStorage.getItem('todos');
    return saved ? (JSON.parse(saved) as Todo[]) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem('todos', JSON.stringify(todos));
  } catch {
    // storage unavailable or full
  }
}

export function loadWeekOffset(): number {
  try {
    const saved = localStorage.getItem('weekOffset');
    return saved ? Number(saved) : 0;
  } catch {
    return 0;
  }
}

export function saveWeekOffset(offset: number): void {
  try {
    localStorage.setItem('weekOffset', String(offset));
  } catch {
    // storage unavailable or full
  }
}
