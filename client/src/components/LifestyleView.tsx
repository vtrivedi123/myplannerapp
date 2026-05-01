// ============================================================
// DESIGN: Anime theme — Lifestyle habit tracker
// Daily habit check-ins with streak visualization
// ============================================================

import { useState, useMemo } from 'react';
import { usePlanner } from '@/contexts/PlannerContext';
import { cn, HABIT_CATEGORY_CONFIG, getTodayLocalDate } from '@/lib/utils';
import { Plus, Trash2, Edit3, CheckCircle2, Circle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Habit, HabitCategory } from '@/lib/types';

const HABIT_EMOJIS = ['🏃','📚','😴','💧','🧘','🥗','🎵','✍️','🌿','💪','🎨','🧹','📓','🌅','☕'];

// ── Add/Edit Habit Dialog ─────────────────────────────────
function HabitDialog({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Habit }) {
  const { dispatch } = usePlanner();
  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🏃');
  const [category, setCategory] = useState<HabitCategory>(existing?.category ?? 'health');
  const [color, setColor] = useState(existing?.color ?? '#7BA68A');

  const catColor = HABIT_CATEGORY_CONFIG[category].color;

  function handleSave() {
    if (!name.trim()) { toast.error('Habit name is required'); return; }
    const payload = { name: name.trim(), emoji, category, color: catColor, targetDays: [] };
    if (existing) {
      dispatch({ type: 'UPDATE_HABIT', payload: { ...existing, ...payload } });
      toast.success('Habit updated');
    } else {
      dispatch({ type: 'ADD_HABIT', payload });
      toast.success('Habit added');
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-[Fraunces]">{existing ? 'Edit Habit' : 'New Habit'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Habit Name *</label>
            <Input placeholder="e.g. Exercise 30 min" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-lg transition-all border',
                    emoji === e ? 'border-primary bg-primary/10 scale-110' : 'border-border hover:border-primary/40'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <Select value={category} onValueChange={v => setCategory(v as HabitCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HABIT_CATEGORY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

// ── Habit Card ────────────────────────────────────────────
function HabitCard({ habit }: { habit: Habit }) {
  const { state, dispatch } = usePlanner();
  const [editOpen, setEditOpen] = useState(false);

  const todayStr = getTodayLocalDate();

  // Last 7 days
  const last7 = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
    }
    return days;
  }, []);

  const logMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    state.habitLogs.filter(l => l.habitId === habit.id).forEach(l => {
      map[l.date] = l.done;
    });
    return map;
  }, [state.habitLogs, habit.id]);

  const todayDone = logMap[todayStr] ?? false;

  // Calculate current streak
  const streak = useMemo(() => {
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (logMap[ds]) s++;
      else break;
    }
    return s;
  }, [logMap]);

  function handleToggleToday() {
    dispatch({ type: 'TOGGLE_HABIT_LOG', payload: { habitId: habit.id, date: todayStr } });
    if (!todayDone) toast.success(`${habit.emoji} ${habit.name} — done!`);
  }

  function handleDelete() {
    if (confirm(`Delete habit "${habit.name}"?`)) {
      dispatch({ type: 'DELETE_HABIT', payload: habit.id });
      toast.success('Habit deleted');
    }
  }

  const catConfig = HABIT_CATEGORY_CONFIG[habit.category];

  return (
    <div className="soft-card p-4 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: habit.color + '25' }}
          >
            {habit.emoji}
          </div>
          <div>
            <p className="font-medium text-sm">{habit.name}</p>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: habit.color + '20', color: habit.color }}
            >
              {catConfig.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs font-medium text-orange-500">
              <Flame size={13} />
              {streak}
            </div>
          )}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>

      {/* 7-day streak dots */}
      <div className="flex items-center gap-1 mb-3">
        {last7.map(date => {
          const done = logMap[date] ?? false;
          const isToday = date === todayStr;
          const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1);
          return (
            <div key={date} className="flex flex-col items-center gap-0.5 flex-1">
              <div
                className={cn(
                  'habit-dot',
                  done ? 'done' : 'border-border',
                  isToday && !done && 'border-primary/50'
                )}
                style={done ? { backgroundColor: habit.color } : {}}
              >
                {done && <span className="text-white text-[8px]">✓</span>}
              </div>
              <span className={cn(
                'text-[9px] font-mono',
                isToday ? 'text-primary font-bold' : 'text-muted-foreground'
              )}>
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* Today's toggle */}
      <button
        onClick={handleToggleToday}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all',
          todayDone
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground'
        )}
      >
        {todayDone
          ? <><CheckCircle2 size={14} /> Done today!</>
          : <><Circle size={14} /> Mark done today</>
        }
      </button>

      <HabitDialog open={editOpen} onClose={() => setEditOpen(false)} existing={habit} />
    </div>
  );
}

// ── Main Lifestyle View ───────────────────────────────────
export default function LifestyleView() {
  const { state } = usePlanner();
  const [addOpen, setAddOpen] = useState(false);

  const todayStr = getTodayLocalDate();
  const doneToday = state.habits.filter(h =>
    state.habitLogs.find(l => l.habitId === h.id && l.date === todayStr && l.done)
  ).length;

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Compact header matching Assignments style */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-[Fraunces] text-xl font-semibold">Lifestyle</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{todayDate}</p>
          </div>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
            <Plus size={14} />
            Add Habit
          </Button>
        </div>

        {/* Today's progress bar */}
        {state.habits.length > 0 && (
          <div className="p-3 rounded-lg border border-border/40" style={{ backgroundColor: 'rgba(0, 217, 255, 0.05)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Today's Progress</span>
              <span className="text-xs font-mono text-muted-foreground">{doneToday}/{state.habits.length}</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${state.habits.length > 0 ? (doneToday / state.habits.length) * 100 : 0}%`,
                  backgroundColor: '#00D9FF'
                }}
              />
            </div>
            {doneToday === state.habits.length && state.habits.length > 0 && (
              <p className="text-xs text-primary font-medium mt-1.5 text-center">
                🎉 All habits done today!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Habits grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {state.habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🌱</div>
            <p className="font-[Fraunces] text-base text-muted-foreground">Start your wellness journey</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Track daily habits to build a healthy college lifestyle</p>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus size={14} />
              Add your first habit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>

      <HabitDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
