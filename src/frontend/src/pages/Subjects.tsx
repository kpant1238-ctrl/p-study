import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Brain, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Page, QuizContext } from "../App";
import type { Chapter, Subject, backendInterface } from "../backend";
import { Button } from "../components/ui/button";

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Mathematics: { bg: "#E6F0FF", text: "#1E88E5", border: "#BBDEFB" },
  Science: { bg: "#E8F7EF", text: "#2EAD63", border: "#C8E6C9" },
  "Social Science": { bg: "#FFF3E0", text: "#F2A418", border: "#FFCCBC" },
  English: { bg: "#FFE9E6", text: "#E05A47", border: "#FFCDD2" },
  Hindi: { bg: "#EAFBF3", text: "#1EAD7A", border: "#B2DFDB" },
};

export default function Subjects({
  actor,
  onNavigate,
}: {
  actor: backendInterface | null;
  onNavigate: (p: Page, ctx?: QuizContext) => void;
}) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", !!actor],
    queryFn: () => actor?.getSubjects() ?? Promise.resolve([]),
    enabled: !!actor,
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );

  if (selectedChapter && selectedSubject) {
    const color = SUBJECT_COLORS[selectedSubject.title] ?? {
      bg: "#F3F4F6",
      text: "#374151",
      border: "#E5E7EB",
    };
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => setSelectedChapter(null)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to chapters
        </button>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: color.bg, color: color.text }}
            >
              {Number(selectedChapter.number)}
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">
                {selectedChapter.title}
              </h1>
              <p className="text-sm text-gray-500">{selectedSubject.title}</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {selectedChapter.notes}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
            <Button
              onClick={() =>
                onNavigate("quiz", {
                  subjectId: selectedSubject.id,
                  chapterNumber: Number(selectedChapter.number),
                })
              }
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="w-4 h-4 mr-2" /> Take Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSubject) {
    const color = SUBJECT_COLORS[selectedSubject.title] ?? {
      bg: "#F3F4F6",
      text: "#374151",
      border: "#E5E7EB",
    };
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => setSelectedSubject(null)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to subjects
        </button>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: color.bg, color: color.text }}
            >
              {selectedSubject.title[0]}
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900">
                {selectedSubject.title}
              </h1>
              <p className="text-sm text-gray-500">
                {selectedSubject.chapters.length} chapters
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {selectedSubject.chapters.map((ch) => (
              <button
                type="button"
                key={ch.number.toString()}
                onClick={() => setSelectedChapter(ch)}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors text-left group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: color.bg, color: color.text }}
                >
                  {Number(ch.number)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 group-hover:text-blue-700">
                    {ch.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ch.mcqs.length} MCQs available
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl text-gray-900">All Subjects</h1>
        <span className="text-sm text-gray-500">CBSE Class 10</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const color = SUBJECT_COLORS[sub.title] ?? {
            bg: "#F3F4F6",
            text: "#374151",
            border: "#E5E7EB",
          };
          return (
            <button
              type="button"
              key={sub.id}
              onClick={() => setSelectedSubject(sub)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3"
                style={{ background: color.bg, color: color.text }}
              >
                {sub.title[0]}
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-700 mb-1">
                {sub.title}
              </h3>
              <p className="text-sm text-gray-500">
                {sub.chapters.length} chapters
              </p>
              <div
                className="mt-3 flex items-center gap-1 text-xs font-medium"
                style={{ color: color.text }}
              >
                <BookOpen className="w-3.5 h-3.5" /> Start studying
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
