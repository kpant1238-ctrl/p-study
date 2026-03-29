import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  LogIn,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import { useState } from "react";
import type { ForumPost, backendInterface } from "../backend";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: "#E6F0FF", text: "#1E88E5" },
  Science: { bg: "#E8F7EF", text: "#2EAD63" },
  "Social Science": { bg: "#FFF3E0", text: "#F2A418" },
  English: { bg: "#FFE9E6", text: "#E05A47" },
  Hindi: { bg: "#EAFBF3", text: "#1EAD7A" },
  General: { bg: "#F1E9FF", text: "#7E57C2" },
};

const SUBJECTS = [
  "General",
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Hindi",
];

function timeAgo(ns: bigint) {
  const ms = Number(ns) / 1e6;
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PostCard({
  post,
  actor,
  isLoggedIn,
  onLogin,
}: {
  post: ForumPost;
  actor: backendInterface | null;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");

  const replyMutation = useMutation({
    mutationFn: (body: string) => actor!.addForumReply(post.postId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setReply("");
    },
  });

  const color = SUBJECT_COLORS[post.subject] ?? SUBJECT_COLORS.General;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        className="w-full text-left p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: color.bg, color: color.text }}
              >
                {post.subject}
              </span>
              <span className="text-xs text-gray-400">
                {timeAgo(post.timestamp)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{post.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {post.body}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{post.replies.length}</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div className="pt-4 mb-4 text-sm text-gray-700 leading-relaxed">
            {post.body}
          </div>

          {/* Replies */}
          {post.replies.length > 0 && (
            <div className="space-y-3 mb-4">
              {post.replies.map((r) => (
                <div key={r.replyId} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    {timeAgo(r.timestamp)}
                  </p>
                  <p className="text-sm text-gray-700">{r.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {isLoggedIn ? (
            <div className="flex gap-2">
              <Input
                placeholder="Write a reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  reply.trim() &&
                  replyMutation.mutate(reply.trim())
                }
                className="rounded-xl flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={() =>
                  reply.trim() && replyMutation.mutate(reply.trim())
                }
                disabled={!reply.trim() || replyMutation.isPending}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Login to reply</p>
              <button
                type="button"
                onClick={onLogin}
                className="text-xs text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Forum({
  actor,
  isLoggedIn,
  onLogin,
}: {
  actor: backendInterface | null;
  isLoggedIn: boolean;
  onLogin: () => void;
}) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSubject, setNewSubject] = useState(SUBJECTS[0]);
  const [filter, setFilter] = useState("All");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts", !!actor],
    queryFn: () => actor?.getAllForumPosts() ?? Promise.resolve([]),
    enabled: !!actor,
  });

  const addMutation = useMutation({
    mutationFn: () => actor!.addForumPost(newTitle, newBody, newSubject),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setNewTitle("");
      setNewBody("");
      setShowForm(false);
    },
  });

  const filtered =
    filter === "All" ? posts : posts.filter((p) => p.subject === filter);
  const subjects = ["All", ...SUBJECTS];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-xl text-gray-900">Discussion Forum</h1>
        {isLoggedIn ? (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> New Post
          </Button>
        ) : (
          <Button
            onClick={onLogin}
            variant="outline"
            className="gap-1.5 rounded-xl"
          >
            <LogIn className="w-4 h-4" /> Login to Post
          </Button>
        )}
      </div>

      {/* New post form */}
      {showForm && isLoggedIn && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">
            New Discussion Post
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Post title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rounded-xl"
            />
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUBJECTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Textarea
              placeholder="Describe your doubt or topic for discussion..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => addMutation.mutate()}
                disabled={
                  !newTitle.trim() || !newBody.trim() || addMutation.isPending
                }
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
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

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">
            No posts yet.{" "}
            {isLoggedIn
              ? "Be the first to post!"
              : "Login to start a discussion."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <PostCard
              key={post.postId}
              post={post}
              actor={actor}
              isLoggedIn={isLoggedIn}
              onLogin={onLogin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
