import { useQuery } from "@tanstack/react-query";
import { FileText, X } from "lucide-react";
import { useState } from "react";
import type { SamplePaper, backendInterface } from "../backend";
import { Button } from "../components/ui/button";

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: "#E6F0FF", text: "#1E88E5" },
  Science: { bg: "#E8F7EF", text: "#2EAD63" },
  "Social Science": { bg: "#FFF3E0", text: "#F2A418" },
  English: { bg: "#FFE9E6", text: "#E05A47" },
  Hindi: { bg: "#EAFBF3", text: "#1EAD7A" },
};

export default function SamplePapers({
  actor,
}: { actor: backendInterface | null }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<SamplePaper | null>(null);

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ["papers", !!actor],
    queryFn: () => actor?.getAllSamplePapers() ?? Promise.resolve([]),
    enabled: !!actor,
  });

  const subjects = [
    "All",
    ...Array.from(new Set(papers.map((p) => p.subject))),
  ];
  const filtered =
    filter === "All" ? papers : papers.filter((p) => p.subject === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl text-gray-900">Sample Papers</h1>
        <span className="text-sm text-gray-500">CBSE Class 10</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {subjects.map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((paper) => {
            const color = SUBJECT_COLORS[paper.subject] ?? {
              bg: "#F3F4F6",
              text: "#374151",
            };
            return (
              <div
                key={paper.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: color.bg }}
                >
                  <FileText className="w-5 h-5" style={{ color: color.text }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {paper.title}
                  </h3>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: color.bg, color: color.text }}
                    >
                      {paper.subject}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {Number(paper.year)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {paper.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(paper)}
                  className="mt-auto rounded-xl border-gray-200 hover:border-blue-400 hover:text-blue-600"
                >
                  View Paper
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <dialog
          aria-label={selected.title}
          open
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-xl text-gray-900 mb-1">
                  {selected.title}
                </h2>
                <div className="flex gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={
                      SUBJECT_COLORS[selected.subject]
                        ? {
                            background: SUBJECT_COLORS[selected.subject].bg,
                            color: SUBJECT_COLORS[selected.subject].text,
                          }
                        : {}
                    }
                  >
                    {selected.subject}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {Number(selected.year)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {selected.description}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-700 font-medium mb-1">
                Paper Preview
              </p>
              <p className="text-xs text-blue-600">
                This is a {selected.subject} sample paper for{" "}
                {Number(selected.year)}. In a full version, the actual paper PDF
                would be displayed here.
              </p>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
