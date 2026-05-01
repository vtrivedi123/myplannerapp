// ============================================================
// DESIGN: Soft Academic — Sidebar with semester folders, course list, view nav
// ============================================================

import { useState } from 'react';
import { usePlanner } from '@/contexts/PlannerContext';
import { cn, getCourseColorEntry, SEMESTER_COLORS } from '@/lib/utils';
import {
  ChevronDown, ChevronRight, Plus, Folder, BookOpen,
  Calendar, Heart, GraduationCap, Trash2, Edit3, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Semester, Course } from '@/lib/types';
import { COURSE_COLORS } from '@/lib/utils';

// ── Add/Edit Semester Dialog ──────────────────────────────
function SemesterDialog({
  open, onClose, existing
}: { open: boolean; onClose: () => void; existing?: Semester }) {
  const { dispatch } = usePlanner();
  const [name, setName] = useState(existing?.name ?? '');
  const [startDate, setStartDate] = useState(existing?.startDate ?? '');
  const [endDate, setEndDate] = useState(existing?.endDate ?? '');
  const [color, setColor] = useState(existing?.color ?? SEMESTER_COLORS[0]);

  function handleSave() {
    if (!name.trim()) { toast.error('Semester name is required'); return; }
    if (existing) {
      dispatch({ type: 'UPDATE_SEMESTER', payload: { ...existing, name: name.trim(), startDate, endDate, color } });
      toast.success('Semester updated');
    } else {
      dispatch({ type: 'ADD_SEMESTER', payload: { name: name.trim(), startDate, endDate, color } });
      toast.success('Semester created');
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-[Fraunces]">{existing ? 'Edit Semester' : 'New Semester'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Semester Name</label>
            <Input placeholder="e.g. Fall 2025" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {SEMESTER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform',
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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

// ── Add/Edit Course Dialog ────────────────────────────────
function CourseDialog({
  open, onClose, semesterId, existing
}: { open: boolean; onClose: () => void; semesterId: string; existing?: Course }) {
  const { dispatch } = usePlanner();
  const [name, setName] = useState(existing?.name ?? '');
  const [code, setCode] = useState(existing?.code ?? '');
  const [professor, setProfessor] = useState(existing?.professor ?? '');
  const [credits, setCredits] = useState(existing?.credits?.toString() ?? '3');
  const [color, setColor] = useState(existing?.color ?? COURSE_COLORS[0].value);

  function handleSave() {
    if (!name.trim()) { toast.error('Course name is required'); return; }
    const payload = {
      name: name.trim(), code: code.trim(), professor: professor.trim(),
      credits: parseInt(credits) || 3, color, semesterId,
    };
    if (existing) {
      dispatch({ type: 'UPDATE_COURSE', payload: { ...existing, ...payload } });
      toast.success('Course updated');
    } else {
      dispatch({ type: 'ADD_COURSE', payload });
      toast.success('Course added');
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-[Fraunces]">{existing ? 'Edit Course' : 'Add Course'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Course Name *</label>
            <Input placeholder="e.g. Calculus II" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Course Code</label>
              <Input placeholder="MATH 202" value={code} onChange={e => setCode(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Credits</label>
              <Input type="number" min="1" max="6" value={credits} onChange={e => setCredits(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Professor</label>
            <Input placeholder="Dr. Smith" value={professor} onChange={e => setProfessor(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COURSE_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-transform',
                    color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
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

// ── Semester Folder Row ───────────────────────────────────
function SemesterFolder({ semester }: { semester: Semester }) {
  const { state, dispatch } = usePlanner();
  const [expanded, setExpanded] = useState(semester.id === state.activeSemesterId);
  const [editOpen, setEditOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const courses = state.courses.filter(c => c.semesterId === semester.id);
  const isActive = state.activeSemesterId === semester.id;
  function handleSelect() {
    dispatch({ type: 'SET_ACTIVE_SEMESTER', payload: semester.id });
    dispatch({ type: 'SET_ACTIVE_COURSE', payload: null });
  }
  function handleToggleExpanded() {
    setExpanded(e => !e);
  }

  function handleDelete() {
    if (confirm(`Delete "${semester.name}" and all its courses and assignments?`)) {
      dispatch({ type: 'DELETE_SEMESTER', payload: semester.id });
      toast.success('Semester deleted');
    }
  }

  return (
    <div className="mb-1">
      <div
        className={cn(
          'folder-item group',
          isActive && 'active'
        )}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <button
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => { handleSelect(); handleToggleExpanded(); }}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: semester.color }} />
          <Folder size={14} className="shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{semester.name}</span>
          <span className="ml-auto shrink-0">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        </button>
        {hovering && (
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={e => { e.stopPropagation(); setEditOpen(true); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit3 size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleDelete(); }}
              className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {courses.map(course => (
            <CourseRow key={course.id} course={course} semesterId={semester.id} />
          ))}
          <button
            onClick={() => setAddCourseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-full rounded-lg hover:bg-primary/5"
          >
            <Plus size={11} />
            Add course
          </button>
        </div>
      )}

      <SemesterDialog open={editOpen} onClose={() => setEditOpen(false)} existing={semester} />
      <CourseDialog open={addCourseOpen} onClose={() => setAddCourseOpen(false)} semesterId={semester.id} />
    </div>
  );
}

// ── Course Row ────────────────────────────────────────────
function CourseRow({ course, semesterId }: { course: Course; semesterId: string }) {
  const { state, dispatch } = usePlanner();
  const [editOpen, setEditOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const isActive = state.activeCourseId === course.id;
  const colorEntry = getCourseColorEntry(course.color);
  const assignmentCount = state.assignments.filter(
    a => a.courseId === course.id && !a.completed
  ).length;

  function handleDelete() {
    if (confirm(`Delete "${course.name}" and all its assignments?`)) {
      dispatch({ type: 'DELETE_COURSE', payload: course.id });
      toast.success('Course deleted');
    }
  }

  return (
    <div
      className={cn(
        'folder-item group text-sm',
        isActive && 'active'
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        className="flex items-center gap-2 flex-1 min-w-0"
        onClick={() => {
          dispatch({ type: 'SET_ACTIVE_SEMESTER', payload: semesterId });
          dispatch({ type: 'SET_ACTIVE_COURSE', payload: isActive ? null : course.id });
        }}
      >
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
        <BookOpen size={12} className="shrink-0 text-muted-foreground" />
        <span className="truncate">{course.name}</span>
        {assignmentCount > 0 && (
          <span
            className="ml-auto shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: course.color }}
          >
            {assignmentCount}
          </span>
        )}
      </button>
      {hovering && (
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={e => { e.stopPropagation(); setEditOpen(true); }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit3 size={11} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleDelete(); }}
            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
      <CourseDialog open={editOpen} onClose={() => setEditOpen(false)} semesterId={semesterId} existing={course} />
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────
export default function Sidebar() {
  const { state, dispatch } = usePlanner();
  const [addSemesterOpen, setAddSemesterOpen] = useState(false);

  const totalPending = state.assignments.filter(a => !a.completed).length;

  return (
    <aside className="w-60 shrink-0 h-full flex flex-col border-r border-border bg-sidebar">
      {/* Logo / Header with neon styling */}
      <div
        className="px-4 pt-5 pb-4 border-b"
        style={{
          borderColor: 'rgba(0, 217, 255, 0.3)',
          boxShadow: '0 0 15px rgba(0, 217, 255, 0.1), inset 0 0 15px rgba(0, 217, 255, 0.05)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center border" style={{ borderColor: 'rgba(0, 217, 255, 0.6)', boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)' }}>
            <GraduationCap size={17} className="text-primary" />
          </div>
          <div>
            <h1 className="font-[Fraunces] text-base font-bold leading-tight text-primary" style={{ textShadow: '0 0 10px rgba(0, 217, 255, 0.4)' }}>Planner</h1>
            <div className="flex gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00D9FF' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF006E' }} />
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7F39FB' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-3 border-b border-border space-y-0.5">
        {[
          { view: 'assignments' as const, icon: BookOpen, label: 'Assignments', badge: totalPending > 0 ? totalPending : null },
          { view: 'calendar' as const, icon: Calendar, label: 'Calendar', badge: null },
          { view: 'lifestyle' as const, icon: Heart, label: 'Lifestyle', badge: null },
        ].map(({ view, icon: Icon, label, badge }) => (
          <button
            key={view}
            onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: view })}
            className={cn(
              'folder-item w-full',
              state.activeView === view && 'active'
            )}
          >
            <Icon size={14} className="shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {badge !== null && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                {badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Semester Folders */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Semesters</span>
          <button
            onClick={() => setAddSemesterOpen(true)}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            title="Add semester"
          >
            <Plus size={12} />
          </button>
        </div>

        {state.semesters.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3 text-center">
            No semesters yet.<br />Create your first one!
          </p>
        ) : (
          state.semesters.map(sem => (
            <SemesterFolder key={sem.id} semester={sem} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          {state.assignments.filter(a => a.completed).length} assignments completed
        </p>
      </div>

      <SemesterDialog open={addSemesterOpen} onClose={() => setAddSemesterOpen(false)} />
    </aside>
  );
}
