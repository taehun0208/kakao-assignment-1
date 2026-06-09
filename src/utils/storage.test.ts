import { describe, it, expect, beforeEach } from 'vitest';
import { loadTodos, saveTodos, loadWeekOffset, saveWeekOffset } from './storage';
import type { Todo } from '../types';

beforeEach(() => {
  localStorage.clear();
});

describe('loadTodos', () => {
  it('저장된 데이터가 없으면 빈 배열을 반환한다', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('저장된 Todo 배열을 반환한다', () => {
    const todos: Todo[] = [{ id: 'abc-123', text: '테스트', completed: false, date: '2025-06-09' }];
    localStorage.setItem('todos', JSON.stringify(todos));
    expect(loadTodos()).toEqual(todos);
  });

  it('JSON이 손상된 경우 빈 배열을 반환한다', () => {
    localStorage.setItem('todos', 'broken{json');
    expect(loadTodos()).toEqual([]);
  });
});

describe('saveTodos', () => {
  it('Todo 배열을 localStorage에 저장한다', () => {
    const todos: Todo[] = [{ id: 'abc-123', text: '테스트', completed: false, date: '2025-06-09' }];
    saveTodos(todos);
    expect(JSON.parse(localStorage.getItem('todos')!)).toEqual(todos);
  });

  it('빈 배열도 정상적으로 저장한다', () => {
    saveTodos([]);
    expect(JSON.parse(localStorage.getItem('todos')!)).toEqual([]);
  });
});

describe('loadWeekOffset', () => {
  it('저장된 값이 없으면 0을 반환한다', () => {
    expect(loadWeekOffset()).toBe(0);
  });

  it('저장된 offset을 숫자로 반환한다', () => {
    localStorage.setItem('weekOffset', '3');
    expect(loadWeekOffset()).toBe(3);
  });

  it('음수 offset도 정상적으로 반환한다', () => {
    localStorage.setItem('weekOffset', '-2');
    expect(loadWeekOffset()).toBe(-2);
  });
});

describe('saveWeekOffset', () => {
  it('weekOffset을 localStorage에 저장한다', () => {
    saveWeekOffset(2);
    expect(localStorage.getItem('weekOffset')).toBe('2');
  });
});
