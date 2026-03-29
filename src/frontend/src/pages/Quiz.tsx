import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import type { Page, QuizContext } from "../App";
import type { Subject, backendInterface } from "../backend";
import { Button } from "../components/ui/button";

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#1E88E5",
  Science: "#2EAD63",
  "Social Science": "#F2A418",
  English: "#E05A47",
  Hindi: "#1EAD7A",
};

export default function Quiz({
  actor,
  ctx,
  onNavigate,
  isLoggedIn,
}: {
  actor: backendInterface | null;
  ctx: QuizContext;
  onNavigate: (p: Page, ctx?: QuizContext) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const qc = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    ctx?.subjectId ?? "",
  );
  const [selectedChapter, setSelectedChapter] = useState(
    ctx?.chapterNumber ?? 0,
  );
  const [started, setStarted] = useState(!!ctx);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["subjects", !!actor],
    queryFn: () => actor?.getSubjects() ?? Promise.resolve([]),
    enabled: !!actor,
  });

  const subject = subjects.find((s) => s.id === selectedSubjectId);
  const chapter = subject?.chapters.find(
    (c) => Number(c.number) === selectedChapter,
  );

  const { data: mcqs = [] } = useQuery({
    queryKey: ["mcqs", selectedSubjectId, selectedChapter, !!actor],
    queryFn: () =>
      actor
        ?.getChapterMCQs(selectedSubjectId, BigInt(selectedChapter))
        .then((r) => r ?? []) ?? Promise.resolve([]),
    enabled: !!actor && started && !!selectedSubjectId && selectedChapter > 0,
  });

  const saveMutation = useMutation({
    mutationFn: ({ score, total }: { score: number; total: number }) =>
      actor!.saveQuizAttempt(
        subject?.title ?? "",
        chapter?.title ?? "",
        BigInt(score),
        BigInt(total),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attempts"] }),
  });

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (currentQ + 1 >= mcqs.length) {
      const score = newAnswers.filter(
        (a, i) => a === Number(mcqs[i].correctIndex),
      ).length;
      if (isLoggedIn) saveMutation.mutate({ score, total: mcqs.length });
      setShowResult(true);
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    }
  };

  const resetQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="font-bold text-xl text-gray-900">Practice Quiz</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label
              htmlFor="subject-select"
              className="text-sm font-medium text-gray-700 block mb-1.5"
            >
              Select Subject
            </label>
            <select
              id="subject-select"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedChapter(0);
              }}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          {subject && (
            <div>
              <label
                htmlFor="chapter-select"
                className="text-sm font-medium text-gray-700 block mb-1.5"
              >
                Select Chapter
              </label>
              <select
                id="chapter-select"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(Number(e.target.value))}
              >
                <option value={0}>-- Select Chapter --</option>
                {subject.chapters.map((c) => (
                  <option key={c.number.toString()} value={Number(c.number)}>
                    Ch {Number(c.number)}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button
            onClick={() => setStarted(true)}
            disabled={!selectedSubjectId || !selectedChapter}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const score = answers.filter(
      (a, i) => a === Number(mcqs[i].correctIndex),
    ).length;
    const pct = Math.round((score / mcqs.length) * 100);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: pct >= 60 ? "#E8F7EF" : "#FFE9E6" }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: pct >= 60 ? "#2EAD63" : "#E05A47" }}
            >
              {pct}%
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Quiz Complete!
          </h2>
          <p className="text-gray-500 mb-2">{chapter?.title}</p>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            {score}/{mcqs.length} correct
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {pct >= 80
              ? "Excellent work! 🎉"
              : pct >= 60
                ? "Good job! Keep practicing."
                : "Keep studying and try again!"}
          </p>
          {!isLoggedIn && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
              Login to save your score to your progress
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={resetQuiz}
              className="gap-2 rounded-xl"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
            <Button
              onClick={() => onNavigate("subjects")}
              className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Back to Subjects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!mcqs.length)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );

  const q = mcqs[currentQ];
  const correct = Number(q.correctIndex);
  const color = SUBJECT_COLORS[subject?.title ?? ""] ?? "#1E88E5";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">{chapter?.title}</h1>
          <p className="text-sm text-gray-500">{subject?.title}</p>
        </div>
        <span className="text-sm font-medium text-gray-600">
          Q {currentQ + 1}/{mcqs.length}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            background: color,
            width: `${(currentQ / mcqs.length) * 100}%`,
          }}
        />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="font-semibold text-gray-900 text-lg mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let cls = "border-gray-200 hover:border-blue-400 hover:bg-blue-50";
            if (selected !== null) {
              if (i === correct) cls = "border-green-500 bg-green-50";
              else if (i === selected && i !== correct)
                cls = "border-red-500 bg-red-50";
              else cls = "border-gray-100 opacity-60";
            }
            return (
              <button
                type="button"
                key={opt}
                onClick={() => handleAnswer(i)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors text-left ${cls}`}
              >
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-gray-800 flex-1">{opt}</span>
                {selected !== null && i === correct && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                )}
                {selected !== null && i === selected && i !== correct && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div className="mt-5">
            <p className="text-sm text-gray-600 mb-3">
              {selected === correct
                ? "✅ Correct!"
                : `❌ The correct answer is: ${q.options[correct]}`}
            </p>
            <Button
              onClick={handleNext}
              className="w-full rounded-xl gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {currentQ + 1 >= mcqs.length ? "See Results" : "Next Question"}{" "}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
