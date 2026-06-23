import { describe, expect, it } from "vitest";
import { getMondayOfWeek, getWeekDates, offsetDateString, toDateString } from "./date";

describe("toDateString", () => {
  it("formats a date to YYYY-MM-DD", () => {
    expect(toDateString(new Date(2026, 5, 22))).toBe("2026-06-22");
  });

  it("pads single-digit month and day with zeros", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("getMondayOfWeek", () => {
  it("returns the same date when given a Monday", () => {
    const monday = new Date(2026, 5, 22); // 2026-06-22 월요일
    expect(toDateString(getMondayOfWeek(monday))).toBe("2026-06-22");
  });

  it("returns the previous Monday when given a Sunday", () => {
    const sunday = new Date(2026, 5, 28); // 2026-06-28 일요일
    expect(toDateString(getMondayOfWeek(sunday))).toBe("2026-06-22");
  });

  it("returns Monday of the same week for a midweek day", () => {
    const wednesday = new Date(2026, 5, 24); // 2026-06-24 수요일
    expect(toDateString(getMondayOfWeek(wednesday))).toBe("2026-06-22");
  });
});

describe("getWeekDates", () => {
  const baseDate = new Date(2026, 5, 24); // 2026-06-24 수요일

  it("returns 7 days starting from Monday for offset 0", () => {
    const dates = getWeekDates(0, baseDate);
    expect(dates).toHaveLength(7);
    expect(toDateString(dates[0])).toBe("2026-06-22");
    expect(toDateString(dates[6])).toBe("2026-06-28");
  });

  it("returns the previous week for offset -1", () => {
    const dates = getWeekDates(-1, baseDate);
    expect(toDateString(dates[0])).toBe("2026-06-15");
    expect(toDateString(dates[6])).toBe("2026-06-21");
  });

  it("returns the next week for offset +1", () => {
    const dates = getWeekDates(1, baseDate);
    expect(toDateString(dates[0])).toBe("2026-06-29");
    expect(toDateString(dates[6])).toBe("2026-07-05");
  });
});

describe("offsetDateString", () => {
  it("adds 7 days correctly", () => {
    expect(offsetDateString("2026-06-22", 7)).toBe("2026-06-29");
  });

  it("subtracts 7 days correctly", () => {
    expect(offsetDateString("2026-06-22", -7)).toBe("2026-06-15");
  });

  it("crosses a month boundary when adding days", () => {
    expect(offsetDateString("2026-06-28", 7)).toBe("2026-07-05");
  });

  it("crosses a month boundary when subtracting days", () => {
    expect(offsetDateString("2026-07-05", -7)).toBe("2026-06-28");
  });
});
