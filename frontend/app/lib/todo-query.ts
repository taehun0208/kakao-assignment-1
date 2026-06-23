import type { FilterType, TodoQuery } from "./types";

type SearchParamValue = string | string[] | undefined;
type SearchParams = Record<string, SearchParamValue>;

const filters: FilterType[] = ["all", "active", "completed"];
const maxWeekOffset = 5200;

export interface TodoPageQuery extends TodoQuery {
  filter: FilterType;
  search: string;
  date: string;
  week: number;
}

function firstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function parseTodoPageQuery(
  params: SearchParams,
  fallbackDate: string,
): TodoPageQuery {
  const requestedFilter = firstValue(params.filter);
  const filter = filters.includes(requestedFilter as FilterType)
    ? (requestedFilter as FilterType)
    : "all";
  const requestedDate = firstValue(params.date);
  const requestedWeek = Number(firstValue(params.week) ?? 0);

  return {
    filter,
    search: firstValue(params.search)?.trim() ?? "",
    date: requestedDate && isCalendarDate(requestedDate) ? requestedDate : fallbackDate,
    week:
      Number.isInteger(requestedWeek) && Math.abs(requestedWeek) <= maxWeekOffset
        ? requestedWeek
        : 0,
  };
}

export function parseTodoPageQueryFromForm(
  formData: FormData,
  fallbackDate: string,
): TodoPageQuery {
  return parseTodoPageQuery(
    {
      filter: formData.get("filter")?.toString(),
      search: formData.get("search")?.toString(),
      date: formData.get("date")?.toString(),
      week: formData.get("week")?.toString(),
    },
    fallbackDate,
  );
}

function toSearchParams(query: TodoPageQuery, error?: string): URLSearchParams {
  const params = new URLSearchParams();

  if (query.filter !== "all") params.set("filter", query.filter);
  if (query.search) params.set("search", query.search);
  params.set("date", query.date);
  if (query.week) params.set("week", String(query.week));
  if (error) params.set("error", error);

  return params;
}

export function buildTodoListPath(query: TodoPageQuery, error?: string): string {
  return `/todos?${toSearchParams(query, error).toString()}`;
}

export function buildTodoDetailPath(todoId: number, query: TodoPageQuery, error?: string): string {
  return `/todos/${todoId}?${toSearchParams(query, error).toString()}`;
}

