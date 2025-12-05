import { useState, useEffect } from "react";
import useLocalStore from "../hooks/useLocalStore";

function todayISO() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function msUntilNextMidnight() {
    const now = new Date();
    const next = new Date(now);
    // Set to next midnight
    next.setHours(24, 0, 0, 0);
    return next.getTime() - now.getTime();
}

export default function TasksPage() {
    // Persisted tasks
    const [tasks, setTasks] = useLocalStore("tasks", [
        {
            id: 1,
            title: "Finish web design outline",
            category: "School",
            dueDate: todayISO(),
            completed: false,
        },
        {
            id: 2,
            title: "30 min walk",
            category: "Health",
            dueDate: todayISO(),
            completed: true,
        },
    ]);

    // Local state for the add-task form
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("General");

    // 🔁 Reset tasks each new day
    useEffect(() => {
        const resetForToday = () => {
            const today = todayISO();
            // Reset completion + dueDate
            setTasks((prev) =>
                prev.map((t) => ({
                    ...t,
                    completed: false,
                    dueDate: today,
                }))
            );
            localStorage.setItem("tasks_lastReset", today);
        };

        const today = todayISO();
        const lastReset = localStorage.getItem("tasks_lastReset");

        // If we haven't reset yet today (e.g., reopened the app after midnight), reset now
        if (lastReset !== today) {
            resetForToday();
        }

        // Schedule a reset at the next midnight while the page is open
        const delay = msUntilNextMidnight();
        const timerId = setTimeout(() => {
            resetForToday();

            // After resetting once, keep scheduling daily
            const intervalId = setInterval(() => {
                resetForToday();
            }, 24 * 60 * 60 * 1000); // every 24 hours

            // Store intervalId on window so we can clean it up if needed
            window.__tasksResetIntervalId = intervalId;
        }, delay);

        return () => {
            clearTimeout(timerId);
            if (window.__tasksResetIntervalId) {
                clearInterval(window.__tasksResetIntervalId);
            }
        };
    }, [setTasks]);

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTask = {
            id: Date.now(),
            title: title.trim(),
            category: category || "General",
            dueDate: todayISO(),
            completed: false,
        };

        setTasks((prev) => [newTask, ...prev]);
        setTitle("");
        setCategory("General");
    };

    const toggleTask = (id) => {
        setTasks((prev) =>
            prev.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            )
        );
    };

    const deleteTask = (id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const todayTasks = tasks.filter((t) => t.dueDate === todayISO());
    const allDoneToday =
        todayTasks.length > 0 && todayTasks.every((t) => t.completed);

    return (
        <section className="space-y-6">
            {/* "All Done Today" banner */}
            {allDoneToday && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                        <p className="font-semibold text-emerald-300">
                            All tasks for today are complete!
                        </p>
                        <p className="text-xs text-emerald-200">
                            Great job staying on top of your schedule.
                        </p>
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold mb-1">Today&apos;s Tasks</h2>
                <p className="text-sm text-slate-400">
                    Add tasks for today, mark them complete, and get a little
                    celebration when you finish everything.
                </p>
            </div>

            {/* Add Task form */}
            <form
                onSubmit={handleAddTask}
                className="rounded-xl border border-slate-200 bg-white/80 
            dark:border-slate-700 dark:bg-slate-900/40
           p-4 flex flex-col gap-3 md:flex-row md:items-end shadow-sm"
            >
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                        Task name
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
           dark:border-slate-700 dark:bg-slate-900
           focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Review lecture notes"
                    />
                </div>

                <div className="w-full md:w-40">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm
           dark:border-slate-700 dark:bg-slate-900
           focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>General</option>
                        <option>School</option>
                        <option>Work</option>
                        <option>Health</option>
                        <option>Personal</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="mt-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2
                     text-sm font-medium text-white shadow-sm hover:bg-blue-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     focus:ring-offset-slate-900 md:mt-0"
                >
                    + Add task
                </button>
            </form>

            {/* Task list */}
            <div className="space-y-2">
                {todayTasks.length === 0 ? (
                    <p className="text-sm text-slate-500">
                        No tasks for today yet. Add one above to get started.
                    </p>
                ) : (
                    todayTasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/90
             dark:border-slate-700 dark:bg-slate-900/40
             px-3 py-2 text-sm shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500"
                                />
                                <div>
                                    <p
                                        className={
                                            "font-medium " +
                                            (task.completed ? "line-through text-slate-500" : "")
                                        }
                                    >
                                        {task.title}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Category:{" "}
                                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px]">
                                            {task.category}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="text-xs text-slate-500 hover:text-red-400"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
