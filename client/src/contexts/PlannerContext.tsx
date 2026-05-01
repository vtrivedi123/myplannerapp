// ============================================================
// DESIGN: Soft Academic — Planner state context with localStorage
// ============================================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { nanoid } from 'nanoid';
import type {
  PlannerState, Semester, Course, Assignment, Habit, HabitLog
} from '@/lib/types';
import { getTodayLocalDate } from '@/lib/utils';

// ── Seed data ──────────────────────────────────────────────
const today = new Date();
const todayStr = getTodayLocalDate();

const seedSemesterId = 'sem-spring-25';
const seedCourseIds = ['c1', 'c2', 'c3'];

const SEED_STATE: PlannerState = {
  semesters: [
    {
      id: seedSemesterId,
      name: 'Spring 2025',
      startDate: '2025-01-13',
      endDate: '2025-05-10',
      color: '#C4748A',
      isActive: true,
    },
    {
      id: 'sem-fall-25',
      name: 'Fall 2025',
      startDate: '2025-08-25',
      endDate: '2025-12-15',
      color: '#7BA68A',
      isActive: false,
    },
  ],
  courses: [
    { id: 'c1', name: 'Calculus II', code: 'MATH 202', color: '#C4748A', semesterId: seedSemesterId, professor: 'Dr. Rivera', credits: 4 },
    { id: 'c2', name: 'World History', code: 'HIST 101', color: '#7BA68A', semesterId: seedSemesterId, professor: 'Prof. Chen', credits: 3 },
    { id: 'c3', name: 'Intro to Psychology', code: 'PSYC 110', color: '#D4A853', semesterId: seedSemesterId, professor: 'Dr. Patel', credits: 3 },
  ],
  assignments: [
    {
      id: nanoid(), title: 'Problem Set 4', courseId: 'c1', semesterId: seedSemesterId,
      dueDate: todayStr, type: 'assignment', priority: 'high', completed: false,
      notes: 'Sections 7.1–7.4', createdAt: todayStr,
    },
    {
      id: nanoid(), title: 'Essay: Industrial Revolution', courseId: 'c2', semesterId: seedSemesterId,
      dueDate: new Date(today.getTime() + 2 * 86400000).toISOString().split('T')[0],
      type: 'assignment', priority: 'medium', completed: false,
      notes: '1500 words', createdAt: todayStr,
    },
    {
      id: nanoid(), title: 'Midterm Exam', courseId: 'c1', semesterId: seedSemesterId,
      dueDate: new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0],
      type: 'exam', priority: 'high', completed: false,
      createdAt: todayStr,
    },
    {
      id: nanoid(), title: 'Chapter 3 Reading', courseId: 'c3', semesterId: seedSemesterId,
      dueDate: new Date(today.getTime() + 1 * 86400000).toISOString().split('T')[0],
      type: 'reading', priority: 'low', completed: false,
      createdAt: todayStr,
    },
  ],
  habits: [
    { id: 'h1', name: 'Exercise', emoji: '🏃', category: 'fitness', color: '#7BA68A', targetDays: [] },
    { id: 'h2', name: 'Read 30 min', emoji: '📚', category: 'study', color: '#C4748A', targetDays: [] },
    { id: 'h3', name: 'Sleep 8hrs', emoji: '😴', category: 'wellness', color: '#D4A853', targetDays: [] },
    { id: 'h4', name: 'Drink Water', emoji: '💧', category: 'health', color: '#6BAED6', targetDays: [] },
  ],
  habitLogs: [],
  activeSemesterId: seedSemesterId,
  activeCourseId: null,
  activeView: 'assignments',
  calendarMonth: today.getMonth(),
  calendarYear: today.getFullYear(),
};

