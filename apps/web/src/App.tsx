import { useState, useEffect } from 'react';
import { TaskInput } from './components/TaskInput';
import { TaskMatrix } from './components/TaskMatrix';
import { NoteEditor } from './components/NoteEditor';
import { FlashcardManager } from './components/FlashcardManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { LockScreen } from './components/LockScreen';
import { SettingsPage } from './components/SettingsPage';
import { ReminderManager } from './components/ReminderManager';
import { Clock } from './components/Clock';
import { PomodoroTimer } from './components/PomodoroTimer';
import { useTaskStore } from './stores/useTaskStore';
import { useAnalyticsStore } from './stores/useAnalyticsStore';
import { usePomodoroStore } from './stores/usePomodoroStore';
import { useNoteStore } from './stores/useNoteStore';
import { useFlashcardStore } from './stores/useFlashcardStore';
import { useThemeStore } from './stores/useThemeStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import clsx from 'clsx';

import { CalendarView } from './components/CalendarView';

import { LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Notebook, Zap, Settings as SettingsIcon } from 'lucide-react';

function MainApp() {
  const [view, setView] = useState<'dashboard' | 'tasks' | 'calendar' | 'notes' | 'flashcards' | 'settings'>('dashboard');
  const tasks = useTaskStore((state) => state.tasks);
  const { currentStreak, fetchAnalytics } = useAnalyticsStore();
  const { tick } = usePomodoroStore();

  // Fetch data and logic
  useEffect(() => {
    fetchAnalytics();
    useTaskStore.getState().fetchTasks();
    useNoteStore.getState().fetchNotes();
    useFlashcardStore.getState().fetchDecks();

    // Global Timer Interval
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, tick]);

  // Apply Theme
  const { theme, fontSize } = useThemeStore();
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply Font Size
  useEffect(() => {
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px'
    };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  // Simple calculated stats for MVP
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const totalPoints = completedTasks.reduce((acc, t) => acc + (t.pointsValue || 0), 0);

  const NavItem = ({ id, label, icon: Icon }: { id: typeof view, label: string, icon: any }) => (
    <button
      onClick={() => setView(id)}
      className={clsx(
        "flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
        // Desktop: Border bottom
        "md:border-b-2",
        // Mobile: No border, just color
        "border-transparent",
        view === id
          ? "md:border-accent text-accent"
          : "md:border-transparent text-primary-muted hover:text-primary"
      )}
    >
      <Icon className="w-5 h-5 md:w-4 md:h-4" />
      <span className="text-[10px] md:text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-primary p-0 md:p-8 font-sans transition-colors duration-300 pb-20 md:pb-8">
      <ReminderManager />
      <div className="w-full max-w-[1920px] mx-auto space-y-4 md:space-y-8 p-4 md:p-0">

        {/* Header / Gamification Stats */}
        <header className="flex flex-col xl:flex-row gap-4 justify-between items-center p-4 md:p-6 bg-secondary rounded-xl shadow-lg border border-border">
          <div className="flex-1 w-full md:w-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                KairOS
              </h1>
              <p className="text-primary-muted text-xs md:text-sm">Focus. Learn. Achieve.</p>
            </div>
            {/* Mobile Stats Compact View */}
            <div className="flex md:hidden gap-3 text-right">
              <div>
                <span className="block text-lg font-bold text-yellow-400 leading-none">{totalPoints}</span>
                <span className="text-[10px] text-primary-muted uppercase"> Pts</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-orange-400 leading-none">{currentStreak}</span>
                <span className="text-[10px] text-primary-muted uppercase"> Strk</span>
              </div>
            </div>
          </div>

          {/* Desktop Widgets (Hidden on Mobile) */}
          <div className="hidden md:flex gap-4 items-center flex-wrap justify-center">
            <PomodoroTimer />
            <div className="h-8 w-px bg-border hidden md:block"></div>
            <Clock />
          </div>

          {/* Mobile Timer Widget (Simplified) */}
          <div className="md:hidden w-full flex justify-center">
            <PomodoroTimer />
          </div>

          {/* Desktop Stats (Hidden on Mobile) */}
          <div className="hidden md:flex gap-6 flex-1 justify-end">
            <div className="text-center">
              <span className="block text-2xl font-bold text-yellow-400">{totalPoints}</span>
              <span className="text-xs text-primary-muted uppercase tracking-wider">Points</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-orange-400">{currentStreak}</span>
              <span className="text-xs text-primary-muted uppercase tracking-wider">Streak</span>
            </div>
          </div>
        </header>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden md:flex gap-4 border-b border-border pb-1 overflow-x-auto">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="tasks" label="Tasks" icon={CheckSquare} />
          <NavItem id="calendar" label="Calendar" icon={CalendarIcon} />
          <NavItem id="notes" label="Notes" icon={Notebook} />
          <NavItem id="flashcards" label="Flashcards" icon={Zap} />
          <NavItem id="settings" label="Settings" icon={SettingsIcon} />
        </nav>

        {/* Content View */}
        <main className="min-h-[600px]">
          {view === 'dashboard' && <AnalyticsDashboard />}
          {view === 'tasks' && (
            <div className="space-y-8">
              <section>
                <TaskInput />
              </section>
              <TaskMatrix />
            </div>
          )}
          {view === 'calendar' && <CalendarView />}
          {view === 'notes' && <NoteEditor />}
          {view === 'flashcards' && <FlashcardManager />}
          {view === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur border-t border-border z-50">
        <nav className="flex justify-around items-center h-16 pb-safe">
          <NavItem id="dashboard" label="Home" icon={LayoutDashboard} />
          <NavItem id="tasks" label="Tasks" icon={CheckSquare} />
          <NavItem id="calendar" label="Cal" icon={CalendarIcon} />
          <NavItem id="notes" label="Notes" icon={Notebook} />
          <NavItem id="flashcards" label="Cards" icon={Zap} />
          <NavItem id="settings" label="Set" icon={SettingsIcon} />
        </nav>
      </div>
    </div>
  );
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

export default App;
