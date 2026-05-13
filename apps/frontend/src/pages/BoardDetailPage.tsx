import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addBoardImage, BoardImage, BoardPost, deleteBoardPost, getBoardPost, updateBoardPost } from "../api/board.api";

export function BoardDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BoardPost | null>(null);
  const [images, setImages] = useState<BoardImage[]>([]);
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

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <section className="panel space-y-5">
        <div>
          <h1 className="text-xl font-bold">{post.title}</h1>
          <p className="mt-1 text-sm text-slate-500">조회 {post.viewCount}</p>
        </div>
        <p className="whitespace-pre-wrap leading-7 text-slate-700">{post.content}</p>
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
      </section>
      <aside className="space-y-5">
        <form className="panel space-y-3" onSubmit={onEdit}>
          <h2 className="text-lg font-bold">수정</h2>
          <label>
            <span className="label">제목</span>
            <input className="input" value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label>
            <span className="label">내용</span>
            <textarea className="input min-h-32" value={editForm.content} onChange={(event) => setEditForm((current) => ({ ...current, content: event.target.value }))} />
          </label>
          <div className="flex gap-2">
            <button className="btn" type="submit">저장</button>
            <button className="btn-secondary" type="button" onClick={onDelete}>삭제</button>
          </div>
        </form>
        <form className="panel space-y-3" onSubmit={onImageSubmit}>
          <h2 className="text-lg font-bold">이미지 메타데이터</h2>
          <label>
            <span className="label">파일명</span>
            <input className="input" value={imageForm.fileName} onChange={(event) => setImageForm((current) => ({ ...current, fileName: event.target.value }))} />
          </label>
          <label>
            <span className="label">이미지 URL</span>
            <input className="input" value={imageForm.imageUrl} onChange={(event) => setImageForm((current) => ({ ...current, imageUrl: event.target.value }))} />
          </label>
          <button className="btn" type="submit">이미지 추가</button>
        </form>
      </aside>
    </div>
  );
}
