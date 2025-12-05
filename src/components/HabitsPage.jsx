import { useState, useEffect } from "react";
import useLocalStore from "../hooks/useLocalStore";

function todayISO() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function daysBetween(a, b) {
    const da = new Date(a);
    const db = new Date(b);
    return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

function msUntilNextMidnight() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next.getTime() - now.getTime();
}

export default function HabitsPage() {
    // ✅ Persisted habits
    const [habits, setHabits] = useLocalStore("habits", [
        {
            id: 1,
            name: "Drink 8 glasses of water",
            cadence: "Daily",
            lastDone: null,
            currentStreak: 0,
            longestStreak: 0,
        },
        {
            id: 2,
            name: "Study 30 minutes",
            cadence: "Daily",
            lastDone: null,
            currentStreak: 0,
            longestStreak: 0,
        },
    ]);

    // Form state
    const [name, setName] = useState("");
    const [cadence, setCadence] = useState("Daily");

    // 🔁 Force habits UI to roll over at each new day
    useEffect(() => {
        const forceNewDay = () => {
            const today = todayISO();
            // touch state so React re-renders & doneToday recomputes
            setHabits((prev) => [...prev]);
            localStorage.setItem("habits_lastDay", today);
        };

        const today = todayISO();
        const lastDay = localStorage.getItem("habits_lastDay");

        // If we opened after midnight, immediately update
        if (lastDay !== today) {
            forceNewDay();
        }

        const delay = msUntilNextMidnight();
        const timerId = setTimeout(() => {
            forceNewDay();

            // then every 24h after that while tab is open
            const intervalId = setInterval(forceNewDay, 24 * 60 * 60 * 1000);
            window.__habitsDayIntervalId = intervalId;
        }, delay);

        return () => {
            clearTimeout(timerId);
            if (window.__habitsDayIntervalId) {
                clearInterval(window.__habitsDayIntervalId);
            }
        };
    }, [setHabits]);

    const handleAddHabit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newHabit = {
            id: Date.now(),
            name: name.trim(),
            cadence,
            lastDone: null,
            currentStreak: 0,
            longestStreak: 0,
        };

        setHabits((prev) => [newHabit, ...prev]);
        setName("");
        setCadence("Daily");
    };

    const markDoneToday = (id) => {
        const today = todayISO();

        setHabits((prev) =>
            prev.map((h) => {
                if (h.id !== id) return h;

                // already done today
                if (h.lastDone === today) return h;

                let newStreak = 1;

                if (h.lastDone) {
                    const diff = daysBetween(h.lastDone, today);

                    if (h.cadence === "Daily") {
                        if (diff === 1) {
                            newStreak = h.currentStreak + 1;
                        }
                    } else if (h.cadence === "Weekly") {
                        if (diff > 0 && diff <= 7) {
                            newStreak = h.currentStreak + 1;
                        }
                    }
                }

                const longest = Math.max(h.longestStreak, newStreak);

                return {
                    ...h,
                    lastDone: today,
                    currentStreak: newStreak,
                    longestStreak: longest,
                };
            })
        );
    };

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold mb-1">Habits</h2>
                <p className="text-sm text-slate-400">
                    Track repeating habits and build streaks over time.
                </p>
            </div>

            {/* Add Habit form */}
            <form
                onSubmit={handleAddHabit}
                className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex flex-col gap-3 md:flex-row md:items-end"
            >
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                        Habit name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
           dark:border-slate-700 dark:bg-slate-900
           focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Read 10 pages"
                    />
                </div>

                <div className="w-full md:w-40">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                        Cadence
                    </label>
                    <select
                        value={cadence}
                        onChange={(e) => setCadence(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
           dark:border-slate-700 dark:bg-slate-900
           focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Daily</option>
                        <option>Weekly</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2
                     text-sm font-medium text-white shadow-sm hover:bg-blue-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     focus:ring-offset-slate-900 md:mt-0"
                >
                    + Add habit
                </button>
            </form>

            {/* Habit list */}
            <div className="space-y-2">
                {habits.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No habits yet. Add one above to start tracking.
                    </p>
                ) : (
                    habits.map((habit) => {
                        const doneToday = habit.lastDone === todayISO();

                        return (
                            <div
                                key={habit.id}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
           dark:border-slate-700 dark:bg-slate-900
           focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <div>
                                    <p className="font-medium">{habit.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {habit.cadence} • Current streak:{" "}
                                        <span className="font-semibold">
                                            {habit.currentStreak}
                                        </span>{" "}
                                        | Longest:{" "}
                                        <span className="font-semibold">
                                            {habit.longestStreak}
                                        </span>
                                    </p>
                                    {habit.lastDone && (
                                        <p className="text-[11px] text-slate-600">
                                            Last done on {habit.lastDone}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => markDoneToday(habit.id)}
                                    className={
                                        "rounded-md px-3 py-1 text-xs font-medium transition-colors " +
                                        (doneToday
                                            ? "bg-emerald-600 text-white cursor-default"
                                            : "bg-slate-800 text-slate-100 hover:bg-emerald-600 hover:text-white")
                                    }
                                >
                                    {doneToday ? "Done today ✓" : "Mark done today"}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
