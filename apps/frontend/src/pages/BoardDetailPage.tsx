import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMe, PublicUser } from "../api/auth.api";
import { addBoardImage, BoardImage, BoardPost, deleteBoardPost, getBoardPost, updateBoardPost } from "../api/board.api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { formatDateTime } from "../utils/date";

export function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [images, setImages] = useState<BoardImage[]>([]);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });
  const [imageForm, setImageForm] = useState({ fileName: "", imageUrl: "" });

  async function loadPost() {
    if (!id) {
      return;
    }
    const payload = await getBoardPost(id);
    setPost(payload.post);
    setImages(payload.images);
    setEditForm({ title: payload.post.title, content: payload.post.content });
  }

  useEffect(() => {
    void loadPost();
    void getMe().then(setUser).catch(() => setUser(null));
  }, [id]);

  async function onEdit(event: FormEvent) {
    event.preventDefault();
    if (!id) {
      return;
    }
    setPost(await updateBoardPost(id, editForm));
  }

  async function onDelete() {
    if (!id) {
      return;
    }
    await deleteBoardPost(id);
    navigate("/board");
  }

  async function onImageSubmit(event: FormEvent) {
    event.preventDefault();
    if (!id) {
      return;
    }
    const image = await addBoardImage(id, {
      fileName: imageForm.fileName || undefined,
      imageUrl: imageForm.imageUrl || undefined
    });
    setImages((current) => [...current, image]);
    setImageForm({ fileName: "", imageUrl: "" });
  }

  if (!post) {
    return <section className="panel">게시글을 불러오는 중입니다.</section>;
  }

  const isAuthor = user?.id === post.userId;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold text-[#2563EB]">커뮤니티 게시판</p>
          <h1 className="mt-3 text-3xl font-bold">{post.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>작성자 익명</span>
            <span>조회 {post.viewCount}</span>
            <span>작성 {formatDateTime(post.createdAt)}</span>
            <span>수정 {formatDateTime(post.updatedAt)}</span>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-base leading-8 text-slate-700">{post.content}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image) => (
            <div key={image.id} className="border border-slate-200 bg-slate-50 p-3 text-sm" style={{ borderRadius: 8 }}>
              {image.imageUrl ? (
                <img className="mb-2 aspect-video w-full object-cover" src={image.imageUrl} alt="게시글 이미지" style={{ borderRadius: 8 }} />
              ) : null}
              <p className="break-all text-slate-600">{image.s3Key}</p>
            </div>
          ))}
        </div>
      </Card>
      {isAuthor && (
        <aside className="space-y-5">
          <Card className="space-y-4 p-6">
            <form className="space-y-4" onSubmit={onEdit}>
              <h2 className="text-xl font-bold">수정</h2>
              <Input label="제목" onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} value={editForm.title} />
              <Textarea className="min-h-32" label="내용" onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))} value={editForm.content} />
              <div className="flex gap-2">
                <Button type="submit">저장</Button>
                <Button onClick={onDelete} type="button" variant="danger">
                  삭제
                </Button>
              </div>
            </form>
          </Card>
          <Card className="p-6">
            <form className="space-y-4" onSubmit={onImageSubmit}>
              <h2 className="text-xl font-bold">이미지 메타데이터</h2>
              <Input label="파일명" onChange={(event) => setImageForm((current) => ({ ...current, fileName: event.target.value }))} value={imageForm.fileName} />
              <Input label="이미지 URL" onChange={(event) => setImageForm((current) => ({ ...current, imageUrl: event.target.value }))} value={imageForm.imageUrl} />
              <Button type="submit">이미지 추가</Button>
            </form>
          </Card>
        </aside>
      )}
    </div>
  );
}
