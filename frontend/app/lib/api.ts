import axios, { AxiosError } from "axios";
import type { Todo, TodoQuery } from "./types";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== "object") return false;

  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === "number" &&
    Number.isInteger(todo.id) &&
    typeof todo.text === "string" &&
    typeof todo.completed === "boolean" &&
    typeof todo.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(todo.date)
  );
}

function parseTodo(value: unknown): Todo {
  if (!isTodo(value)) {
    throw new Error("FastAPI 응답이 유효한 Todo 형식이 아닙니다.");
  }
  return value;
}

function parseTodos(value: unknown): Todo[] {
  if (!Array.isArray(value) || !value.every(isTodo)) {
    throw new Error("FastAPI 응답이 유효한 Todo 목록 형식이 아닙니다.");
  }
  return value;
}

function normalizeError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return new Error(detail);
    if (Array.isArray(detail)) return new Error("입력값이 올바르지 않습니다.");
    if (error.response?.status === 404) return new Error("Todo를 찾을 수 없습니다.");
    if (error.code === "ECONNREFUSED") return new Error("서버에 연결할 수 없습니다.");
    return new Error("API 요청에 실패했습니다.");
  }
  if (error instanceof Error) return error;
  return new Error("알 수 없는 오류가 발생했습니다.");
}

export async function getTodos(query: TodoQuery = {}): Promise<Todo[]> {
  try {
    const response = await api.get<unknown>("/todos", { params: query });
    return parseTodos(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function getTodo(id: number): Promise<Todo> {
  try {
    const response = await api.get<unknown>(`/todos/${id}`);
    return parseTodo(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function postTodo(payload: Omit<Todo, "id">): Promise<Todo> {
  try {
    const response = await api.post<unknown>("/todos", payload);
    return parseTodo(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function putTodo(id: number, payload: Partial<Omit<Todo, "id">>): Promise<Todo> {
  try {
    const response = await api.put<unknown>(`/todos/${id}`, payload);
    return parseTodo(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function removeTodo(id: number): Promise<void> {
  try {
    await api.delete(`/todos/${id}`);
  } catch (error) {
    throw normalizeError(error);
  }
}
