import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoardPost, createBoardPost, listBoardPosts } from "../api/board.api";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function BoardListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadPosts() {
    setLoading(true);
    setError("");
    try {
      setPosts(await listBoardPosts());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "게시글 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const post = await createBoardPost(form);
      setForm({ title: "", content: "" });
      navigate(`/board/${post.id}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "게시글 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
      <form className="panel space-y-4 self-start" onSubmit={onSubmit}>
        <div>
          <h1 className="text-xl font-bold text-slate-950">게시글 작성</h1>
          <p className="mt-1 text-sm text-slate-500">제목과 내용만 저장됩니다.</p>
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label>
          <span className="label">제목</span>
          <input className="input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
        </label>
        <label>
          <span className="label">내용</span>
          <textarea className="input min-h-40" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} required />
        </label>
        <button className="btn" type="submit" disabled={saving}>{saving ? "등록 중" : "등록"}</button>
      </form>
      <section className="panel min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">게시판 목록</h2>
            <p className="mt-1 text-sm text-slate-500">전체 {posts.length}개</p>
          </div>
          <button className="btn-secondary" type="button" onClick={() => void loadPosts()} disabled={loading}>
            새로고침
          </button>
        </div>
        <div className="mt-4 overflow-hidden border border-slate-200" style={{ borderRadius: 8 }}>
          <div className="hidden grid-cols-[1fr_96px_132px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 sm:grid">
            <span>제목</span>
            <span className="text-right">조회수</span>
            <span className="text-right">작성일</span>
          </div>
          <div className="divide-y divide-slate-200 bg-white">
            {loading && <p className="px-4 py-8 text-sm text-slate-500">게시글을 불러오는 중입니다.</p>}
            {!loading && posts.length === 0 && <p className="px-4 py-8 text-sm text-slate-500">게시글이 없습니다.</p>}
            {!loading && posts.map((post) => (
              <Link key={post.id} to={`/board/${post.id}`} className="block px-4 py-4 transition hover:bg-slate-50">
                <div className="grid gap-2 sm:grid-cols-[1fr_96px_132px] sm:items-start">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-950">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{post.content}</p>
                  </div>
                  <span className="text-sm text-slate-500 sm:text-right">조회 {post.viewCount}</span>
                  <span className="text-sm text-slate-500 sm:text-right">{formatDate(post.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