// ── Actions ────────────────────────────────────────────────
type Action =
  | { type: 'ADD_SEMESTER'; payload: Omit<Semester, 'id'> }
  | { type: 'UPDATE_SEMESTER'; payload: Semester }
  | { type: 'DELETE_SEMESTER'; payload: string }
  | { type: 'SET_ACTIVE_SEMESTER'; payload: string | null }
  | { type: 'ADD_COURSE'; payload: Omit<Course, 'id'> }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_ACTIVE_COURSE'; payload: string | null }
  | { type: 'ADD_ASSIGNMENT'; payload: Omit<Assignment, 'id' | 'createdAt'> }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'TOGGLE_ASSIGNMENT'; payload: string }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id'> }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT_LOG'; payload: { habitId: string; date: string } }
  | { type: 'SET_ACTIVE_VIEW'; payload: PlannerState['activeView'] }
  | { type: 'SET_CALENDAR_MONTH'; payload: { month: number; year: number } }
  | { type: 'LOAD_STATE'; payload: PlannerState };

function reducer(state: PlannerState, action: Action): PlannerState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_SEMESTER':
      return { ...state, semesters: [...state.semesters, { ...action.payload, id: nanoid() }] };
    case 'UPDATE_SEMESTER':
      return { ...state, semesters: state.semesters.map(s => s.id === action.payload.id ? action.payload : s) };
    case 'DELETE_SEMESTER':
      return {
        ...state,
        semesters: state.semesters.filter(s => s.id !== action.payload),
        courses: state.courses.filter(c => c.semesterId !== action.payload),
        assignments: state.assignments.filter(a => a.semesterId !== action.payload),
        activeSemesterId: state.activeSemesterId === action.payload ? null : state.activeSemesterId,
      };
    case 'SET_ACTIVE_SEMESTER':
      return { ...state, activeSemesterId: action.payload, activeCourseId: null };

    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, { ...action.payload, id: nanoid() }] };
    case 'UPDATE_COURSE':
      return { ...state, courses: state.courses.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(c => c.id !== action.payload),
        assignments: state.assignments.filter(a => a.courseId !== action.payload),
        activeCourseId: state.activeCourseId === action.payload ? null : state.activeCourseId,
      };
    case 'SET_ACTIVE_COURSE':
      return { ...state, activeCourseId: action.payload };

    case 'ADD_ASSIGNMENT':
      return {
        ...state,
        assignments: [...state.assignments, {
          ...action.payload,
          id: nanoid(),
          createdAt: getTodayLocalDate(),
        }],
      };
    case 'UPDATE_ASSIGNMENT':
      return { ...state, assignments: state.assignments.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'TOGGLE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(a =>
          a.id === action.payload ? { ...a, completed: !a.completed } : a
        ),
      };
    case 'DELETE_ASSIGNMENT':
      return { ...state, assignments: state.assignments.filter(a => a.id !== action.payload) };

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, { ...action.payload, id: nanoid() }] };
    case 'UPDATE_HABIT':
      return { ...state, habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HABIT':
      return {
        ...state,
        habits: state.habits.filter(h => h.id !== action.payload),
        habitLogs: state.habitLogs.filter(l => l.habitId !== action.payload),
      };
    case 'TOGGLE_HABIT_LOG': {
      const { habitId, date } = action.payload;
      const existing = state.habitLogs.find(l => l.habitId === habitId && l.date === date);
      if (existing) {
        return {
          ...state,
          habitLogs: state.habitLogs.map(l =>
            l.habitId === habitId && l.date === date ? { ...l, done: !l.done } : l
          ),
        };
      }
      return {
        ...state,
        habitLogs: [...state.habitLogs, { habitId, date, done: true }],
      };
    }

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
    case 'SET_CALENDAR_MONTH':
      return { ...state, calendarMonth: action.payload.month, calendarYear: action.payload.year };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────
interface PlannerContextValue {
  state: PlannerState;
  dispatch: React.Dispatch<Action>;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

const STORAGE_KEY = 'college-planner-v1';

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, SEED_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerState;
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  return (
    <PlannerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}
