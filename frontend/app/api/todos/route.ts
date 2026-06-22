import { NextRequest, NextResponse } from "next/server";
import { getTodos, postTodo } from "../../lib/api";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const todos = await getTodos(params);
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const todo = await postTodo(payload);
  return NextResponse.json(todo, { status: 201 });
}

