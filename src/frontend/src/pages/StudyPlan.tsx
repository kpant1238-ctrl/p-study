import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, LogIn, Plus } from "lucide-react";
import { useState } from "react";
import type { backendInterface } from "../backend";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Hindi",
];

export default function StudyPlan({
  actor,
  isLoggedIn,
  onLogin,
}: {
  actor: backendInterface | null;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const qc = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [newSubject, setNewSubject] = useState(SUBJECTS[0]);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", !!actor, isLoggedIn],
    queryFn: () => actor?.getTasksForCaller() ?? Promise.resolve([]),
    enabled: !!actor && isLoggedIn,
  });

  const addMutation = useMutation({
    mutationFn: ({ title, subject }: { title: string; subject: string }) =>
      actor!.addStudyTask(title, subject),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setNewTask("");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => actor!.markTaskCompleted(taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-gray-500 mb-6">
            Login to manage your personalized study plan and track your daily
            tasks.
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

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="font-bold text-xl text-gray-900">Study Plan</h1>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Add New Task</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Task title (e.g. Read Chapter 3)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              newTask.trim() &&
              addMutation.mutate({ title: newTask.trim(), subject: newSubject })
            }
            className="rounded-xl flex-1"
          />
          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button
            onClick={() =>
              newTask.trim() &&
              addMutation.mutate({ title: newTask.trim(), subject: newSubject })
            }
            disabled={!newTask.trim() || addMutation.isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">
            To Do ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((task) => (
              <div
                key={task.taskId}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group"
              >
                <button
                  type="button"
                  onClick={() => completeMutation.mutate(task.taskId)}
                  className="shrink-0"
                >
                  <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-400" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">{task.subject}</p>
                </div>
                <button
                  type="button"
                  onClick={() => completeMutation.mutate(task.taskId)}
                  className="text-xs text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Mark done
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">
            Completed ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((task) => (
              <div
                key={task.taskId}
                className="flex items-center gap-3 p-3 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400 line-through">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400">{task.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            No tasks yet. Add your first study task above!
          </p>
        </div>
      )}
    </div>
  );
}
