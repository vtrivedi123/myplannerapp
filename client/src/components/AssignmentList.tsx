// ============================================================
// DESIGN: Soft Academic — Assignment list with completion toggle
// Completed assignments are removed from active list (shown in "Done" section)
// ============================================================

import { useState, useMemo } from 'react';
import { usePlanner } from '@/contexts/PlannerContext';
import {
  cn, getCourseColorEntry, getDueBadge, PRIORITY_CONFIG,
  ASSIGNMENT_TYPE_CONFIG, formatDateShort, formatTimeAmPm, COURSE_COLORS, getTodayLocalDate
} from '@/lib/utils';
import {
  Plus, Trash2, Edit3, ChevronDown, ChevronUp, Filter,
  SortAsc, CheckCircle2, Circle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Assignment, Priority, AssignmentType } from '@/lib/types';

// ── Add/Edit Assignment Dialog ────────────────────────────
function AssignmentDialog({
  open, onClose, existing, defaultSemesterId, defaultCourseId
}: {
  open: boolean; onClose: () => void;
  existing?: Assignment;
  defaultSemesterId?: string | null;
  defaultCourseId?: string | null;
}) {
  const { state, dispatch } = usePlanner();
  const [title, setTitle] = useState(existing?.title ?? '');
  const [courseId, setCourseId] = useState(existing?.courseId ?? defaultCourseId ?? '');
  const [semesterId, setSemesterId] = useState(existing?.semesterId ?? defaultSemesterId ?? state.semesters[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? getTodayLocalDate());
  const [dueTime, setDueTime] = useState(existing?.dueTime ?? '');
  const [type, setType] = useState<AssignmentType>(existing?.type ?? 'assignment');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [notes, setNotes] = useState(existing?.notes ?? '');

  const availableCourses = state.courses.filter(c => c.semesterId === semesterId);

  function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!courseId) { toast.error('Please select a course'); return; }
    if (!dueDate) { toast.error('Due date is required'); return; }

    const payload = {
      title: title.trim(), courseId, semesterId, dueDate,
      dueTime: dueTime || undefined, type, priority,
      notes: notes.trim() || undefined, completed: existing?.completed ?? false,
    };

    if (existing) {
      dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { ...existing, ...payload } });
      toast.success('Assignment updated');
    } else {
      dispatch({ type: 'ADD_ASSIGNMENT', payload });
      toast.success('Assignment added');
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-[Fraunces]">{existing ? 'Edit Assignment' : 'New Assignment'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
            <Input
              placeholder="e.g. Problem Set 4"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Semester</label>
              <Select value={semesterId} onValueChange={v => { setSemesterId(v); setCourseId(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {state.semesters.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Course *</label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date *</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Time</label>
              <Input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <Select value={type} onValueChange={v => setType(v as AssignmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSIGNMENT_TYPE_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
            <Input placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button className="flex-1" onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Assignment Card ───────────────────────────────────────
function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const { state, dispatch } = usePlanner();
  const [editOpen, setEditOpen] = useState(false);
  const [completing, setCompleting] = useState(false);

  const course = state.courses.find(c => c.id === assignment.courseId);
  const colorEntry = course ? getCourseColorEntry(course.color) : null;
  const dueBadge = getDueBadge(assignment.dueDate, assignment.completed);
  const typeConfig = ASSIGNMENT_TYPE_CONFIG[assignment.type];
  const priorityConfig = PRIORITY_CONFIG[assignment.priority];

  function handleToggle() {
    if (!assignment.completed) {
      setCompleting(true);
      setTimeout(() => {
        dispatch({ type: 'TOGGLE_ASSIGNMENT', payload: assignment.id });
        setCompleting(false);
        toast.success('Assignment marked as done! ✓');
      }, 400);
    } else {
      dispatch({ type: 'TOGGLE_ASSIGNMENT', payload: assignment.id });
    }
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_ASSIGNMENT', payload: assignment.id });
    toast.success('Assignment deleted');
  }

  return (
    <div
      className={cn(
        'assignment-item group',
        assignment.completed && 'completed',
        completing && 'fade-complete'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className="mt-0.5 shrink-0 transition-transform hover:scale-110"
      >
        {assignment.completed
          ? <CheckCircle2 size={18} className="text-green-500" />
          : <Circle size={18} className="text-muted-foreground hover:text-primary transition-colors" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'assignment-title text-sm font-medium leading-snug',
            assignment.completed && 'line-through text-muted-foreground'
          )}>
            {typeConfig.emoji} {assignment.title}
          </p>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditOpen(true)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit3 size={12} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {course && (
            <span
              className="course-chip text-white text-[10px]"
              style={{ backgroundColor: course.color }}
            >
              {course.code || course.name}
            </span>
          )}
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', dueBadge.className)}>
            {dueBadge.label}
          </span>
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', priorityConfig.badge)}>
            {priorityConfig.label}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {formatDateShort(assignment.dueDate)}
            {assignment.dueTime && ` · ${formatTimeAmPm(assignment.dueTime)}`}
          </span>
        </div>

        {assignment.notes && (
          <p className="text-xs text-muted-foreground mt-1 italic">{assignment.notes}</p>
        )}
      </div>

      <AssignmentDialog open={editOpen} onClose={() => setEditOpen(false)} existing={assignment} />
    </div>
  );
}

// ── Main Assignment List ──────────────────────────────────
export default function AssignmentList() {
  const { state } = usePlanner();
  const [addOpen, setAddOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'course'>('dueDate');
  const [filterType, setFilterType] = useState<string>('all');

  const activeSemester = state.semesters.find(s => s.id === state.activeSemesterId);
  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  // Filter assignments by active semester and course
  const baseAssignments = useMemo(() => {
    return state.assignments.filter(a => {
      if (state.activeSemesterId && a.semesterId !== state.activeSemesterId) return false;
      if (state.activeCourseId && a.courseId !== state.activeCourseId) return false;
      if (filterType !== 'all' && a.type !== filterType) return false;
      return true;
    });
  }, [state.assignments, state.activeSemesterId, state.activeCourseId, filterType]);

  const pending = useMemo(() => {
    const sorted = baseAssignments.filter(a => !a.completed);
    return sorted.sort((a, b) => {
      if (sortBy === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'course') {
        const ca = state.courses.find(c => c.id === a.courseId)?.name ?? '';
        const cb = state.courses.find(c => c.id === b.courseId)?.name ?? '';
        return ca.localeCompare(cb);
      }
      return 0;
    });
  }, [baseAssignments, sortBy, state.courses]);

  const completed = useMemo(() => {
    return baseAssignments.filter(a => a.completed)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [baseAssignments]);

  const todayStr = getTodayLocalDate();
  const overdue = pending.filter(a => a.dueDate < todayStr);
  const upcoming = pending.filter(a => a.dueDate > todayStr);
  const todayAssignments = pending.filter(a => a.dueDate === todayStr);

  const activeCourse = state.activeCourseId
    ? state.courses.find(c => c.id === state.activeCourseId)
    : null;

  return (
     <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Compact header matching Lifestyle style */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            {activeCourse ? (
              <>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeCourse.color }} />
                  <h2 className="font-[Fraunces] text-xl font-semibold">{activeCourse.name}</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeCourse.code} · {pending.length} pending · {completed.length} done
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">{greeting} ☀️</p>
                <h2 className="font-[Fraunces] text-xl font-semibold">
                  {activeSemester ? activeSemester.name : 'All Assignments'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pending.length} pending · {completed.length} done
                </p>
              </>
            )}
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus size={14} />
            Add Assignment
          </Button>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter size={12} />
            <span>Filter:</span>
          </div>
          {['all', 'assignment', 'exam', 'project', 'reading', 'other'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                filterType === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {t === 'all' ? 'All' : `${ASSIGNMENT_TYPE_CONFIG[t as AssignmentType].emoji} ${ASSIGNMENT_TYPE_CONFIG[t as AssignmentType].label}`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <SortAsc size={12} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-xs border-none outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="course">Course</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Overdue */}
        {overdue.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={13} className="text-red-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500">Overdue</h3>
            </div>
            <div className="space-y-2">
              {overdue.map(a => <AssignmentCard key={a.id} assignment={a} />)}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</h3>
            </div>
            <div className="space-y-2">
              {upcoming.map(a => <AssignmentCard key={a.id} assignment={a} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {pending.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663617348932/FbYHn7pJ544MHtifrXSeYe/planner-empty-state-c6wzB3QJMeMa7oyNhhoKmK.webp"
              alt="Empty"
              className="w-28 h-28 object-contain mb-4 opacity-70"
            />
            <p className="font-[Fraunces] text-base text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending assignments. Great work!</p>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <button
              onClick={() => setShowCompleted(s => !s)}
              className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              {showCompleted ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Completed ({completed.length})
            </button>
            {showCompleted && (
              <div className="space-y-2">
                {completed.map(a => <AssignmentCard key={a.id} assignment={a} />)}
              </div>
            )}
          </section>
        )}
      </div>

      <AssignmentDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultSemesterId={state.activeSemesterId}
        defaultCourseId={state.activeCourseId}
      />
    </div>
  );
}
