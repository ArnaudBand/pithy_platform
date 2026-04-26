"use client";

import { useState, useCallback } from "react";
import { CommentDTO } from "@/lib/actions/post.actions";
import { Edit2, Trash2, X, Check, CornerDownRight } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// ─── Deterministic avatar colour ─────────────────────────────────────────────
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
function avatarColour(profileId: string) {
  return AVATAR_COLOURS[(profileId?.charCodeAt(0) ?? 0) % AVATAR_COLOURS.length];
}

interface CommentItemProps {
  comment: CommentDTO;
  loggedInProfileId?: string | null;
  onDelete?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onReply?: (parentCommentId: string, content: string) => void;
}

const CommentItem = ({
  comment,
  loggedInProfileId,
  onDelete,
  onEdit,
  onReply,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const displayName = comment.authorName || `Member #${comment.profileId.slice(0, 6)}`;
  const colour = avatarColour(comment.profileId);
  const isOwner = loggedInProfileId === comment.profileId;
  const isLoggedIn = !!loggedInProfileId;
  const wasEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  // ── Edit handlers ─────────────────────────────────────────────────────────
  const handleEditClick = useCallback(() => {
    setEditContent(comment.content);
    setIsEditing(true);
    setIsReplying(false);
  }, [comment.content]);

  const handleEditCancel = useCallback(() => {
    setEditContent(comment.content);
    setIsEditing(false);
  }, [comment.content]);

  const handleEditSave = useCallback(() => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) { setIsEditing(false); return; }
    onEdit?.(comment.id, trimmed);
    setIsEditing(false);
  }, [comment.id, comment.content, editContent, onEdit]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
      if (e.key === "Escape") handleEditCancel();
    },
    [handleEditSave, handleEditCancel],
  );

  // ── Reply handlers ────────────────────────────────────────────────────────
  const handleReplyClick = useCallback(() => {
    setIsReplying(true);
    setIsEditing(false);
    setReplyContent("");
  }, []);

  const handleReplyCancel = useCallback(() => {
    setIsReplying(false);
    setReplyContent("");
  }, []);

  const handleReplySend = useCallback(() => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    onReply?.(comment.id, trimmed);
    setIsReplying(false);
    setReplyContent("");
  }, [comment.id, replyContent, onReply]);

  const handleReplyKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReplySend(); }
      if (e.key === "Escape") handleReplyCancel();
    },
    [handleReplySend, handleReplyCancel],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* ── Main comment ──────────────────────────────────────────────────── */}
      <div className="flex gap-2.5 items-start group">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full shrink-0 ${colour} flex items-center justify-center text-white font-bold text-xs uppercase select-none mt-0.5`}
        >
          {displayName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div className="bg-white rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm border border-gray-100">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {displayName}
              </span>
              <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                {dayjs(comment.createdAt).fromNow()}
                {wasEdited && (
                  <span className="ml-1 text-gray-300 italic">· edited</span>
                )}
              </span>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2 mt-1">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  rows={3}
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleEditCancel}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={!editContent.trim() || editContent.trim() === comment.content}
                    className="flex items-center gap-1 text-xs text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* Action row — appears on hover */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isLoggedIn && onReply && (
                <button
                  onClick={handleReplyClick}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete?.(comment.id)}
                    className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Inline reply input */}
          {isReplying && (
            <div className="mt-2 flex gap-2 items-start">
              {loggedInProfileId && (
                <div
                  className={`w-7 h-7 rounded-full shrink-0 ${avatarColour(loggedInProfileId)} flex items-center justify-center text-white font-bold text-xs select-none`}
                >
                  {loggedInProfileId.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 flex flex-col gap-1.5">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={handleReplyKeyDown}
                  rows={2}
                  autoFocus
                  placeholder={`Reply to ${displayName}…`}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleReplyCancel}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button
                    onClick={handleReplySend}
                    disabled={!replyContent.trim()}
                    className="flex items-center gap-1 text-xs text-white bg-green-500 hover:bg-green-600 disabled:opacity-40 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check className="w-3 h-3" /> Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Nested replies ────────────────────────────────────────────────── */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 flex flex-col gap-2 pl-4 border-l-2 border-gray-100">
          {comment.replies.map((reply) => {
            const replyName = reply.authorName || `Member #${reply.profileId.slice(0, 6)}`;
            const replyColour = avatarColour(reply.profileId);
            const replyEdited = reply.updatedAt && reply.updatedAt !== reply.createdAt;

            return (
              <div key={reply.id} className="flex gap-2 items-start">
                <div
                  className={`w-7 h-7 shrink-0 rounded-full ${replyColour} flex items-center justify-center text-white font-bold text-xs uppercase select-none mt-0.5`}
                >
                  {replyName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 bg-white rounded-2xl rounded-tl-md px-3 py-2 shadow-sm border border-gray-100">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {replyName}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                      {dayjs(reply.createdAt).fromNow()}
                      {replyEdited && (
                        <span className="ml-1 text-gray-300 italic">· edited</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {reply.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
