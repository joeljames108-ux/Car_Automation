/**
 * ═══════════════════════════════════════════════════════════════════════
 *  GAME CLOCK ENGINE — Heart of the Simulation
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Architecture (from design doc):
 *
 *                      GAME CLOCK
 *                          │
 *            ┌─────────────┼─────────────┐
 *            ↓             ↓             ↓
 *         DATE           TIME          SPEED
 *            │
 *            ↓
 *       EVENT MANAGER
 *            │
 *   ┌────────┼────────┬────────┬──────────┐
 *   ↓        ↓        ↓        ↓          ↓
 *   R&D    Factory  Logistics Motorsport NPCs
 *
 *  Rules:
 *    1. ONE master game date — every system reads from here
 *    2. Uses JavaScript Date for correct month lengths, leap years
 *    3. Game date is independent from real-world computer clock
 *    4. Fixed starting date: 1 January 1970
 *    5. Tiered update cadence: daily / weekly / monthly / yearly
 *    6. Discrete-event skip for long engineering projects
 */

// ─────────────────────────────────────────────────────────────
//  1. Calendar Helpers — proper Date-based arithmetic
// ─────────────────────────────────────────────────────────────

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const MONTH_NAMES_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

const DAY_NAMES = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
] as const;

export interface GameDateTime {
  year: number;
  month: number;    // 1-12
  day: number;      // 1-31
  hour: number;     // 0-23
  minute: number;   // 0-59
  dayOfWeek: string;
  week: number;     // 1-52
  monthName: string;
  monthNameShort: string;
}

/** Convert our decomposed fields into a native JS Date (UTC to avoid TZ issues) */
export function toJSDate(dt: Pick<GameDateTime, 'year' | 'month' | 'day' | 'hour' | 'minute'>): Date {
  return new Date(Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute));
}

/** Convert a JS Date back into our decomposed GameDateTime */
export function fromJSDate(d: Date): GameDateTime {
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const dow = d.getUTCDay();

  // ISO week number
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const daysSinceJan1 = Math.floor((d.getTime() - jan1.getTime()) / 86_400_000);
  const week = Math.max(1, Math.min(52, Math.ceil((daysSinceJan1 + jan1.getUTCDay() + 1) / 7)));

  return {
    year, month, day, hour, minute,
    dayOfWeek: DAY_NAMES[dow],
    week,
    monthName: MONTH_NAMES_FULL[month - 1],
    monthNameShort: MONTH_NAMES_SHORT[month - 1],
  };
}

/** Advance a GameDateTime by N days using proper Date arithmetic */
export function advanceByDays(dt: GameDateTime, days: number): GameDateTime {
  const d = toJSDate(dt);
  d.setUTCDate(d.getUTCDate() + days);
  return fromJSDate(d);
}

/** Advance by N hours */
export function advanceByHours(dt: GameDateTime, hours: number): GameDateTime {
  const d = toJSDate(dt);
  d.setUTCHours(d.getUTCHours() + hours);
  return fromJSDate(d);
}

/** Days between two GameDateTimes */
export function daysBetween(a: GameDateTime, b: GameDateTime): number {
  const da = toJSDate(a);
  const db = toJSDate(b);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** Format: "15 MAY 1970" */
export function formatGameDate(dt: GameDateTime): string {
  return `${dt.day} ${dt.monthNameShort} ${dt.year}`;
}

/** Format: "09:30" */
export function formatGameTime(dt: GameDateTime): string {
  return `${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}`;
}

/** Format: "15 MAY 1970 — MONDAY" */
export function formatFullGameDate(dt: GameDateTime): string {
  return `${dt.day} ${dt.monthNameShort} ${dt.year} — ${dt.dayOfWeek}`;
}

/** Get number of days in a given month/year */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Check if a year is a leap year */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}


// ─────────────────────────────────────────────────────────────
//  2. Scheduled Game Events
// ─────────────────────────────────────────────────────────────

export type GameEventCategory =
  | 'engineering' | 'logistics' | 'motorsport'
  | 'corporate'  | 'rnd'       | 'factory'
  | 'npc'        | 'market'    | 'regulation'
  | 'vehicle_launch' | 'milestone';

export interface ScheduledGameEvent {
  id: string;
  /** ISO date string "1970-03-15" — when the event fires */
  dateStr: string;
  /** Optional time "14:00" */
  time?: string;
  title: string;
  category: GameEventCategory;
  description?: string;
  /** Stage to navigate to when clicked */
  actionStage?: string;
  /** Has this event already been processed? */
  processed?: boolean;
  /** Was this auto-generated from a system (R&D, factory, contract, etc.)? */
  sourceSystem?: string;
  sourceId?: string;
}

/** Helper to create a date string from GameDateTime */
export function gameEventDateStr(dt: Pick<GameDateTime, 'year' | 'month' | 'day'>): string {
  const mm = String(dt.month).padStart(2, '0');
  const dd = String(dt.day).padStart(2, '0');
  return `${dt.year}-${mm}-${dd}`;
}

