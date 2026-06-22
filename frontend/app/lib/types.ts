export type FilterType = "all" | "active" | "completed";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: string;
}

export interface TodoQuery {
  filter?: FilterType;
  search?: string;
  date?: string;
}

