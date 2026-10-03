import { create } from 'zustand';
import {
  type GameDateTime, type ScheduledGameEvent, type GameEventCategory,
  type ClockTickPayload,
  GAME_START_DATE,
  fromJSDate, toJSDate, advanceByDays, advanceByHours,
  formatGameDate, formatGameTime, gameEventDateStr,
  clockListeners, dispatchClockCadences,
} from './gameClockEngine';
// ─────────────────────────────────────────────────────────────
//  Master Simulation Clock Types
// ─────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  time: string;
  dateStr: string;
  dayOffset: number;
  title: string;
  category: 'engineering' | 'logistics' | 'motorsport' | 'corporate' | 'rnd';
  description?: string;
  actionStage?: string;
}

export interface CompanyFeedItem {
  id: string;
  type: 'rnd' | 'motorsport' | 'supplier' | 'competitor' | 'production' | 'market';
  title: string;
  description: string;
  timestamp: string;
  read?: boolean;
}

export type SimSpeed = 1 | 2 | 5 | 10 | 25 | 50;

// ─────────────────────────────────────────────────────────────
//  State Interface (Time & Calendar Only)
// ─────────────────────────────────────────────────────────────

export interface SimulationClockState extends GameDateTime {
  // Speed controls
  isPlaying: boolean;
  speed: SimSpeed;

  // Events
  scheduledEvents: ScheduledGameEvent[];
  todayEvents: CalendarEvent[];
  feedItems: CompanyFeedItem[];
  allCalendarEvents: CalendarEvent[];

  // Actions
  togglePlay: () => void;
  pause: () => void;
  play: () => void;
  setSpeed: (speed: SimSpeed) => void;

  /** Advance N game-days using proper Date engine */
  advanceDays: (days?: number) => void;
  /** Advance N game-hours */
  advanceHours: (hours?: number) => void;
  /** Advance N game-months sequentially through the master clock */
  advanceMonths: (months?: number) => void;
  /** Skip to the date of the next scheduled event */
  skipToNextEvent: () => void;

  /** Schedule a new game event */
  scheduleEvent: (event: Omit<ScheduledGameEvent, 'id'>) => void;
  /** Remove a scheduled event */
  removeEvent: (eventId: string) => void;

  /** Jump directly to a specific year/month/day without intermediate simulation */
  setDate: (year: number, month?: number, day?: number) => void;
  /** Simulate day-by-day until reaching the target date, updating finances and firing events */
  simulateUntilDate: (targetYear: number, targetMonth?: number, targetDay?: number) => void;

  addFeedItem: (item: Omit<CompanyFeedItem, 'id'>) => void;

  /** Get full GameDateTime snapshot */
  getGameDateTime: () => GameDateTime;
}

// ─────────────────────────────────────────────────────────────
//  Seed Events (historically accurate for 1970)
// ─────────────────────────────────────────────────────────────

const SEED_EVENTS: ScheduledGameEvent[] = [
  // Motorsport
  { id: "ev_sa_gp",  dateStr: "1970-03-07", time: "14:00", title: "South African Grand Prix", category: "motorsport", actionStage: "motorsport", description: "Season opener at Kyalami Circuit" },
  { id: "ev_spa_gp", dateStr: "1970-06-07", time: "14:30", title: "Belgian Grand Prix",      category: "motorsport", actionStage: "motorsport", description: "High-speed race at Circuit de Spa-Francorchamps" },
  { id: "ev_mon_gp", dateStr: "1970-05-10", time: "14:00", title: "Monaco Grand Prix",       category: "motorsport", actionStage: "motorsport", description: "Prestigious street circuit race" },
  { id: "ev_ita_gp", dateStr: "1970-09-06", time: "14:00", title: "Italian Grand Prix",      category: "motorsport", actionStage: "motorsport", description: "Temple of speed at Autodromo di Monza" },

  // Engineering Milestones
  { id: "ev_eng_review",  dateStr: "1970-01-15", time: "09:00", title: "Inaugural Engineering Review",    category: "engineering", actionStage: "engine", description: "First powertrain design kickoff meeting" },
  { id: "ev_proto_start", dateStr: "1970-02-01", time: "10:00", title: "Prototype Development Begins",    category: "rnd",        actionStage: "rd",     description: "Workshop tooling commissioning for first chassis prototype" },
  { id: "ev_wind_tunnel",  dateStr: "1970-04-20", time: "11:00", title: "Wind Tunnel Testing Block",      category: "engineering", actionStage: "aero_studio", description: "40-hour aero programme in 1:4 scale wind tunnel" },

  // Corporate
  { id: "ev_board_q1", dateStr: "1970-03-31", time: "16:00", title: "Q1 Board Review",         category: "corporate", actionStage: "hq",       description: "Quarterly capital allocation and factory expansion" },
  { id: "ev_board_q2", dateStr: "1970-06-30", time: "16:00", title: "Q2 Board Review",         category: "corporate", actionStage: "hq",       description: "Mid-year performance review and forward guidance" },
  { id: "ev_board_q3", dateStr: "1970-09-30", time: "16:00", title: "Q3 Board Review",         category: "corporate", actionStage: "hq",       description: "Production ramp assessment and supplier contracts" },
  { id: "ev_board_q4", dateStr: "1970-12-31", time: "16:00", title: "Annual Board Meeting",    category: "corporate", actionStage: "hq",       description: "End-of-year strategy, dividends, and 1971 budget" },

  // Factory
  { id: "ev_factory_ground", dateStr: "1970-02-15", time: "08:00", title: "Factory Groundbreaking Ceremony", category: "factory", actionStage: "manufacturing", description: "Construction begins on first production facility" },

  // Market / Regulation
  { id: "ev_auto_show", dateStr: "1970-10-01", time: "09:00", title: "International Motor Show",    category: "market",    actionStage: "sales",       description: "Debut your vehicles to the global press and buyers" },
  { id: "ev_regulation", dateStr: "1970-07-01", time: "10:00", title: "New Emission Regulations",   category: "regulation", actionStage: "rd",         description: "Government mandates new exhaust emission standards" },
];

