import { describe, it, expect } from 'vitest';
import { toDateString, getMondayOfWeek, getWeekDates } from './date';

describe('toDateString', () => {
  it('날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    expect(toDateString(new Date(2025, 5, 9))).toBe('2025-06-09');
  });

  it('한 자리 월/일은 0으로 패딩한다', () => {
    expect(toDateString(new Date(2025, 0, 5))).toBe('2025-01-05');
  });
});

describe('getMondayOfWeek', () => {
  it('월요일이 주어지면 그대로 반환한다', () => {
    const monday = new Date(2025, 5, 9); // 2025-06-09 월요일
    expect(toDateString(getMondayOfWeek(monday))).toBe('2025-06-09');
  });

  it('일요일이 주어지면 이전 월요일을 반환한다', () => {
    const sunday = new Date(2025, 5, 8); // 2025-06-08 일요일
    expect(toDateString(getMondayOfWeek(sunday))).toBe('2025-06-02');
  });

  it('수요일이 주어지면 해당 주 월요일을 반환한다', () => {
    const wednesday = new Date(2025, 5, 11); // 2025-06-11 수요일
    expect(toDateString(getMondayOfWeek(wednesday))).toBe('2025-06-09');
  });
});

describe('getWeekDates', () => {
  const base = new Date(2025, 5, 9); // 2025-06-09 월요일

  it('offset 0이면 이번 주 월~일 7일을 반환한다', () => {
    const dates = getWeekDates(0, base);
    expect(dates).toHaveLength(7);
    expect(toDateString(dates[0])).toBe('2025-06-09');
    expect(toDateString(dates[6])).toBe('2025-06-15');
  });

  it('offset 1이면 다음 주 날짜를 반환한다', () => {
    const dates = getWeekDates(1, base);
    expect(toDateString(dates[0])).toBe('2025-06-16');
  });

  it('offset -1이면 지난 주 날짜를 반환한다', () => {
    const dates = getWeekDates(-1, base);
    expect(toDateString(dates[0])).toBe('2025-06-02');
  });
});
