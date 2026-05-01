// ============================================================
// DESIGN: Soft Academic — Main planner layout
// Sidebar | Main content area (Assignments / Calendar / Lifestyle)
// ============================================================

import { PlannerProvider, usePlanner } from '@/contexts/PlannerContext';
import Sidebar from '@/components/Sidebar';
import AssignmentList from '@/components/AssignmentList';
import CalendarView from '@/components/CalendarView';
import LifestyleView from '@/components/LifestyleView';

function PlannerContent() {
  const { state } = usePlanner();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {state.activeView === 'assignments' && <AssignmentList />}
        {state.activeView === 'calendar' && <CalendarView />}
        {state.activeView === 'lifestyle' && <LifestyleView />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <PlannerProvider>
      <PlannerContent />
    </PlannerProvider>
  );
}
