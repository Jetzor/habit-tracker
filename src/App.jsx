import { useEffect, useState } from "react";
import TasksPage from "./components/TasksPage";
import HabitsPage from "./components/HabitsPage";
import DashboardPage from "./components/DashboardPage";

const TABS = ["Tasks", "Habits", "Dashboard"];

function getInitialTheme() {
    if (typeof window === "undefined") return "dark";

    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;

    // fallback: match OS preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

function App() {
    const [activeTab, setActiveTab] = useState("Tasks");
    const [theme, setTheme] = useState(getInitialTheme);

    // Apply theme to <html> for Tailwind's dark: classes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const renderTab = () => {
        switch (activeTab) {
            case "Habits":
                return <HabitsPage />;
            case "Dashboard":
                return <DashboardPage />;
            case "Tasks":
            default:
                return <TasksPage />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            FocusFlow
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Tasks, habits, and progress in one place.
                        </p>
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={() =>
                            setTheme((prev) => (prev === "light" ? "dark" : "light"))
                        }
                        className="rounded-full px-3 py-1 text-xs border border-slate-300 dark:border-slate-600
                       bg-white/70 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700
                       transition-colors flex items-center gap-1"
                    >
                        {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
                    </button>
                </div>

                {/* Tabs */}
                <nav className="border-t border-slate-200 dark:border-slate-700">
                    <div className="max-w-5xl mx-auto flex px-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={
                                    "flex-1 py-2 text-sm font-medium border-b-2 transition-colors " +
                                    (activeTab === tab
                                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200")
                                }
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </nav>
            </header>

            {/* Main content */}
            <main className="max-w-5xl mx-auto px-4 py-6">{renderTab()}</main>
        </div>
    );
}

export default App;
