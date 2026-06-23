"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTodos, postTodo, putTodo, removeTodo } from "./lib/api";
import { toDateString } from "./lib/date";
import { buildTodoDetailPath, buildTodoListPath, parseTodoPageQueryFromForm } from "./lib/todo-query";
import type { TodoQuery } from "./lib/types";

export async function fetchTodos(query: TodoQuery) {
  return getTodos(query);
}

export async function createTodo(formData: FormData) {
  const text = formData.get("text")?.toString().trim();
  const query = parseTodoPageQueryFromForm(formData, toDateString(new Date()));

  if (!text) {
    redirect(buildTodoListPath(query, "empty"));
  }

  await postTodo({ text, date: query.date, completed: false });
  revalidatePath("/todos");
  redirect(buildTodoListPath(query));
}

export async function updateTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  const text = formData.get("text")?.toString().trim();
  const completed = formData.get("completed") === "true";
  const query = parseTodoPageQueryFromForm(formData, toDateString(new Date()));

  if (!id) {
    redirect(buildTodoListPath(query));
  }

  if (!text) {
    redirect(buildTodoDetailPath(id, query, "empty"));
  }

  await putTodo(id, { text, date: query.date, completed });
  revalidatePath("/todos");
  redirect(buildTodoListPath(query));
}

export async function toggleTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  const completed = formData.get("completed") === "true";

  if (id) {
    await putTodo(id, { completed: !completed });
    revalidatePath("/todos");
  }
}

export async function deleteTodo(formData: FormData) {
  const id = Number(formData.get("id"));

  if (id) {
    await removeTodo(id);
    revalidatePath("/todos");
  }
}

export async function updateSearch(formData: FormData) {
  const query = parseTodoPageQueryFromForm(formData, toDateString(new Date()));
  redirect(buildTodoListPath(query));
}
