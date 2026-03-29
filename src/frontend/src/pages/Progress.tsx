import { useQuery } from "@tanstack/react-query";
import { Award, BarChart2, LogIn, TrendingUp } from "lucide-react";
import type { backendInterface } from "../backend";
import { Button } from "../components/ui/button";

const SUBJECT_COLORS: Record<string, { bar: string; bg: string }> = {
  Mathematics: { bar: "#1E88E5", bg: "#E6F0FF" },
  Science: { bar: "#2EAD63", bg: "#E8F7EF" },
  "Social Science": { bar: "#F2A418", bg: "#FFF3E0" },
  English: { bar: "#E05A47", bg: "#FFE9E6" },
  Hindi: { bar: "#1EAD7A", bg: "#EAFBF3" },
};

export default function Progress({
  actor,
  isLoggedIn,
  onLogin,
}: {
  actor: backendInterface | null;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const { data: attempts = [] } = useQuery({
    queryKey: ["attempts", !!actor, isLoggedIn],
    queryFn: () => actor?.getQuizAttemptsForCaller() ?? Promise.resolve([]),
    enabled: !!actor && isLoggedIn,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", !!actor, isLoggedIn],
    queryFn: () => actor?.getTasksForCaller() ?? Promise.resolve([]),
    enabled: !!actor && isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Login to View Progress
          </h2>
          <p className="text-gray-500 mb-6">
            Track your quiz scores, completed tasks, and study streaks.
          </p>
          <Button
            onClick={onLogin}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"
          >
            Login with Internet Identity
          </Button>
        </div>
      </div>
    );
  }

  // Aggregate scores by subject
  const subjectScores: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    if (!subjectScores[a.subject])
      subjectScores[a.subject] = { total: 0, count: 0 };
    subjectScores[a.subject].total +=
      (Number(a.score) / Number(a.totalQuestions)) * 100;
    subjectScores[a.subject].count += 1;
  }

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (s, a) => s + (Number(a.score) / Number(a.totalQuestions)) * 100,
            0,
          ) / attempts.length,
        )
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="font-bold text-xl text-gray-900">My Progress</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalScore}%</p>
          <p className="text-sm text-gray-500">Avg Score</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
          <p className="text-sm text-gray-500">Quizzes Taken</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
            <BarChart2 className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
          <p className="text-sm text-gray-500">Tasks Completed</p>
        </div>
      </div>

      {/* Subject performance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">
          Subject Performance
        </h3>
        {Object.keys(subjectScores).length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No quiz attempts yet. Take a quiz to see your performance!
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(subjectScores).map(([sub, { total, count }]) => {
              const avg = Math.round(total / count);
              const color = SUBJECT_COLORS[sub] ?? {
                bar: "#6B7280",
                bg: "#F3F4F6",
              };
              return (
                <div key={sub}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700">
                      {sub}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: color.bar }}
                    >
                      {avg}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ background: color.bar, width: `${avg}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {count} attempt{count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quiz history */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Quiz History</h3>
        {attempts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No quizzes taken yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">
                    Subject
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-600">
                    Chapter
                  </th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600">
                    Score
                  </th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-600">
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => {
                  const pct = Math.round(
                    (Number(a.score) / Number(a.totalQuestions)) * 100,
                  );
                  const color = SUBJECT_COLORS[a.subject];
                  return (
                    <tr
                      key={a.attemptId}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2.5 px-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={
                            color
                              ? { background: color.bg, color: color.bar }
                              : {}
                          }
                        >
                          {a.subject}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-700">{a.chapter}</td>
                      <td className="py-2.5 px-2 text-center text-gray-700">
                        {Number(a.score)}/{Number(a.totalQuestions)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`font-bold ${pct >= 80 ? "text-green-600" : pct >= 60 ? "text-amber-600" : "text-red-500"}`}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
