import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  LogIn,
  Target,
  TrendingUp,
} from "lucide-react";
import type { Page, QuizContext } from "../App";
import type { backendInterface } from "../backend";
import { Button } from "../components/ui/button";

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; bar: string }
> = {
  Mathematics: { bg: "#E6F0FF", text: "#1E88E5", bar: "#1E88E5" },
  Science: { bg: "#E8F7EF", text: "#2EAD63", bar: "#2EAD63" },
  "Social Science": { bg: "#FFF3E0", text: "#F2A418", bar: "#F2A418" },
  English: { bg: "#FFE9E6", text: "#E05A47", bar: "#E05A47" },
  Hindi: { bg: "#EAFBF3", text: "#1EAD7A", bar: "#1EAD7A" },
};

export default function Dashboard({
  actor,
  onNavigate,
  isLoggedIn,
  onLogin,
}: {
  actor: backendInterface | null;
  onNavigate: (p: Page, ctx?: QuizContext) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", !!actor],
    queryFn: () => actor?.getSubjects() ?? Promise.resolve([]),
    enabled: !!actor,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", !!actor, isLoggedIn],
    queryFn: () => actor?.getTasksForCaller() ?? Promise.resolve([]),
    enabled: !!actor && isLoggedIn,
  });

  const { data: attempts = [] } = useQuery({
    queryKey: ["attempts", !!actor, isLoggedIn],
    queryFn: () => actor?.getQuizAttemptsForCaller() ?? Promise.resolve([]),
    enabled: !!actor && isLoggedIn,
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const dailyPct =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (s, a) => s + (Number(a.score) / Number(a.totalQuestions)) * 100,
            0,
          ) / attempts.length,
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Welcome card */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)",
          }}
        >
          <p className="text-blue-200 text-sm font-medium mb-1">
            Welcome back!
          </p>
          <h1 className="text-white text-2xl font-bold mb-1">
            Good Morning! 🌟
          </h1>
          <p className="text-blue-100 text-sm mb-4">
            Ready to ace your CBSE Class 10 exams? Let's study smart today.
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-blue-100">Daily Goal</span>
              <span className="text-white font-semibold">{dailyPct}%</span>
            </div>
            <div className="h-2.5 bg-blue-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
            {!isLoggedIn && (
              <p className="text-blue-200 text-xs mt-2">
                Login to track your progress
              </p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Quick Stats</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Subjects</p>
                <p className="font-semibold text-gray-800">
                  {subjects.length} Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Quiz Attempts</p>
                <p className="font-semibold text-gray-800">
                  {attempts.length} taken
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Avg Score</p>
                <p className="font-semibold text-gray-800">{avgScore}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Tasks Done</p>
                <p className="font-semibold text-gray-800">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Subjects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">
            My Subjects — Class 10th CBSE
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("subjects")}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const color = SUBJECT_COLORS[sub.title] ?? {
              bg: "#F3F4F6",
              text: "#374151",
              bar: "#6B7280",
            };
            const chapterCount = sub.chapters.length;
            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {sub.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {sub.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chapterCount} chapters
                    </p>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ background: color.bar, width: "40%" }}
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {sub.chapters.slice(0, 2).map((ch) => (
                    <span
                      key={ch.number.toString()}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: color.bg, color: color.text }}
                    >
                      {ch.title.length > 15
                        ? `${ch.title.slice(0, 15)}…`
                        : ch.title}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-xl text-xs font-semibold"
                  style={{ background: color.bar, color: "white" }}
                  onClick={() => onNavigate("subjects")}
                >
                  Start Learning
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Tasks */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Today's Tasks</h3>
            <button
              type="button"
              onClick={() => onNavigate("plan")}
              className="text-xs text-blue-600 hover:underline"
            >
              Manage plan
            </button>
          </div>
          {!isLoggedIn ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Login to track your study tasks
              </p>
              <Button
                size="sm"
                onClick={onLogin}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-2">No tasks yet</p>
              <button
                type="button"
                onClick={() => onNavigate("plan")}
                className="text-sm text-blue-600 hover:underline"
              >
                Add tasks in Study Plan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">{task.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz history / scores */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Recent Quiz Scores</h3>
            <button
              type="button"
              onClick={() => onNavigate("progress")}
              className="text-xs text-blue-600 hover:underline"
            >
              View all
            </button>
          </div>
          {!isLoggedIn ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-3">
                Login to see your quiz history
              </p>
              <Button
                size="sm"
                onClick={onLogin}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </Button>
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-2">No quizzes taken yet</p>
              <button
                type="button"
                onClick={() => onNavigate("quiz")}
                className="text-sm text-blue-600 hover:underline"
              >
                Take a quiz
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.slice(0, 5).map((a) => {
                const pct = Math.round(
                  (Number(a.score) / Number(a.totalQuestions)) * 100,
                );
                return (
                  <div key={a.attemptId} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {pct}%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {a.chapter}
                      </p>
                      <p className="text-xs text-gray-500">{a.subject}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {Number(a.score)}/{Number(a.totalQuestions)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
