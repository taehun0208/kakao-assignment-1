import { NextRequest, NextResponse } from "next/server";
import { getTodos, postTodo } from "../../lib/api";
import type { FilterType } from "../../lib/types";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const todos = await getTodos({
      filter: (sp.get("filter") ?? undefined) as FilterType | undefined,
      search: sp.get("search") ?? undefined,
      date: sp.get("date") ?? undefined,
      date_from: sp.get("date_from") ?? undefined,
      date_to: sp.get("date_to") ?? undefined,
    });
    return NextResponse.json(todos);
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const todo = await postTodo(payload);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
