import { NextRequest, NextResponse } from "next/server";
import { putTodo, removeTodo } from "../../../lib/api";

interface RouteContext {
  params: Promise<{ todoId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { todoId } = await context.params;
  const todo = await putTodo(Number(todoId), await request.json());
  return NextResponse.json(todo);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { todoId } = await context.params;
  await removeTodo(Number(todoId));
  return new NextResponse(null, { status: 204 });
}