// ─────────────────────────────────────────────────────────────
//  Convert ScheduledGameEvent → legacy CalendarEvent
// ─────────────────────────────────────────────────────────────

function toCalendarEvent(e: ScheduledGameEvent, today: GameDateTime): CalendarEvent {
  const { year: ey, month: em, day: ed } = parseSimpleDateStr(e.dateStr);
  const evDate = toJSDate({ year: ey, month: em, day: ed, hour: 0, minute: 0 });
  const todayDate = toJSDate({ ...today, hour: 0, minute: 0 });
  const offset = Math.round((evDate.getTime() - todayDate.getTime()) / 86_400_000);

  return {
    id: e.id,
    time: e.time || "12:00",
    dateStr: e.dateStr,
    dayOffset: offset,
    title: e.title,
    category: mapCategory(e.category),
    description: e.description,
    actionStage: e.actionStage,
  };
}

function parseSimpleDateStr(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function mapCategory(cat: GameEventCategory): CalendarEvent['category'] {
  switch (cat) {
    case 'motorsport': return 'motorsport';
    case 'logistics':  return 'logistics';
    case 'engineering': return 'engineering';
    case 'rnd':        return 'rnd';
    default:           return 'corporate';
  }
}

// ─────────────────────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────────────────────

export const useSimulationClockStore = create<SimulationClockState>((set, get) => {
  const init = GAME_START_DATE;
  const todayStr = gameEventDateStr(init);
  const todayCalEvents = SEED_EVENTS
    .filter(e => e.dateStr === todayStr)
    .map(e => toCalendarEvent(e, init));

  return {
    // GameDateTime fields
    ...init,

    isPlaying: true, // Continuous simulation clock — time runs always
    speed: 1 as SimSpeed,

    scheduledEvents: [...SEED_EVENTS],

    todayEvents: todayCalEvents,

    allCalendarEvents: SEED_EVENTS.map(e => toCalendarEvent(e, init)),

    feedItems: [
      {
        id: "feed_startup",
        type: "market" as const,
        title: "Company Founded",
        description: "Your automotive company has been established. The journey begins in 1970.",
        timestamp: "Now",
      },
      {
        id: "feed_rnd_ready",
        type: "rnd" as const,
        title: "R&D Prototype Lab Online",
        description: "Advanced dynamometer and wind-tunnel data feeds calibrated for Project Genesis.",
        timestamp: "2h ago",
      },
      {
        id: "feed_motorsport_ready",
        type: "motorsport" as const,
        title: "Apex GT Motorsport Division Active",
        description: "Homologation scouting initiated across international racing circuits.",
        timestamp: "5h ago",
      },
      {
        id: "feed_b2b_contracts",
        type: "supplier" as const,
        title: "Tier-1 OEM Partnerships Established",
        description: "High-grade carbon composite and forged alloy supply chains secured.",
        timestamp: "1d ago",
      },
    ],

    // ── Actions ──────────────────────────────────────────────

    togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
    pause: () => set({ isPlaying: false }),
    play: () => set({ isPlaying: true }),
    setSpeed: (speed) => set({ speed }),

    advanceDays: (days = 1) => {
      const state = get();
      const previous: GameDateTime = extractGameDateTime(state);
      const current = advanceByDays(previous, days);

      // Determine today's events at the new date
      const newDateStr = gameEventDateStr(current);
      const todaySched = state.scheduledEvents.filter(e => e.dateStr === newDateStr);
      const newTodayEvents = todaySched.map(e => toCalendarEvent(e, current));
      const allCal = state.scheduledEvents.map(e => toCalendarEvent(e, current));

      // Fire subscriber callbacks
      dispatchClockCadences(previous, current, days, todaySched);

      set({
        ...current,
        todayEvents: newTodayEvents,
        allCalendarEvents: allCal,
      });
    },

    advanceHours: (hours = 1) => {
      const state = get();
      const previous: GameDateTime = extractGameDateTime(state);
      const current = advanceByHours(previous, hours);

      // Check if a day boundary was crossed
      const dayChanged = previous.day !== current.day || previous.month !== current.month || previous.year !== current.year;

      if (dayChanged) {
        // Full day-change processing
        const elapsedDays = Math.max(1, Math.round(hours / 24));
        const newDateStr = gameEventDateStr(current);
        const todaySched = state.scheduledEvents.filter(e => e.dateStr === newDateStr);

        dispatchClockCadences(previous, current, elapsedDays, todaySched);

        const todayCalEvts = todaySched.map(e => toCalendarEvent(e, current));
        set({
          ...current,
          todayEvents: todayCalEvts,
          allCalendarEvents: state.scheduledEvents.map(e => toCalendarEvent(e, current)),
        });
      } else {
        // Just update time fields
        set({ hour: current.hour, minute: current.minute });
      }
    },

    advanceMonths: (months = 1) => {
      const state = get();
      const previous: GameDateTime = extractGameDateTime(state);
      const targetDate = new Date(Date.UTC(previous.year, previous.month - 1 + months, previous.day, previous.hour, previous.minute));
      const daysDiff = Math.max(1, Math.round((targetDate.getTime() - toJSDate(previous).getTime()) / 86_400_000));
      get().advanceDays(daysDiff);
    },

    skipToNextEvent: () => {
      const state = get();
      const nowStr = gameEventDateStr(state);

      // Find the next event that is in the future
      const futureEvents = state.scheduledEvents
        .filter(e => e.dateStr > nowStr)
        .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

      if (futureEvents.length === 0) {
        // No future events — just advance 7 days
        get().advanceDays(7);
        return;
      }

      const next = futureEvents[0];
      const { year: ey, month: em, day: ed } = parseSimpleDateStr(next.dateStr);
      const eventDate = toJSDate({ year: ey, month: em, day: ed, hour: 0, minute: 0 });
      const nowDate = toJSDate({ ...state, hour: 0, minute: 0 });
      const daysToSkip = Math.max(1, Math.round((eventDate.getTime() - nowDate.getTime()) / 86_400_000));

      get().advanceDays(daysToSkip);
    },

    scheduleEvent: (event) => {
      const newEvent: ScheduledGameEvent = {
        ...event,
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      };
      set(state => ({
        scheduledEvents: [...state.scheduledEvents, newEvent],
        allCalendarEvents: [
          ...state.allCalendarEvents,
          toCalendarEvent(newEvent, extractGameDateTime(state)),
        ],
      }));
    },

    removeEvent: (eventId) => {
      set(state => ({
        scheduledEvents: state.scheduledEvents.filter(e => e.id !== eventId),
        allCalendarEvents: state.allCalendarEvents.filter(e => e.id !== eventId),
      }));
    },

    addFeedItem: (item) => {
      const state = get();
      const newItem: CompanyFeedItem = {
        ...item,
        id: `feed_${Date.now()}`,
      };
      // Tag with game date instead of "2h ago"
      if (!newItem.timestamp || newItem.timestamp === "Just now") {
        newItem.timestamp = formatGameDate(extractGameDateTime(state));
      }
      set(state2 => ({
        feedItems: [newItem, ...state2.feedItems.slice(0, 49)],
      }));
    },

    setDate: (year: number, month = 1, day = 1) => {
      const state = get();
      const previous = extractGameDateTime(state);
      const d = new Date(Date.UTC(year, Math.max(0, month - 1), Math.max(1, day), state.hour, state.minute));
      const current = fromJSDate(d);
      const newDateStr = gameEventDateStr(current);
      const todaySched = state.scheduledEvents.filter(e => e.dateStr === newDateStr);
      const newTodayEvents = todaySched.map(e => toCalendarEvent(e, current));
      const allCal = state.scheduledEvents.map(e => toCalendarEvent(e, current));

      set({
        ...current,
        todayEvents: newTodayEvents,
        allCalendarEvents: allCal,
      });

      dispatchClockCadences(previous, current, 0, todaySched);
    },

    simulateUntilDate: (targetYear: number, targetMonth = 1, targetDay = 1) => {
      const state = get();
      const targetDate = new Date(Date.UTC(targetYear, targetMonth - 1, targetDay, state.hour, state.minute));
      const currentDate = toJSDate(state);
      const diffMs = targetDate.getTime() - currentDate.getTime();
      const totalDays = Math.floor(diffMs / 86_400_000);

      if (totalDays > 0) {
        get().advanceDays(totalDays);
      } else if (totalDays < 0) {
        get().setDate(targetYear, targetMonth, targetDay);
      }
    },

    getGameDateTime: () => extractGameDateTime(get()),
  };
});

/** Extract only GameDateTime fields from the full state */
function extractGameDateTime(state: SimulationClockState | GameDateTime): GameDateTime {
  return {
    year: state.year,
    month: state.month,
    day: state.day,
    hour: state.hour,
    minute: state.minute,
    dayOfWeek: state.dayOfWeek,
    week: state.week,
    monthName: state.monthName,
    monthNameShort: state.monthNameShort,
  };
}

// ─────────────────────────────────────────────────────────────
//  Legacy compat: formatSimDate
// ─────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export const formatSimDate = (year: number, month: number, day: number) => {
  const mStr = MONTH_NAMES[month - 1] || "JAN";
  return `${day} ${mStr} ${year}`;
};
