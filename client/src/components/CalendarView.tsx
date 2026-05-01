// ============================================================
// DESIGN: Soft Academic — Month/Day calendar with assignment dots
// Completed assignments show crossed-off on the calendar
// ============================================================

import { useMemo, useState } from 'react';
import { usePlanner } from '@/contexts/PlannerContext';
import {
  cn, getDaysInMonth, getFirstDayOfMonth, MONTH_NAMES,
  formatDate, ASSIGNMENT_TYPE_CONFIG, PRIORITY_CONFIG, formatTimeAmPm
} from '@/lib/utils';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import type { Assignment } from '@/lib/types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Day Detail Panel ──────────────────────────────────────
function DayDetail({
  date, assignments, onClose
}: {
  date: string;
  assignments: Assignment[];
  onClose: () => void;
}) {
  const { state, dispatch } = usePlanner();
  const d = new Date(date + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border shadow-lg z-10 flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-[Fraunces] text-sm font-semibold">{label}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xs">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {assignments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Nothing due today</p>
        ) : (
          assignments.map(a => {
            const course = state.courses.find(c => c.id === a.courseId);
            const typeConfig = ASSIGNMENT_TYPE_CONFIG[a.type];
            return (
              <div
                key={a.id}
                className={cn(
                  'p-2.5 rounded-lg border border-border/60 transition-all',
                  a.completed && 'opacity-50 bg-muted'
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => {
                      dispatch({ type: 'TOGGLE_ASSIGNMENT', payload: a.id });
                      if (!a.completed) toast.success('Marked as done!');
                    }}
                    className="mt-0.5 shrink-0"
                  >
                    {a.completed
                      ? <CheckCircle2 size={15} className="text-green-500" />
                      : <Circle size={15} className="text-muted-foreground hover:text-primary" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-medium',
                      a.completed && 'line-through text-muted-foreground'
                    )}>
                      {typeConfig.emoji} {a.title}
                    </p>
                    {course && (
                      <span
                        className="text-[10px] text-white px-1.5 py-0.5 rounded-full mt-1 inline-block"
                        style={{ backgroundColor: course.color }}
                      >
                        {course.code || course.name}
                      </span>
                    )}
                    {a.dueTime && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{formatTimeAmPm(a.dueTime)}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Calendar Day Cell ─────────────────────────────────────
function DayCell({
  day, month, year, assignments, isToday, isOtherMonth, onClick, isSelected
}: {
  day: number;
  month: number;
  year: number;
  assignments: Assignment[];
  isToday: boolean;
  isOtherMonth: boolean;
  onClick: () => void;
  isSelected: boolean;
}) {
  const { state } = usePlanner();

  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const pending = assignments.filter(a => !a.completed);
  const done = assignments.filter(a => a.completed);

  // Show max 3 assignment pills
  const visible = assignments.slice(0, 3);
  const overflow = assignments.length - 3;

  return (
    <div
      onClick={onClick}
      className={cn(
        'cal-day cursor-pointer',
        isToday && 'today',
        isOtherMonth && 'other-month',
        isSelected && 'ring-2 ring-primary/40 bg-primary/5'
      )}
    >
      {/* Day number */}
      <div className={cn(
        'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 font-mono',
        isToday && 'bg-primary text-primary-foreground',
        !isToday && 'text-foreground'
      )}>
        {day}
      </div>

      {/* Assignment pills */}
      <div className="space-y-0.5">
        {visible.map(a => {
          const course = state.courses.find(c => c.id === a.courseId);
          return (
            <div
              key={a.id}
              className={cn(
                'cal-assignment',
                a.completed && 'completed'
              )}
              style={{
                backgroundColor: course ? course.color + '30' : '#C4748A30',
                color: course ? course.color : '#C4748A',
                borderLeft: `2px solid ${course?.color ?? '#C4748A'}`,
              }}
              title={a.title}
            >
              {a.completed && '✓ '}{a.title}
            </div>
          );
        })}
        {overflow > 0 && (
          <div className="text-[9px] text-muted-foreground pl-1">+{overflow} more</div>
        )}
      </div>
    </div>
  );
}

// ── Main Calendar View ────────────────────────────────────
export default function CalendarView() {
  const { state, dispatch } = usePlanner();
  const { calendarMonth: month, calendarYear: year } = state;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  function prevMonth() {
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    dispatch({ type: 'SET_CALENDAR_MONTH', payload: { month: m, year: y } });
  }

  function nextMonth() {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    dispatch({ type: 'SET_CALENDAR_MONTH', payload: { month: m, year: y } });
  }

  function goToday() {
    const now = new Date();
    dispatch({ type: 'SET_CALENDAR_MONTH', payload: { month: now.getMonth(), year: now.getFullYear() } });
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1 < 0 ? 11 : month - 1);

  // Assignments filtered by active semester/course
  const filteredAssignments = useMemo(() => {
    return state.assignments.filter(a => {
      if (state.activeSemesterId && a.semesterId !== state.activeSemesterId) return false;
      if (state.activeCourseId && a.courseId !== state.activeCourseId) return false;
      return true;
    });
  }, [state.assignments, state.activeSemesterId, state.activeCourseId]);

  // Map date -> assignments
  const assignmentsByDate = useMemo(() => {
    const map: Record<string, Assignment[]> = {};
    filteredAssignments.forEach(a => {
      if (!map[a.dueDate]) map[a.dueDate] = [];
      map[a.dueDate].push(a);
    });
    return map;
  }, [filteredAssignments]);

  // Build grid cells
  type Cell = { day: number; month: number; year: number; isOtherMonth: boolean };
  const cells: Cell[] = [];

  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    const prevM = month - 1 < 0 ? 11 : month - 1;
    const prevY = month - 1 < 0 ? year - 1 : year;
    cells.push({ day: daysInPrevMonth - i, month: prevM, year: prevY, isOtherMonth: true });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, isOtherMonth: false });
  }

  // Next month overflow to fill 6 rows
  const remaining = 42 - cells.length;
  const nextM = month + 1 > 11 ? 0 : month + 1;
  const nextY = month + 1 > 11 ? year + 1 : year;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: nextM, year: nextY, isOtherMonth: true });
  }

  const selectedAssignments = selectedDate ? (assignmentsByDate[selectedDate] ?? []) : [];

  const activeSemester = state.semesters.find(s => s.id === state.activeSemesterId);
  const activeCourse = state.activeCourseId
    ? state.courses.find(c => c.id === state.activeCourseId)
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[Fraunces] text-xl font-semibold">
              {activeCourse ? activeCourse.name : activeSemester ? activeSemester.name : 'Calendar'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredAssignments.filter(a => !a.completed).length} assignments pending · click a day to see details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-[Fraunces] text-base font-semibold min-w-[160px] text-center">
                {MONTH_NAMES[month]} {year}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-hidden relative">
        <div className={cn('h-full flex flex-col', selectedDate && 'pr-72')}>
          {/* Day labels */}
          <div className="grid grid-cols-7 px-4 pt-3 pb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-7 gap-1 h-full" style={{ gridAutoRows: 'minmax(80px, 1fr)' }}>
              {cells.map((cell, i) => {
                const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                return (
                  <DayCell
                    key={i}
                    day={cell.day}
                    month={cell.month}
                    year={cell.year}
                    assignments={assignmentsByDate[dateStr] ?? []}
                    isToday={dateStr === todayStr}
                    isOtherMonth={cell.isOtherMonth}
                    isSelected={selectedDate === dateStr}
                    onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <DayDetail
            date={selectedDate}
            assignments={selectedAssignments}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  );
}
