/**
 * ═══════════════════════════════════════════════════════════════
 *  Game Clock Engine — Unit Tests
 * ═══════════════════════════════════════════════════════════════
 */
import { describe, it, expect } from "vitest";
import {
  fromJSDate, toJSDate, advanceByDays, advanceByHours,
  daysBetween, formatGameDate, formatGameTime,
  daysInMonth, isLeapYear,
  gameEventDateStr, parseEventDateStr,
  generateMonthGrid,
  GAME_START_DATE,
  ClockListenerRegistry,
  clockListeners,
  dispatchClockCadences,
  type GameDateTime,
} from "../../state/gameClockEngine";

describe("Game Clock Engine", () => {

  // ── Date Conversion ──────────────────────────────────────

  it("GAME_START_DATE is 1 January 1970, 08:00, Thursday", () => {
    expect(GAME_START_DATE.year).toBe(1970);
    expect(GAME_START_DATE.month).toBe(1);
    expect(GAME_START_DATE.day).toBe(1);
    expect(GAME_START_DATE.hour).toBe(8);
    expect(GAME_START_DATE.minute).toBe(0);
    expect(GAME_START_DATE.dayOfWeek).toBe("THURSDAY");
    expect(GAME_START_DATE.monthName).toBe("January");
    expect(GAME_START_DATE.monthNameShort).toBe("JAN");
  });

  it("round-trips through toJSDate → fromJSDate", () => {
    const dt: GameDateTime = {
      year: 1975, month: 6, day: 15, hour: 14, minute: 30,
      dayOfWeek: "SUNDAY", week: 24, monthName: "June", monthNameShort: "JUN",
    };
    const jsDate = toJSDate(dt);
    const result = fromJSDate(jsDate);
    expect(result.year).toBe(1975);
    expect(result.month).toBe(6);
    expect(result.day).toBe(15);
    expect(result.hour).toBe(14);
    expect(result.minute).toBe(30);
  });

  // ── Date Arithmetic ──────────────────────────────────────

  it("advanceByDays handles month rollover (31 Jan → 1 Feb)", () => {
    const jan31 = fromJSDate(new Date(Date.UTC(1970, 0, 31, 12, 0)));
    const result = advanceByDays(jan31, 1);
    expect(result.month).toBe(2);
    expect(result.day).toBe(1);
    expect(result.year).toBe(1970);
  });

  it("advanceByDays handles year rollover (31 Dec → 1 Jan next year)", () => {
    const dec31 = fromJSDate(new Date(Date.UTC(1970, 11, 31, 12, 0)));
    const result = advanceByDays(dec31, 1);
    expect(result.month).toBe(1);
    expect(result.day).toBe(1);
    expect(result.year).toBe(1971);
  });

  it("advanceByDays handles leap year (28 Feb 1972 → 29 Feb)", () => {
    const feb28 = fromJSDate(new Date(Date.UTC(1972, 1, 28, 12, 0)));
    const result = advanceByDays(feb28, 1);
    expect(result.month).toBe(2);
    expect(result.day).toBe(29);
    expect(result.year).toBe(1972);
  });

  it("advanceByDays handles non-leap year (28 Feb 1971 → 1 Mar)", () => {
    const feb28 = fromJSDate(new Date(Date.UTC(1971, 1, 28, 12, 0)));
    const result = advanceByDays(feb28, 1);
    expect(result.month).toBe(3);
    expect(result.day).toBe(1);
  });

  it("advanceByDays handles large jumps (365 days from Jan 1 1970)", () => {
    const result = advanceByDays(GAME_START_DATE, 365);
    expect(result.year).toBe(1971);
    expect(result.month).toBe(1);
    expect(result.day).toBe(1);
  });

  it("advanceByHours crosses day boundary", () => {
    const late = fromJSDate(new Date(Date.UTC(1970, 0, 1, 22, 0)));
    const result = advanceByHours(late, 5);
    expect(result.day).toBe(2);
    expect(result.hour).toBe(3);
  });

  it("daysBetween calculates correctly", () => {
    const a = fromJSDate(new Date(Date.UTC(1970, 0, 1)));
    const b = fromJSDate(new Date(Date.UTC(1970, 0, 15)));
    expect(daysBetween(a, b)).toBe(14);
  });

  // ── Formatting ───────────────────────────────────────────

  it("formatGameDate returns '1 JAN 1970'", () => {
    expect(formatGameDate(GAME_START_DATE)).toBe("1 JAN 1970");
  });

  it("formatGameTime returns '08:00'", () => {
    expect(formatGameTime(GAME_START_DATE)).toBe("08:00");
  });

  // ── Calendar Helpers ─────────────────────────────────────

  it("daysInMonth returns correct values", () => {
    expect(daysInMonth(1970, 1)).toBe(31);  // January
    expect(daysInMonth(1970, 2)).toBe(28);  // Feb non-leap
    expect(daysInMonth(1972, 2)).toBe(29);  // Feb leap
    expect(daysInMonth(1970, 4)).toBe(30);  // April
    expect(daysInMonth(1970, 12)).toBe(31); // December
  });

  it("isLeapYear identifies leap years correctly", () => {
    expect(isLeapYear(1972)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(1970)).toBe(false);
  });

  // ── Event Helpers ────────────────────────────────────────

  it("gameEventDateStr formats correctly", () => {
    expect(gameEventDateStr({ year: 1970, month: 3, day: 7 })).toBe("1970-03-07");
    expect(gameEventDateStr({ year: 1970, month: 12, day: 25 })).toBe("1970-12-25");
  });

  it("parseEventDateStr parses correctly", () => {
    const result = parseEventDateStr("1970-03-15");
    expect(result.year).toBe(1970);
    expect(result.month).toBe(3);
    expect(result.day).toBe(15);
  });

  // ── Month Grid ───────────────────────────────────────────

  it("generateMonthGrid returns 42 cells (6 rows × 7 cols)", () => {
    const grid = generateMonthGrid(1970, 1, GAME_START_DATE, []);
    expect(grid.length).toBe(42);
  });

  it("generateMonthGrid marks today correctly", () => {
    const grid = generateMonthGrid(1970, 1, GAME_START_DATE, []);
    const todayCell = grid.find(c => c.isToday);
    expect(todayCell).toBeDefined();
    expect(todayCell!.day).toBe(1);
    expect(todayCell!.month).toBe(1);
    expect(todayCell!.year).toBe(1970);
  });

  it("generateMonthGrid attaches events to correct days", () => {
    const events = [
      { id: "t1", dateStr: "1970-01-15", title: "Test", category: "engineering" as const },
    ];
    const grid = generateMonthGrid(1970, 1, GAME_START_DATE, events);
    const jan15 = grid.find(c => c.isCurrentMonth && c.day === 15);
    expect(jan15).toBeDefined();
    expect(jan15!.events.length).toBe(1);
    expect(jan15!.events[0].title).toBe("Test");
  });

  // ── Listener Registry ────────────────────────────────────

  it("ClockListenerRegistry fires day listeners on day change", () => {
    const reg = new ClockListenerRegistry();
    let called = false;
    reg.subscribe("day", "test", () => { called = true; });

    const prev = GAME_START_DATE;
    const cur = advanceByDays(prev, 1);

    const cadences = reg.getChangedCadences(prev, cur);
    expect(cadences).toContain("day");

    reg.notify("day", { previous: prev, current: cur, elapsedDays: 1, todayEvents: [] });
    expect(called).toBe(true);
  });

  it("ClockListenerRegistry fires month listener on month change", () => {
    const reg = new ClockListenerRegistry();
    let monthFired = false;
    reg.subscribe("month", "test_month", () => { monthFired = true; });

    const jan31 = fromJSDate(new Date(Date.UTC(1970, 0, 31)));
    const feb1 = advanceByDays(jan31, 1);

    const cadences = reg.getChangedCadences(jan31, feb1);
    expect(cadences).toContain("month");

    reg.notify("month", { previous: jan31, current: feb1, elapsedDays: 1, todayEvents: [] });
    expect(monthFired).toBe(true);
  });

  it("ClockListenerRegistry fires year listener on year change", () => {
    const reg = new ClockListenerRegistry();
    let yearFired = false;
    reg.subscribe("year", "test_year", () => { yearFired = true; });

    const dec31 = fromJSDate(new Date(Date.UTC(1970, 11, 31)));
    const jan1 = advanceByDays(dec31, 1);

    const cadences = reg.getChangedCadences(dec31, jan1);
    expect(cadences).toContain("year");
    expect(cadences).toContain("month");
    expect(cadences).toContain("day");

    reg.notify("year", { previous: dec31, current: jan1, elapsedDays: 1, todayEvents: [] });
    expect(yearFired).toBe(true);
  });

  it("ClockListenerRegistry unsubscribe works", () => {
    const reg = new ClockListenerRegistry();
    let count = 0;
    const unsub = reg.subscribe("day", "test_unsub", () => { count++; });

    const payload = { previous: GAME_START_DATE, current: advanceByDays(GAME_START_DATE, 1), elapsedDays: 1, todayEvents: [] };

    reg.notify("day", payload);
    expect(count).toBe(1);

    unsub();
    reg.notify("day", payload);
    expect(count).toBe(1); // Should not have increased
  });

  // ── Master Clock Cadence Dispatcher ───────────────────────

  it("dispatchClockCadences dispatches sequential monthly ticks when skipping multiple months", () => {
    const firedMonths: Array<{ month: number; year: number }> = [];
    const unsub = clockListeners.subscribe("month", "test_seq_month", (payload) => {
      firedMonths.push({ month: payload.current.month, year: payload.current.year });
    });

    try {
      const jan15 = fromJSDate(new Date(Date.UTC(1970, 0, 15)));
      const apr10 = fromJSDate(new Date(Date.UTC(1970, 3, 10)));

      dispatchClockCadences(jan15, apr10, 85, []);

      // Expect Feb (month 2), Mar (month 3), Apr (month 4) to have fired sequentially
      expect(firedMonths).toEqual([
        { month: 2, year: 1970 },
        { month: 3, year: 1970 },
        { month: 4, year: 1970 },
      ]);
    } finally {
      unsub();
    }
  });

  it("dispatchClockCadences dispatches sequential yearly ticks when skipping years", () => {
    const firedYears: number[] = [];
    const unsub = clockListeners.subscribe("year", "test_seq_year", (payload) => {
      firedYears.push(payload.current.year);
    });

    try {
      const dec1970 = fromJSDate(new Date(Date.UTC(1970, 11, 15)));
      const feb1973 = fromJSDate(new Date(Date.UTC(1973, 1, 10)));

      dispatchClockCadences(dec1970, feb1973, 780, []);

      // Expect 1971, 1972, 1973 to have fired sequentially
      expect(firedYears).toEqual([1971, 1972, 1973]);
    } finally {
      unsub();
    }
  });
});
