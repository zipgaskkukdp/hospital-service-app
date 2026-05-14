import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BoardPost, createBoardPost, listBoardPosts } from "../api/board.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { PageHeader } from "../components/PageHeader";
import { Textarea } from "../components/Textarea";

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
  const [search, setSearch] = useState("");
  const [writing, setWriting] = useState(false);
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

  const filteredPosts = posts.filter((post) => `${post.title} ${post.content}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <PageHeader description="다른 부모님들과 경험을 공유하고 궁금한 점을 나누어 보세요." title="커뮤니티 게시판" />
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <Input
            className="h-12 sm:w-72"
            icon="search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="게시글 검색..."
            value={search}
          />
          <Button className="h-12 shrink-0" icon="edit" onClick={() => setWriting((current) => !current)}>
            글쓰기
          </Button>
        </div>
      </div>
      {writing && (
        <Card className="mb-6 p-6">
          <form className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto]" onSubmit={onSubmit}>
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-3">{error}</p>}
            <Input
              label="제목"
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="제목을 입력해주세요"
              required
              value={form.title}
            />
            <Textarea
              className="min-h-28"
              label="내용"
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="작성자 실명과 연락처는 남기지 않는 것을 권장합니다."
              required
              value={form.content}
            />
            <div className="flex items-end">
              <Button className="h-12 w-full lg:w-auto" disabled={saving} type="submit">
                {saving ? "등록 중" : "등록"}
              </Button>
            </div>
          </form>
        </Card>
      )}
      {error && !writing && <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_130px_100px_150px] bg-[#F1F5F9] px-6 py-4 text-sm font-semibold text-slate-600 max-lg:grid-cols-[72px_1fr_120px_140px] max-sm:hidden">
          <span>번호</span>
          <span>제목</span>
          <span className="text-center">작성자</span>
          <span className="text-center">조회수</span>
          <span className="text-center">작성일</span>
        </div>
        <div className="divide-y divide-slate-200">
          <div className="grid grid-cols-[80px_1fr_130px_100px_150px] items-center px-6 py-6 text-sm max-lg:grid-cols-[72px_1fr_120px_140px] max-sm:block">
            <span className="inline-flex rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700">공지</span>
            <h2 className="font-bold text-slate-950 max-sm:mt-3">Aicloud 커뮤니티 이용 가이드라인 안내</h2>
            <span className="text-center text-slate-600 max-sm:mt-2 max-sm:block max-sm:text-left">관리자</span>
            <span className="text-center text-slate-600 max-lg:hidden">-</span>
            <span className="whitespace-nowrap text-center text-slate-600 max-sm:mt-1 max-sm:block max-sm:text-left">2024.05.20</span>
          </div>
          {loading && <p className="px-6 py-10 text-sm text-slate-500">게시글을 불러오는 중입니다.</p>}
          {!loading && filteredPosts.length === 0 && (
            <div className="p-6">
              <EmptyState description="검색 조건을 바꾸거나 첫 글을 작성해 주세요." icon="forum" title="게시글이 없습니다" />
            </div>
          )}
          {!loading &&
            filteredPosts.map((post, index) => (
              <Link
                className="grid grid-cols-[80px_1fr_130px_100px_150px] items-center px-6 py-5 transition hover:bg-white max-lg:grid-cols-[72px_1fr_120px_140px] max-sm:block"
                key={post.id}
                to={`/board/${post.id}`}
              >
                <span className="text-slate-500">{posts.length - index}</span>
                <div className="min-w-0 max-sm:mt-2">
                  <h3 className="truncate text-base font-semibold text-slate-950">{post.title}</h3>
                  <p className="mt-1 hidden text-xs text-slate-500 max-sm:block">
                    {post.authorNickname ?? "알 수 없음"} · 조회 {post.viewCount} · {formatDate(post.createdAt)}
                  </p>
                </div>
                <span className="text-center text-slate-600 max-sm:hidden">{post.authorNickname ?? "알 수 없음"}</span>
                <span className="text-center text-slate-600 max-lg:hidden">{post.viewCount}</span>
                <span className="whitespace-nowrap text-center text-slate-600 max-sm:hidden">{formatDate(post.createdAt)}</span>
              </Link>
            ))}
        </div>
      </Card>
      <div className="mt-8 flex justify-center gap-2">
        {["chevron_left", "1", "2", "3", "4", "5", "chevron_right"].map((item) => (
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold ${
              item === "1" ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
            key={item}
            type="button"
          >
            {item.includes("chevron") ? <span className="material-symbols-outlined">{item}</span> : item}
          </button>
        ))}
      </div>
    </div>
  );
}
