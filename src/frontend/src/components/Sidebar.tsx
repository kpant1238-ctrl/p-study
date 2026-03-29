import {
  BarChart2,
  BookOpen,
  Brain,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import type { Page } from "../App";

const ITEMS = [
  { key: "dashboard" as Page, icon: LayoutDashboard, label: "Dashboard" },
  { key: "subjects" as Page, icon: BookOpen, label: "Subjects" },
  { key: "quiz" as Page, icon: Brain, label: "Quiz" },
  { key: "papers" as Page, icon: FileText, label: "Papers" },
  { key: "plan" as Page, icon: Calendar, label: "Plan" },
  { key: "progress" as Page, icon: BarChart2, label: "Progress" },
  { key: "forum" as Page, icon: MessageSquare, label: "Forum" },
];

export default function Sidebar({
  page,
  onNavigate,
}: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <aside className="hidden md:flex flex-col w-16 bg-white/70 border-r border-border py-4 gap-1 items-center">
      {ITEMS.map(({ key, icon: Icon, label }) => (
        <button
          type="button"
          key={key}
          title={label}
          onClick={() => onNavigate(key)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            page === key
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
          }`}
        >
          <Icon size={18} />
        </button>
      ))}
    </aside>
  );
}
