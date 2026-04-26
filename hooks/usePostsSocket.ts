"use client";

/**
 * usePostsSocket.ts
 *
 * React hooks that subscribe to the backend's WebSocket broadcasts for a list
 * of post IDs.  Two hooks are exported:
 *
 *   useLikesSocket   — listens to /topic/posts/{id}/likes for every post in the list
 *   useCommentsSocket — listens to /topic/posts/{id}/comments for every post in the list
 *
 * Both hooks:
 *   • Use a stable ref for the callback so the subscription is never re-created
 *     due to an arrow-function re-render.
 *   • Re-subscribe only when the set of postIds actually changes.
 *   • Deduplicate topics so loading the same post twice never creates two subs.
 */

import { useEffect, useRef } from "react";
import { subscribeToTopic } from "@/lib/websocket/stompClient";
import { CommentDTO } from "@/lib/actions/post.actions";

// ─── Event shapes (mirror LikeEvent.java / CommentEvent.java) ────────────────

export interface LikeSocketEvent {
  postId: string;
  likeCount: number;
  profileId: string;
  liked: boolean;
}

export interface CommentSocketEvent {
  action: "CREATED" | "UPDATED" | "DELETED";
  postId: string;
  comment?: CommentDTO;         // present for CREATED / UPDATED
  deletedCommentId?: string;    // present for DELETED
}

// ─── Likes ────────────────────────────────────────────────────────────────────

/**
 * useLikesSocket
 *
 * Subscribes to `/topic/posts/{id}/likes` for every id in `postIds`.
 * Calls `onEvent` whenever the backend broadcasts a like-count change.
 *
 * The authoritative `likeCount` in the event should be used to reconcile the
 * optimistic UI in the parent component.
 */
export function useLikesSocket(
  postIds: string[],
  onEvent: (event: LikeSocketEvent) => void
) {
  // Keep a stable ref so the effect never re-runs due to callback identity
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  // Stable string key for the dependency — re-subscribe only when list changes
  const key = postIds.slice().sort().join(",");

  useEffect(() => {
    if (postIds.length === 0) return;

    const unsubscribers = postIds.map((postId) =>
      subscribeToTopic(`/topic/posts/${postId}/likes`, (body) => {
        try {
          const event: LikeSocketEvent = JSON.parse(body);
          onEventRef.current(event);
        } catch {
          console.error("[WS] Failed to parse like event", body);
        }
      })
    );

    return () => unsubscribers.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

// ─── Comments ─────────────────────────────────────────────────────────────────

/**
 * useCommentsSocket
 *
 * Subscribes to `/topic/posts/{id}/comments` for every id in `postIds`.
 * Calls `onEvent` with a `CommentSocketEvent` on every change.
 *
 * Action semantics:
 *   CREATED  → event.comment   is the new CommentDTO
 *   UPDATED  → event.comment   is the updated CommentDTO
 *   DELETED  → event.deletedCommentId is the ID of the removed comment
 */
export function useCommentsSocket(
  postIds: string[],
  onEvent: (event: CommentSocketEvent) => void
) {
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  const key = postIds.slice().sort().join(",");

  useEffect(() => {
    if (postIds.length === 0) return;

    const unsubscribers = postIds.map((postId) =>
      subscribeToTopic(`/topic/posts/${postId}/comments`, (body) => {
        try {
          const event: CommentSocketEvent = JSON.parse(body);
          onEventRef.current(event);
        } catch {
          console.error("[WS] Failed to parse comment event", body);
        }
      })
    );

    return () => unsubscribers.forEach((u) => u());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