/** Parse "1970-03-15" back into components */
export function parseEventDateStr(s: string): { year: number; month: number; day: number } {
  const [y, m, d] = s.split('-').map(Number);
  return { year: y, month: m, day: d };
}


// ─────────────────────────────────────────────────────────────
//  3. Subscriber / Listener Registry
// ─────────────────────────────────────────────────────────────

export type TickCadence = 'day' | 'week' | 'month' | 'year';

export interface ClockTickPayload {
  previous: GameDateTime;
  current: GameDateTime;
  /** How many game-days elapsed in this tick batch */
  elapsedDays: number;
  /** Events that fire on this exact date */
  todayEvents: ScheduledGameEvent[];
}

export type ClockListener = (payload: ClockTickPayload) => void;

/** Simple pub-sub registry keyed by cadence */
export class ClockListenerRegistry {
  private listeners: Map<TickCadence, Map<string, ClockListener>> = new Map();

  constructor() {
    for (const c of ['day', 'week', 'month', 'year'] as TickCadence[]) {
      this.listeners.set(c, new Map());
    }
  }

  subscribe(cadence: TickCadence, id: string, fn: ClockListener): () => void {
    this.listeners.get(cadence)!.set(id, fn);
    return () => this.listeners.get(cadence)!.delete(id);
  }

  /** Fire listeners for the given cadence */
  notify(cadence: TickCadence, payload: ClockTickPayload): void {
    for (const fn of this.listeners.get(cadence)!.values()) {
      try { fn(payload); } catch (e) { console.error(`[GameClock] ${cadence} listener error:`, e); }
    }
  }

  /** Determine which cadences changed between previous and current */
  getChangedCadences(prev: GameDateTime, cur: GameDateTime): TickCadence[] {
    const changed: TickCadence[] = [];
    // Day always fires if the date is different
    if (prev.day !== cur.day || prev.month !== cur.month || prev.year !== cur.year) {
      changed.push('day');
    }
    // Week fires if the ISO week number changed
    if (prev.week !== cur.week || prev.year !== cur.year) {
      changed.push('week');
    }
    // Month fires if month or year changed
    if (prev.month !== cur.month || prev.year !== cur.year) {
      changed.push('month');
    }
    // Year fires if year changed
    if (prev.year !== cur.year) {
      changed.push('year');
    }
    return changed;
  }
}

/** Singleton registry — importable by any system that wants to subscribe */
export const clockListeners = new ClockListenerRegistry();


// ─────────────────────────────────────────────────────────────
//  4. Month Calendar Grid Generator (for UI)
// ─────────────────────────────────────────────────────────────

export interface CalendarGridDay {
  day: number;
  month: number;
  year: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayOfWeek: number; // 0=Sun 6=Sat
  events: ScheduledGameEvent[];
}

export function generateMonthGrid(
  year: number,
  month: number,
  today: GameDateTime,
  events: ScheduledGameEvent[]
): CalendarGridDay[] {
  const grid: CalendarGridDay[] = [];
  const dim = daysInMonth(year, month);
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun

  // Previous month padding
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDim = daysInMonth(prevYear, prevMonth);
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevDim - i;
    const ds = gameEventDateStr({ year: prevYear, month: prevMonth, day: d });
    grid.push({
      day: d, month: prevMonth, year: prevYear, dateStr: ds,
      isCurrentMonth: false,
      isToday: prevYear === today.year && prevMonth === today.month && d === today.day,
      isWeekend: false, dayOfWeek: 0,
      events: events.filter(e => e.dateStr === ds),
    });
  }

  // Current month days
  for (let d = 1; d <= dim; d++) {
    const dow = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    const ds = gameEventDateStr({ year, month, day: d });
    grid.push({
      day: d, month, year, dateStr: ds,
      isCurrentMonth: true,
      isToday: year === today.year && month === today.month && d === today.day,
      isWeekend: dow === 0 || dow === 6,
      dayOfWeek: dow,
      events: events.filter(e => e.dateStr === ds),
    });
  }

  // Next month padding to fill 6 rows (42 cells)
  const remaining = 42 - grid.length;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    const ds = gameEventDateStr({ year: nextYear, month: nextMonth, day: d });
    grid.push({
      day: d, month: nextMonth, year: nextYear, dateStr: ds,
      isCurrentMonth: false,
      isToday: nextYear === today.year && nextMonth === today.month && d === today.day,
      isWeekend: false, dayOfWeek: 0,
      events: events.filter(e => e.dateStr === ds),
    });
  }

  // Fix dayOfWeek for padding days
  grid.forEach((cell, i) => {
    cell.dayOfWeek = i % 7;
    cell.isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6;
  });

  return grid;
}


// ─────────────────────────────────────────────────────────────
//  5. Initial Game Start Date
// ─────────────────────────────────────────────────────────────

export const GAME_START_DATE: GameDateTime = fromJSDate(new Date(Date.UTC(1970, 0, 1, 8, 0)));

// Re-export short names for convenience
export { MONTH_NAMES_FULL, MONTH_NAMES_SHORT, DAY_NAMES };
