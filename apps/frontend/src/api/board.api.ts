import { apiRequest } from "./client";

export interface BoardPost {
  id: string;
  userId: string;
  authorNickname: string | null;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardImage {
  id: string;
  postId: string;
  s3Key: string;
  imageUrl: string | null;
}

export async function listBoardPosts(): Promise<BoardPost[]> {
  const payload = await apiRequest<{ posts: BoardPost[] }>("/api/board/posts");
  return payload.posts;
}

export async function getBoardPost(id: string): Promise<{ post: BoardPost; images: BoardImage[] }> {
  return apiRequest(`/api/board/posts/${id}`);
}

export async function createBoardPost(input: { title: string; content: string }): Promise<BoardPost> {
  const payload = await apiRequest<{ post: BoardPost }>("/api/board/posts", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload.post;
}

export async function updateBoardPost(id: string, input: { title?: string; content?: string }): Promise<BoardPost> {
  const payload = await apiRequest<{ post: BoardPost }>(`/api/board/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
  return payload.post;
}

export async function deleteBoardPost(id: string): Promise<void> {
  await apiRequest(`/api/board/posts/${id}`, { method: "DELETE" });
}

export async function addBoardImage(id: string, input: { fileName?: string; s3Key?: string; imageUrl?: string }): Promise<BoardImage> {
  const payload = await apiRequest<{ image: BoardImage }>(`/api/board/posts/${id}/images`, {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload.image;
}
