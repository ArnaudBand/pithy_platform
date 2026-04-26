"use server";

/**
 * post.actions.ts
 *
 * Server actions for posts, comments, and likes — backed by the Java Spring Boot API.
 *
 *  POST   /api/posts                                    → create post (multipart)
 *  PUT    /api/posts/{postId}                           → update post (multipart)
 *  GET    /api/posts                                    → list all posts (authenticated users with profile)
 *  GET    /api/posts/user/{userId}                      → list user's own posts
 *  GET    /api/posts/{postId}                           → get single post
 *  DELETE /api/posts/{postId}?userId=                   → delete post
 *
 *  GET    /api/posts/{postId}/comments                  → list comments
 *  POST   /api/posts/{postId}/comments                  → create comment
 *  PUT    /api/posts/{postId}/comments/{commentId}      → update comment
 *  DELETE /api/posts/{postId}/comments/{commentId}      → delete comment
 *  POST   /api/posts/{postId}/comments/{parentId}/reply → reply to comment
 *
 *  POST   /api/posts/{postId}/likes/toggle              → toggle like
 */

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPostFormData,
  apiPutFormData,
} from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PostDTO {
  id: string;
  title: string;
  content?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  profileId: string;
  /** Resolved from the author's profile (firstName + lastName) */
  authorName?: string;
  likeCount?: number;     // persisted in DB, now returned by backend
  commentCount?: number;  // derived from comments list size, now returned by backend
  createdAt: string;
  updatedAt?: string;
}

export interface CommentDTO {
  id: string;
  content: string;
  postId: string;
  profileId: string;
  authorName: string;   // first name (+ last name) resolved on the backend
  createdAt: string;
  updatedAt?: string;
  likes: number;
  parentComment?: string;
  replies?: CommentDTO[];
}

