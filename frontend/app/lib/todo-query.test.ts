import { describe, expect, it } from "vitest";
import { buildTodoDetailPath, buildTodoListPath, parseTodoPageQuery } from "./todo-query";

describe("parseTodoPageQuery", () => {
  const fallbackDate = "2026-06-22";

  it("accepts valid filter, search, date, and week values", () => {
    expect(
      parseTodoPageQuery(
        { filter: "completed", search: "  report  ", date: "2026-06-23", week: "2" },
        fallbackDate,
      ),
    ).toEqual({ filter: "completed", search: "report", date: "2026-06-23", week: 2 });
  });

  it("falls back for malformed URL values", () => {
    expect(
      parseTodoPageQuery({ filter: "unknown", date: "2026-02-31", week: "1.5" }, fallbackDate),
    ).toEqual({ filter: "all", search: "", date: fallbackDate, week: 0 });
  });
});

describe("Todo URL builders", () => {
  const query = { filter: "active" as const, search: "report", date: "2026-06-22", week: -1 };

  it("preserves page state in list and edit URLs", () => {
    expect(buildTodoListPath(query, "empty")).toBe(
      "/todos?filter=active&search=report&date=2026-06-22&week=-1&error=empty",
    );
    expect(buildTodoDetailPath(7, query)).toBe(
      "/todos/7?filter=active&search=report&date=2026-06-22&week=-1",
    );
  });
});

