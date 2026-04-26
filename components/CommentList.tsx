import { CommentDTO } from "@/lib/actions/post.actions";
import { MessageCircle } from "lucide-react";
import CommentItem from "./CommentItem";

interface CommentsListProps {
  comments: CommentDTO[];
  loggedInProfileId?: string | null;
  commentsLoaded?: boolean;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onReplyComment?: (parentCommentId: string, content: string) => void;
}

const CommentsList = ({
  comments,
  loggedInProfileId,
  commentsLoaded = false,
  onDeleteComment,
  onEditComment,
  onReplyComment,
}: CommentsListProps) => {
  if (commentsLoaded && !comments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <MessageCircle className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-500">No comments yet</p>
        <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts!</p>
      </div>
    );
  }

  if (!comments.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          loggedInProfileId={loggedInProfileId}
          onDelete={onDeleteComment}
          onEdit={onEditComment}
          onReply={onReplyComment}
        />
      ))}
    </div>
  );
};

export default CommentsList;