export interface LikeDTO {
  id: string;
  profileId: string;
  postId: string;
  liked: boolean;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a base64 data-URL (data:<mime>;base64,<data>) to a Blob so it can be
 * appended to a FormData for multipart upload to the Java backend.
 */
function base64ToBlob(dataUrl: string): { blob: Blob; filename: string } {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const ext = mime.split("/")[1] ?? "bin";
  const buffer = Buffer.from(b64, "base64");
  return { blob: new Blob([buffer], { type: mime }), filename: `file.${ext}` };
}

// ─── Post Actions ─────────────────────────────────────────────────────────────

/**
 * createPost
 * POST /api/posts  (multipart/form-data — Spring @RequestParam)
 */
export async function createPost(
  userId: string,
  data: {
    title: string;
    content?: string;
    imageBase64?: string;
    videoBase64?: string;
  }
) {
  try {
    const form = new FormData();
    form.append("userId", userId);
    form.append("title", data.title);
    if (data.content?.trim()) form.append("content", data.content);

    if (data.imageBase64) {
      const { blob, filename } = base64ToBlob(data.imageBase64);
      form.append("images", blob, filename);
    }
    if (data.videoBase64) {
      const { blob, filename } = base64ToBlob(data.videoBase64);
      form.append("videos", blob, filename);
    }

    const post = await apiPostFormData<PostDTO>("/api/posts", form);
    return { success: true, post };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create post";
    return { success: false, message };
  }
}

/**
 * updatePost
 * PUT /api/posts/{postId}  (multipart/form-data — Spring @RequestParam)
 */
export async function updatePost(
  postId: string,
  userId: string,
  data: {
    title: string;
    content?: string;
    imageBase64?: string;
    videoBase64?: string;
    existingImages?: string[];
    existingVideos?: string[];
  }
) {
  try {
    const form = new FormData();
    form.append("userId", userId);
    form.append("title", data.title);
    if (data.content?.trim()) form.append("content", data.content);

    data.existingImages?.forEach((url) => form.append("existingImages", url));
    data.existingVideos?.forEach((url) => form.append("existingVideos", url));

    if (data.imageBase64) {
      const { blob, filename } = base64ToBlob(data.imageBase64);
      form.append("images", blob, filename);
    }
    if (data.videoBase64) {
      const { blob, filename } = base64ToBlob(data.videoBase64);
      form.append("videos", blob, filename);
    }

    const post = await apiPutFormData<PostDTO>(`/api/posts/${postId}`, form);
    return { success: true, post };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update post";
    return { success: false, message };
  }
}

/**
 * getAllPosts
 * GET /api/posts
 *
 * Returns all posts from every user, newest first.
 * Requires the caller to be authenticated (has a valid JWT).
 * The backend resolves each post's authorName from the author's profile.
 */
export async function getAllPosts() {
  try {
    const posts = await apiGet<PostDTO[]>("/api/posts");
    return { success: true, posts };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load posts";
    return { success: false, message, posts: [] as PostDTO[] };
  }
}

/**
 * getPostsByUser
 * GET /api/posts/user/{userId}
 */
export async function getPostsByUser(userId: string) {
  try {
    const posts = await apiGet<PostDTO[]>(`/api/posts/user/${userId}`);
    return { success: true, posts };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load posts";
    return { success: false, message, posts: [] as PostDTO[] };
  }
}

/**
 * getPostById
 * GET /api/posts/{postId}
 */
export async function getPostById(postId: string) {
  try {
    const post = await apiGet<PostDTO>(`/api/posts/${postId}`);
    return { success: true, post };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Post not found";
    return { success: false, message };
  }
}

/**
 * deletePost
 * DELETE /api/posts/{postId}?userId={userId}
 */
export async function deletePost(postId: string, userId: string) {
  try {
    await apiDelete(
      `/api/posts/${postId}?userId=${encodeURIComponent(userId)}`
    );
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete post";
    return { success: false, message };
  }
}

// ─── Comment Actions ──────────────────────────────────────────────────────────

/**
 * getComments
 * GET /api/posts/{postId}/comments
 */
export async function getComments(postId: string) {
  try {
    const comments = await apiGet<CommentDTO[]>(
      `/api/posts/${postId}/comments`
    );
    return { success: true, comments };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load comments";
    return { success: false, message, comments: [] as CommentDTO[] };
  }
}

/**
 * createComment
 * POST /api/posts/{postId}/comments
 * Body: { profileId, content }
 */
export async function createComment(
  postId: string,
  profileId: string,
  content: string
) {
  try {
    const comment = await apiPost<CommentDTO>(
      `/api/posts/${postId}/comments`,
      { profileId, content }
    );
    return { success: true, comment };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post comment";
    return { success: false, message };
  }
}

/**
 * updateComment
 * PUT /api/posts/{postId}/comments/{commentId}
 * Body: { profileId, content }
 */
export async function updateComment(
  postId: string,
  commentId: string,
  profileId: string,
  content: string
) {
  try {
    const comment = await apiPut<CommentDTO>(
      `/api/posts/${postId}/comments/${commentId}`,
      { profileId, content }
    );
    return { success: true, comment };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update comment";
    return { success: false, message };
  }
}

/**
 * deleteComment
 * DELETE /api/posts/{postId}/comments/{commentId}?profileId={profileId}
 *
 * profileId is sent as a query param (not body) because HTTP DELETE with a
 * body is non-standard and the backend now uses @RequestParam for ownership
 * verification.
 */
export async function deleteComment(
  postId: string,
  commentId: string,
  profileId: string
) {
  try {
    await apiDelete(
      `/api/posts/${postId}/comments/${commentId}?profileId=${encodeURIComponent(profileId)}`
    );
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete comment";
    return { success: false, message };
  }
}

/**
 * replyToComment
 * POST /api/posts/{postId}/comments/{parentCommentId}/reply
 * Body: { profileId, content }
 */
export async function replyToComment(
  postId: string,
  parentCommentId: string,
  profileId: string,
  content: string
) {
  try {
    const comment = await apiPost<CommentDTO>(
      `/api/posts/${postId}/comments/${parentCommentId}/reply`,
      { profileId, content }
    );
    return { success: true, comment };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post reply";
    return { success: false, message };
  }
}

// ─── Like Actions ─────────────────────────────────────────────────────────────

/**
 * toggleLike
 * POST /api/posts/{postId}/likes/toggle
 * Body: { profileId, liked }
 *
 * The backend returns 200 with an empty body (ResponseEntity<Void>).
 * We use apiPost<void> and rely on the optimistic UI in Posts.tsx for the
 * like count — the backend also broadcasts the new count over WebSocket to
 * /topic/posts/{postId}/likes for future real-time integration.
 */
export async function toggleLike(
  postId: string,
  profileId: string,
  liked: boolean
) {
  try {
    await apiPost<void>(
      `/api/posts/${postId}/likes/toggle`,
      { profileId, liked }
    );
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle like";
    return { success: false, message };
  }
}
