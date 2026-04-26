"use client";

import React, { useState, useCallback, memo, useRef } from "react";
import {
  ThumbsUp,
  MessageCircleMore,
  Share2,
  Trash2,
  FilePenLine,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Video } from "./Video";
import { PostDTO, CommentDTO } from "@/lib/actions/post.actions";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CommentsList from "./CommentList";

dayjs.extend(relativeTime);

// ─── Avatar colour helper (consistent with CommentItem) ──────────────────────
const AVATAR_COLOURS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];
function avatarColour(id: string) {
  return AVATAR_COLOURS[(id?.charCodeAt(0) ?? 0) % AVATAR_COLOURS.length];
}

interface PostItemProps {
  post: PostDTO;
  authorName: string;
  loggedInProfileId: string | null;
  likeStatus: { isLiked: boolean; likeCount: number };
  comments: CommentDTO[];
  commentsLoaded: boolean;
  commentsLoading: boolean;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onUpdate: (postId: string, title: string, content: string) => void;
  onAddComment: (postId: string, comment: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onReplyComment: (postId: string, parentCommentId: string, content: string) => void;
  onLoadComments: (postId: string) => void;
}

// ─── PostContent ──────────────────────────────────────────────────────────────
const PostContent = memo(
  ({
    postId,
    title,
    content,
    imageUrls,
    videoUrls,
    isExpanded,
    onToggleExpand,
  }: {
    postId: string;
    title: string;
    content?: string;
    imageUrls?: string[];
    videoUrls?: string[];
    isExpanded: boolean;
    onToggleExpand: () => void;
  }) => {
    const truncated =
      content && content.length > 180 ? content.slice(0, 180) + "…" : content;

    const hasImages = imageUrls && imageUrls.length > 0;
    const hasVideos = videoUrls && videoUrls.length > 0;

    return (
      <div className="flex flex-col gap-3">
        {title && (
          <h3 className="font-semibold text-gray-900 text-base leading-snug">
            {title}
          </h3>
        )}
        {content && (
          <div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {isExpanded ? content : truncated}
            </p>
            {content.length > 180 && (
              <button
                onClick={onToggleExpand}
                className="mt-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Images — plain <img> to avoid Next.js domain restrictions */}
        {hasImages && (
          <div className={`grid gap-2 ${imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {imageUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Post image ${i + 1}`}
                className={`w-full rounded-xl object-cover ${
                  imageUrls.length === 1 ? "max-h-96" : "max-h-52"
                }`}
              />
            ))}
          </div>
        )}

        {/* Videos */}
        {hasVideos &&
          videoUrls.map((url, i) => (
            <Video
              key={i}
              src={url}
              controls
              width="800"
              height="400"
              className="w-full rounded-xl max-h-80"
              moduleId={postId}
              onComplete={() => {}}
            />
          ))}
      </div>
    );
  },
);
PostContent.displayName = "PostContent";

// ─── Main PostItem ─────────────────────────────────────────────────────────────
const PostItem: React.FC<PostItemProps> = ({
  post,
  authorName,
  loggedInProfileId,
  likeStatus,
  comments,
  commentsLoaded,
  commentsLoading,
  onLike,
  onDelete,
  onUpdate,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onReplyComment,
  onLoadComments,
}) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const loadRequestedRef = useRef(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const isOwner = loggedInProfileId === post.profileId;
  const colour = avatarColour(post.profileId ?? "");
  const displayName = authorName || "Anonymous";
  const initials = displayName.charAt(0).toUpperCase();

  const handleToggleExpand = useCallback(() => setIsExpanded((p) => !p), []);

  const handleToggleComments = useCallback(() => {
    if (!loadRequestedRef.current) {
      loadRequestedRef.current = true;
      onLoadComments(post.id);
    }
    setShowComments((p) => !p);
  }, [onLoadComments, post.id]);

  const handleLike = useCallback(() => onLike(post.id), [post.id, onLike]);

  const handleDelete = useCallback(() => {
    onDelete(post.id);
    setShowOptions(false);
  }, [post.id, onDelete]);

  const handleEditClick = useCallback(() => {
    setEditingPostId(post.id);
    setEditedTitle(post.title || "");
    setEditedContent(post.content || "");
    setShowOptions(false);
  }, [post.id, post.title, post.content]);

  const handleUpdate = useCallback(() => {
    if (editingPostId) {
      onUpdate(editingPostId, editedTitle, editedContent);
      setEditingPostId(null);
    }
  }, [editingPostId, editedTitle, editedContent, onUpdate]);

  const handleAddComment = useCallback(() => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment("");
    }
  }, [post.id, newComment, onAddComment]);

  const commentCount = commentsLoaded ? comments.length : (post.commentCount ?? 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${colour} flex items-center justify-center text-white font-bold text-sm select-none shrink-0`}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setShowOptions((p) => !p)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            {showOptions && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FilePenLine size={15} className="text-gray-400" />
                  Edit post
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Post content ────────────────────────────────────────────────── */}
      <div className="px-5 pb-4">
        {editingPostId === post.id ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Post title"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingPostId(null)}
                className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!editedTitle.trim()}
                className="px-4 py-1.5 text-sm text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 rounded-lg transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <PostContent
            postId={post.id}
            title={post.title}
            content={post.content}
            imageUrls={post.imageUrls}
            videoUrls={post.videoUrls}
            isExpanded={isExpanded}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      {(likeStatus.likeCount > 0 || commentCount > 0) && (
        <div className="flex items-center justify-between px-5 py-2 border-t border-gray-50">
          {likeStatus.likeCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <ThumbsUp size={11} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-gray-500">{likeStatus.likeCount}</span>
            </div>
          ) : (
            <div />
          )}
          {commentCount > 0 && (
            <button
              onClick={handleToggleComments}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      {/* ── Action bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center border-t border-gray-100 px-2 py-1">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            likeStatus.isLiked
              ? "text-green-600 bg-green-50"
              : "text-gray-500 hover:text-green-600 hover:bg-green-50"
          }`}
        >
          <ThumbsUp size={17} strokeWidth={likeStatus.isLiked ? 2.5 : 1.8} />
          Like
        </button>
        <button
          onClick={handleToggleComments}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            showComments
              ? "text-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          <MessageCircleMore size={17} strokeWidth={1.8} />
          Comment
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-colors">
          <Share2 size={17} strokeWidth={1.8} />
          Share
        </button>
      </div>

      {/* ── Comments section ────────────────────────────────────────────── */}
      {showComments && (
        <div className="border-t border-gray-100 px-5 pt-4 pb-5 flex flex-col gap-4 bg-gray-50/40">
          {/* Comment input */}
          <div className="flex items-center gap-2">
            {loggedInProfileId && (
              <div
                className={`w-8 h-8 rounded-full shrink-0 ${avatarColour(loggedInProfileId)} flex items-center justify-center text-white font-bold text-xs select-none`}
              >
                {loggedInProfileId.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Write a comment…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="text-green-500 hover:text-green-600 disabled:opacity-30 transition-colors shrink-0"
              >
                <Send size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Comment list */}
          {commentsLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
            </div>
          ) : (
            <CommentsList
              comments={comments}
              loggedInProfileId={loggedInProfileId}
              commentsLoaded={commentsLoaded}
              onDeleteComment={(commentId) => onDeleteComment(post.id, commentId)}
              onEditComment={(commentId, content) => onEditComment(post.id, commentId, content)}
              onReplyComment={(parentCommentId, content) => onReplyComment(post.id, parentCommentId, content)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default memo(PostItem);
