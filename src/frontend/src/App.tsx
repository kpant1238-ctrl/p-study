import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import Progress from "./pages/Progress";
import Quiz from "./pages/Quiz";
import SamplePapers from "./pages/SamplePapers";
import StudyPlan from "./pages/StudyPlan";
import Subjects from "./pages/Subjects";

export type Page =
  | "dashboard"
  | "subjects"
  | "quiz"
  | "papers"
  | "plan"
  | "progress"
  | "forum";

export type QuizContext = { subjectId: string; chapterNumber: number } | null;

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [quizCtx, setQuizCtx] = useState<QuizContext>(null);
  const { identity, login, clear } = useInternetIdentity();
  const { actor } = useActor();

  const navigate = (p: Page, ctx?: QuizContext) => {
    setPage(p);
    if (ctx !== undefined) setQuizCtx(ctx);
  };

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #F7FAFC 0%, #EAF7F1 50%, #DDF0FF 100%)",
      }}
    >
      <Header
        page={page}
        onNavigate={navigate}
        isLoggedIn={isLoggedIn}
        onLogin={login}
        onLogout={clear}
      />
      <div className="flex flex-1">
        <Sidebar page={page} onNavigate={navigate} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {page === "dashboard" && (
            <Dashboard
              actor={actor}
              onNavigate={navigate}
              isLoggedIn={isLoggedIn}
              onLogin={login}
            />
          )}
          {page === "subjects" && (
            <Subjects actor={actor} onNavigate={navigate} />
          )}
          {page === "quiz" && (
            <Quiz
              actor={actor}
              ctx={quizCtx}
              onNavigate={navigate}
              isLoggedIn={isLoggedIn}
              onLogin={login}
            />
          )}
          {page === "papers" && <SamplePapers actor={actor} />}
          {page === "plan" && (
            <StudyPlan actor={actor} isLoggedIn={isLoggedIn} onLogin={login} />
          )}
          {page === "progress" && (
            <Progress actor={actor} isLoggedIn={isLoggedIn} onLogin={login} />
          )}
          {page === "forum" && (
            <Forum actor={actor} isLoggedIn={isLoggedIn} onLogin={login} />
          )}
        </main>
      </div>
    </div>
  );
}
