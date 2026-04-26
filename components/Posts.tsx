"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import { getCurrentUser } from "@/lib/actions/auth.actions";
import { getProfile } from "@/lib/actions/profile.actions";
import {
  getAllPosts,
  getComments,
  createComment,
  deleteComment,
  updateComment,
  replyToComment,
  deletePost,
  updatePost,
  toggleLike,
  PostDTO,
  CommentDTO,
} from "@/lib/actions/post.actions";
import PostItem from "./PostItem";
import {
  useLikesSocket,
  useCommentsSocket,
} from "@/hooks/usePostsSocket";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const Loader = () => (
  <div className="space-y-4 flex flex-col mt-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex animate-pulse bg-white shadow rounded-lg p-4 space-x-4 items-start w-full"
      >
        <div className="rounded-full bg-gray-300 h-14 w-14 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/4" />
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
        </div>
      </div>
    ))}
  </div>
);

const NoMorePosts = () => (
  <div className="flex items-center justify-center py-12">
    <p className="text-xl font-semibold text-gray-400">No more posts</p>
  </div>
);

const NoPosts = () => (
  <div className="flex items-center justify-center py-20">
    <p className="text-xl font-semibold text-gray-400">No posts yet</p>
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface PostsProps {
  /** Injected by a sibling CreatePosts component when a new post is published */
  newPost?: PostDTO | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Posts: React.FC<PostsProps> = ({ newPost }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("You");
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [comments, setComments] = useState<Record<string, CommentDTO[]>>({});
  // Tracks which posts have had their full comment list fetched from the server.
  // Kept separate from `comments` state so that WS-injected comments don't
  // accidentally block the initial REST fetch.
  const [loadedCommentPosts, setLoadedCommentPosts] = useState<Set<string>>(
    new Set()
  );
  // Tracks which posts are currently in the middle of a comments fetch.
  const [loadingCommentPosts, setLoadingCommentPosts] = useState<Set<string>>(
    new Set()
  );
  const [likeStatus, setLikeStatus] = useState<
    Record<string, { isLiked: boolean; likeCount: number }>
  >({});
  const [loadingPosts, setLoadingPosts] = useState(true);

  // ── Bootstrap user + profile + initial posts ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;
        setUserId(user.id);

        const profileResult = await getProfile(user.id);
        if (profileResult.success && profileResult.profile) {
          const p = profileResult.profile;
          setProfileId(p.id);
          setCurrentUserName(`${p.firstName} ${p.lastName}`.trim() || "You");
        }

        const postsResult = await getAllPosts();
        if (postsResult.success) {
          const sorted = [...postsResult.posts].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPosts(sorted);

          // Seed like counters from likeCount in the DTO (when the backend
          // starts returning it). isLiked starts as false — there is no REST
          // endpoint to query per-user like status; we rely on the optimistic
          // toggle and the WebSocket broadcast for live updates.
          const initialLikes: Record<
            string,
            { isLiked: boolean; likeCount: number }
          > = {};
          sorted.forEach((p) => {
            initialLikes[p.id] = { isLiked: false, likeCount: p.likeCount ?? 0 };
          });
          setLikeStatus(initialLikes);
        } else {
          toast.error(postsResult.message ?? "Could not load posts.");
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
        toast.error("Could not load posts. Please refresh.");
      } finally {
        setLoadingPosts(false);
      }
    };

    init();
  }, []);

  // ── Prepend newly created post (from sibling CreatePosts component) ──────────
  useEffect(() => {
    if (!newPost) return;
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    setLikeStatus((prev) => ({
      ...prev,
      [newPost.id]: { isLiked: false, likeCount: newPost.likeCount ?? 0 },
    }));
  }, [newPost]);

  // ── Stable list of post IDs for WebSocket subscriptions ─────────────────────
  const postIds = useMemo(() => posts.map((p) => p.id), [posts]);

  // ── Real-time likes via WebSocket ────────────────────────────────────────────
  // The backend broadcasts { postId, likeCount, profileId, liked } whenever any
  // user toggles a like.  We use the authoritative likeCount from the event to
  // reconcile our optimistic update, and update isLiked only for the current user.
  useLikesSocket(postIds, useCallback((event) => {
    setLikeStatus((prev) => {
      const current = prev[event.postId] ?? { isLiked: false, likeCount: 0 };
      return {
        ...prev,
        [event.postId]: {
          // authoritative count from the backend
          likeCount: event.likeCount,
          // only flip isLiked for the current user's own action
          isLiked:
            event.profileId === profileId
              ? event.liked
              : current.isLiked,
        },
      };
    });
  }, [profileId]));

  // ── Real-time comments via WebSocket ─────────────────────────────────────────
  // The backend broadcasts CREATED / UPDATED / DELETED events for every comment
  // action.  We deduplicate CREATED events to avoid double-adding comments that
  // were already appended optimistically via the REST call.
  useCommentsSocket(postIds, useCallback((event) => {
    setComments((prev) => {
      const current = prev[event.postId] ?? [];

      if (event.action === "CREATED" && event.comment) {
        const c = event.comment;

        if (c.parentComment) {
          // ── Reply: nest inside the parent comment's replies array ──────────
          return {
            ...prev,
            [event.postId]: current.map((top) => {
              if (top.id !== c.parentComment) return top;
              const replies = top.replies ?? [];
              // deduplicate
              if (replies.some((r) => r.id === c.id)) return top;
              return { ...top, replies: [...replies, c] };
            }),
          };
        }

        // ── Top-level comment ────────────────────────────────────────────────
        if (current.some((t) => t.id === c.id)) return prev;
        return { ...prev, [event.postId]: [...current, c] };
      }

      if (event.action === "UPDATED" && event.comment) {
        const updated = event.comment;
        return {
          ...prev,
          [event.postId]: current.map((c) => {
            if (c.id === updated.id) return updated;
            // also check inside replies
            if (c.replies?.some((r) => r.id === updated.id)) {
              return {
                ...c,
                replies: c.replies.map((r) => (r.id === updated.id ? updated : r)),
              };
            }
            return c;
          }),
        };
      }

      if (event.action === "DELETED" && event.deletedCommentId) {
        const id = event.deletedCommentId;
        return {
          ...prev,
          [event.postId]: current
            .filter((c) => c.id !== id)
            .map((c) =>
              c.replies?.length
                ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
                : c
            ),
        };
      }

      return prev;
    });

    // Keep the PostDTO commentCount in sync so the button count stays accurate
    // even before the user expands comments for the first time.
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== event.postId) return p;
        const delta =
          event.action === "CREATED" ? 1 :
          event.action === "DELETED" ? -1 : 0;
        return { ...p, commentCount: Math.max(0, (p.commentCount ?? 0) + delta) };
      })
    );
  }, []));

  // ── Action handlers ───────────────────────────────────────────────────────────

  const handleLoadComments = useCallback(
    async (postId: string) => {
      // Guard by the dedicated Set, not by `comments[postId]`, so that comments
      // added via WS before the user first opens the panel don't block the fetch.
      if (loadedCommentPosts.has(postId)) return;

      setLoadingCommentPosts((prev) => new Set([...prev, postId]));
      try {
        const result = await getComments(postId);
        if (result.success) {
          setComments((prev) => ({ ...prev, [postId]: result.comments }));
          // Mark as loaded *after* the fetch so the count and empty-state only
          // flip once we actually have data (prevents the "0 / No comments yet"
          // flash during the async gap and hides the empty-state while loading).
          setLoadedCommentPosts((prev) => new Set([...prev, postId]));
        } else {
          toast.error(result.message ?? "Could not load comments.");
        }
      } finally {
        setLoadingCommentPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }
    },
    [loadedCommentPosts]
  );

  const handleAddComment = useCallback(
    async (postId: string, content: string) => {
      if (!profileId) return;
      const result = await createComment(postId, profileId, content);
      if (!result.success) {
        toast.error(result.message ?? "Failed to post comment.");
      }
      // No optimistic add here.  The backend broadcasts a WS CREATED event
      // almost immediately after the REST call succeeds — adding here as well
      // caused a race condition where the WS event arrived before the REST
      // response, resulting in two copies of the same comment appearing.
      // The WS handler in useCommentsSocket is the single source of truth.
    },
    [profileId]
  );

  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      if (!profileId) return;
      const result = await deleteComment(postId, commentId, profileId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to delete comment.");
      }
      // The WS DELETED event removes it from the list automatically.
    },
    [profileId]
  );

  const handleEditComment = useCallback(
    async (postId: string, commentId: string, content: string) => {
      if (!profileId) return;
      const result = await updateComment(postId, commentId, profileId, content);
      if (!result.success) {
        toast.error(result.message ?? "Failed to update comment.");
      }
      // The WS UPDATED event refreshes the comment in the list automatically.
    },
    [profileId]
  );

  const handleReplyComment = useCallback(
    async (postId: string, parentCommentId: string, content: string) => {
      if (!profileId) return;
      const result = await replyToComment(postId, parentCommentId, profileId, content);
      if (!result.success) {
        toast.error(result.message ?? "Failed to post reply.");
      }
      // The WS CREATED event (with parentComment set) will nest the reply
      // under the correct parent automatically via useCommentsSocket.
    },
    [profileId]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      if (!userId) return;
      const result = await deletePost(postId, userId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        toast.success("Post deleted.");
      } else {
        toast.error(result.message ?? "Failed to delete post.");
      }
    },
    [userId]
  );

  const handleUpdate = useCallback(
    async (postId: string, title: string, content: string) => {
      if (!userId) return;
      const result = await updatePost(postId, userId, { title, content });
      if (result.success && result.post) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? result.post! : p))
        );
        toast.success("Post updated.");
      } else {
        toast.error(result.message ?? "Failed to update post.");
      }
    },
    [userId]
  );

  const handleLike = useCallback(
    async (postId: string) => {
      if (!profileId) return;
      const current = likeStatus[postId] ?? { isLiked: false, likeCount: 0 };
      const newLiked = !current.isLiked;

      // Optimistic update — will be reconciled by the WS broadcast
      setLikeStatus((prev) => ({
        ...prev,
        [postId]: {
          isLiked: newLiked,
          likeCount: newLiked
            ? current.likeCount + 1
            : Math.max(current.likeCount - 1, 0),
        },
      }));

      const result = await toggleLike(postId, profileId, newLiked);
      if (!result.success) {
        // REST call failed — revert before the WS event arrives
        setLikeStatus((prev) => ({ ...prev, [postId]: current }));
        toast.error(result.message ?? "Failed to toggle like.");
      }
      // On success, the WS broadcast from LikeService will arrive via
      // useLikesSocket and set the authoritative likeCount automatically.
    },
    [profileId, likeStatus]
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loadingPosts) return <Loader />;
  if (posts.length === 0) return <NoPosts />;

  return (
    <div className="flex flex-col gap-4 text-black">
      <Toaster />
      <InfiniteScroll
        dataLength={posts.length}
        next={() => {}}
        hasMore={false}
        loader={<Loader />}
        endMessage={<NoMorePosts />}
      >
        <div className="flex flex-col space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              authorName={
                post.authorName ||
                (post.profileId === profileId ? currentUserName : "Unknown")
              }
              loggedInProfileId={profileId}
              likeStatus={
                likeStatus[post.id] ?? { isLiked: false, likeCount: 0 }
              }
              comments={comments[post.id] ?? []}
              commentsLoaded={loadedCommentPosts.has(post.id)}
              commentsLoading={loadingCommentPosts.has(post.id)}
              onLike={handleLike}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onEditComment={handleEditComment}
              onReplyComment={handleReplyComment}
              onLoadComments={handleLoadComments}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Posts;
