import { useState } from "react";
import { MessageSquare, Reply, User as UserIcon, Send, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Button from "../UI/Button";
import Card from "../UI/Card";
import { cn } from "../../utils/cn";

const CommentItem = ({ comment, allComments, onReply, experienceOwnerId, currentUser }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(true);

  const replies = allComments.filter(c => c.parentId === comment.id);
  const isOwner = comment.userId === experienceOwnerId;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    await onReply(replyContent, comment.id);
    setReplyContent("");
    setIsReplying(false);
    setShowReplies(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
            isOwner ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {comment.user.id === null ? "?" : comment.user.name.charAt(0).toUpperCase()}
          </div>
          {replies.length > 0 && showReplies && (
            <div className="w-px grow bg-border my-2" />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{comment.user.name}</span>
            {isOwner && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Author</span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-lg border border-muted/50">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <Reply size={14} />
              Reply
            </button>
            
            {replies.length > 0 && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </button>
            )}
          </div>

          {isReplying && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <form onSubmit={handleReplySubmit} className="relative">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full min-h-[80px] p-3 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm resize-none pr-12"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={!replyContent.trim()}
                  className="absolute right-3 bottom-3 p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-all"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          )}

          {replies.length > 0 && showReplies && (
            <div className="pt-2 space-y-6 border-l-2 border-muted/30 pl-4 md:pl-8">
              {replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  allComments={allComments}
                  onReply={onReply}
                  experienceOwnerId={experienceOwnerId}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentThread = ({ comments, onAddComment, experienceOwnerId, currentUser }) => {
  const [newComment, setNewComment] = useState("");
  const topLevelComments = comments.filter(c => !c.parentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await onAddComment(newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3 px-2">
        <MessageSquare className="text-primary" size={24} />
        <h2 className="text-2xl font-bold font-outfit">Discussion</h2>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {comments.length}
        </span>
      </div>

      {/* New Comment Input */}
      <Card className="border-none shadow-md overflow-hidden bg-primary/5 border border-primary/10">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
              className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background focus:border-primary focus:ring-0 transition-all outline-none text-sm resize-none pr-14"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </Card>

      {/* Comments List */}
      <div className="space-y-8 px-2">
        {topLevelComments.length > 0 ? (
          topLevelComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              allComments={comments}
              onReply={onAddComment}
              experienceOwnerId={experienceOwnerId}
              currentUser={currentUser}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
            <MessageSquare className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
            <p className="text-muted-foreground font-medium">No comments yet. Be the first to start the discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;
