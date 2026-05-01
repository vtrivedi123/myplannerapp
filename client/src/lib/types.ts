// ============================================================
// DESIGN: Soft Academic — data types for the college planner
// ============================================================

export type Priority = 'low' | 'medium' | 'high';
export type AssignmentType = 'assignment' | 'exam' | 'project' | 'reading' | 'other';

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  semesterId: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  dueTime?: string; // HH:MM
  type: AssignmentType;
  priority: Priority;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string; // hex or tailwind color name
  semesterId: string;
  professor?: string;
  credits?: number;
}

export interface Semester {
  id: string;
  name: string; // e.g. "Fall 2024"
  startDate: string; // YYYY-MM-DD
  endDate: string;
  color: string;
  isActive?: boolean;
}

export type HabitCategory = 'health' | 'study' | 'social' | 'wellness' | 'fitness';

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: HabitCategory;
  color: string;
  targetDays: number[]; // 0=Sun ... 6=Sat, empty = every day
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  done: boolean;
}

export interface PlannerState {
  semesters: Semester[];
  courses: Course[];
  assignments: Assignment[];
  habits: Habit[];
  habitLogs: HabitLog[];
  activeSemesterId: string | null;
  activeCourseId: string | null;
  activeView: 'assignments' | 'calendar' | 'lifestyle';
  calendarMonth: number; // 0-11
  calendarYear: number;
}
