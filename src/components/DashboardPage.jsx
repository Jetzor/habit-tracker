import useLocalStore from "../hooks/useLocalStore";

function todayISO() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function daysBetween(a, b) {
    const da = new Date(a);
    const db = new Date(b);
    return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

export default function DashboardPage() {
    // Read tasks & habits from the same localStorage keys
    const [tasks] = useLocalStore("tasks", []);
    const [habits] = useLocalStore("habits", []);

    const today = todayISO();

    // ---- Task stats ----
    const tasksToday = tasks.filter((t) => t.dueDate === today);
    const completedToday = tasksToday.filter((t) => t.completed).length;
    const totalToday = tasksToday.length;

    const todayPct =
        totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

    // Last 7 days (including today)
    const tasksThisWeek = tasks.filter((t) => {
        if (!t.dueDate) return false;
        const diff = daysBetween(t.dueDate, today);
        return diff >= 0 && diff <= 6;
    });
    const completedThisWeek = tasksThisWeek.filter((t) => t.completed).length;

    // ---- Habit stats ----
    const totalHabits = habits.length;
    const habitsDoneToday = habits.filter((h) => h.lastDone === today).length;

    const bestCurrentStreak =
        habits.length === 0
            ? 0
            : Math.max(...habits.map((h) => h.currentStreak || 0));

    const bestLongestStreak =
        habits.length === 0
            ? 0
            : Math.max(...habits.map((h) => h.longestStreak || 0));

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Dashboard</h2>
                <p className="text-sm text-slate-400">
                    Quick overview of your tasks and habits based on today&apos;s data.
                </p>
            </div>

            {/* Top cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">Tasks completed today</p>
                    <p className="text-2xl font-semibold">
                        {completedToday}{" "}
                        <span className="text-sm text-slate-400">/ {totalToday}</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {totalToday === 0
                            ? "No tasks scheduled for today."
                            : `You have finished ${todayPct}% of today's tasks.`}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">Tasks completed this week</p>
                    <p className="text-2xl font-semibold">{completedThisWeek}</p>
                    <p className="mt-1 text-xs text-slate-500">
                        Counting tasks with due dates in the last 7 days.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">Habits</p>
                    <p className="text-2xl font-semibold">
                        {habitsDoneToday}{" "}
                        <span className="text-sm text-slate-400">done today</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        You are tracking {totalHabits} habit
                        {totalHabits === 1 ? "" : "s"} in total.
                    </p>
                </div>
            </div>

            {/* Progress bar for today */}
            <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Today&apos;s completion</span>
                    <span>{todayPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${todayPct}%` }}
                    />
                </div>
            </div>

            {/* Streak stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">Best current streak</p>
                    <p className="text-2xl font-semibold">
                        {bestCurrentStreak}{" "}
                        <span className="text-sm text-slate-400">day(s)</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Longest streak you are currently maintaining on any habit.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                    <p className="text-xs text-slate-400 mb-1">All-time longest streak</p>
                    <p className="text-2xl font-semibold">
                        {bestLongestStreak}{" "}
                        <span className="text-sm text-slate-400">day(s)</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Your best streak ever across all tracked habits.
                    </p>
                </div>
            </div>
        </section>
    );
}
