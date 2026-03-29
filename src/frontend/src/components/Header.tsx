import { Bell, BookOpen, LogIn, LogOut, Search } from "lucide-react";
import type { Page } from "../App";
import { Button } from "./ui/button";

const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "subjects", label: "Subjects" },
  { key: "quiz", label: "Quiz" },
  { key: "papers", label: "Papers" },
  { key: "plan", label: "Study Plan" },
  { key: "progress", label: "Progress" },
  { key: "forum", label: "Forum" },
];

export default function Header({
  page,
  onNavigate,
  isLoggedIn,
  onLogin,
  onLogout,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border shadow-sm">
      <div className="flex items-center gap-4 px-4 md:px-6 h-14">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">P-Study</span>
          <span className="hidden md:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            Class 10
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              type="button"
              key={key}
              onClick={() => onNavigate(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                page === key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-500">
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
          </div>
          <button
            type="button"
            className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          >
            <Bell className="w-4 h-4" />
          </button>
          {isLoggedIn ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onLogout}
              className="gap-1.5 rounded-full"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onLogin}
              className="gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </Button>
          )}
        </div>
      </div>

      <div className="lg:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            type="button"
            key={key}
            onClick={() => onNavigate(key)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              page === key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
