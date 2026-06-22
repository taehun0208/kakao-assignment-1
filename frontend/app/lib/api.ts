import axios from "axios";
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
    throw new Error("FastAPI response has an invalid Todo shape.");
  }
  return value;
}

function parseTodos(value: unknown): Todo[] {
  if (!Array.isArray(value) || !value.every(isTodo)) {
    throw new Error("FastAPI response has an invalid Todo list shape.");
  }
  return value;
}

export async function getTodos(query: TodoQuery = {}): Promise<Todo[]> {
  const response = await api.get<unknown>("/todos", { params: query });
  return parseTodos(response.data);
}

export async function getTodo(id: number): Promise<Todo> {
  const response = await api.get<unknown>(`/todos/${id}`);
  return parseTodo(response.data);
}

export async function postTodo(payload: Omit<Todo, "id">): Promise<Todo> {
  const response = await api.post<unknown>("/todos", payload);
  return parseTodo(response.data);
}

export async function putTodo(id: number, payload: Partial<Omit<Todo, "id">>): Promise<Todo> {
  const response = await api.put<unknown>(`/todos/${id}`, payload);
  return parseTodo(response.data);
}

export async function removeTodo(id: number): Promise<void> {
  await api.delete(`/todos/${id}`);
}
