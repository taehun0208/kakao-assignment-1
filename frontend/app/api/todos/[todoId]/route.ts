import { NextRequest, NextResponse } from "next/server";
import { putTodo, removeTodo } from "../../../lib/api";

interface RouteContext {
  params: Promise<{ todoId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { todoId } = await context.params;
    const id = Number(todoId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "유효하지 않은 Todo ID입니다." }, { status: 400 });
    }
    const todo = await putTodo(id, await request.json());
    return NextResponse.json(todo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { todoId } = await context.params;
    const id = Number(todoId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "유효하지 않은 Todo ID입니다." }, { status: 400 });
    }
    await removeTodo(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
