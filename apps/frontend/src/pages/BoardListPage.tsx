import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoardPost, createBoardPost, listBoardPosts } from "../api/board.api";

export function BoardListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });

  async function loadPosts() {
    setPosts(await listBoardPosts());
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const post = await createBoardPost(form);
    setForm({ title: "", content: "" });
    navigate(`/board/${post.id}`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <form className="panel space-y-4" onSubmit={onSubmit}>
        <h1 className="text-xl font-bold">게시글 작성</h1>
        <label>
          <span className="label">제목</span>
          <input className="input" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
        </label>
        <label>
          <span className="label">내용</span>
          <textarea className="input min-h-40" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} required />
        </label>
        <button className="btn" type="submit">등록</button>
      </form>
      <section className="panel">
        <h2 className="text-xl font-bold">게시판</h2>
        <div className="mt-4 divide-y divide-slate-200">
          {posts.map((post) => (
            <Link key={post.id} to={`/board/${post.id}`} className="block py-4 hover:bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-950">{post.title}</h3>
                <span className="text-sm text-slate-500">조회 {post.viewCount}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.content}</p>
            </Link>
          ))}
          {posts.length === 0 && <p className="py-6 text-sm text-slate-500">게시글이 없습니다.</p>}
        </div>
      </section>
    </div>
  );
}
