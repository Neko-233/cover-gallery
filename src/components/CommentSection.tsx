'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';
import Avatar from '@/components/Avatar';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies?: Comment[];
}

const EMPTY_COMMENTS: Comment[] = [];

interface CommentSectionProps {
  targetId: string;
  type: 'collection' | 'user';
  initialComments?: Comment[];
  title?: string;
}

// Recursive Comment Item Component
const CommentItem = ({ 
  comment, 
  depth = 0, 
  session, 
  onReply, 
  replyToId, 
  replyContent, 
  setReplyContent, 
  handleReplySubmit, 
  submittingReply,
  setReplyToId,
  parentAuthor
}: { 
  comment: Comment; 
  depth?: number; 
  session: any;
  onReply: (id: string) => void;
  replyToId: string | null;
  replyContent: string;
  setReplyContent: (v: string) => void;
  handleReplySubmit: (e: React.FormEvent, parentId: string) => void;
  submittingReply: boolean;
  setReplyToId: (id: string | null) => void;
  parentAuthor?: { name: string | null };
}) => {
  const showReplyIndicator = depth > 2;

  return (
    <div className={`group ${depth > 0 ? 'mt-4' : ''}`}>
      <div className="flex gap-3">
        <div className="shrink-0">
          <Link href={`/user/${comment.user.id}`}>
            <Avatar src={comment.user.image} name={comment.user.name} size={depth === 0 ? 40 : 28} />
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-zinc-900 dark:text-zinc-100 ${depth === 0 ? '' : 'text-sm'}`}>
              {comment.user.name || 'Unknown'}
            </span>
            {showReplyIndicator && parentAuthor && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <span className="text-zinc-300 dark:text-zinc-600">▸</span>
                <span>@{parentAuthor.name}</span>
              </span>
            )}
            <span className="text-xs text-zinc-500" suppressHydrationWarning>
              {new Date(comment.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </span>
          </div>
          <p className={`text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2 ${depth === 0 ? '' : 'text-sm'}`}>
            {comment.content}
          </p>
          
          {/* Reply Button */}
          <button
            onClick={() => onReply(comment.id)}
            className="text-xs font-medium text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            回复
          </button>

          {/* Reply Form */}
          {replyToId === comment.id && (
            <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="shrink-0 hidden sm:block">
                <Avatar src={session?.user?.image} name={session?.user?.name} size={32} />
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`回复 @${comment.user.name}...`}
                  className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:outline-none min-h-[80px] resize-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setReplyToId(null)}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply || !replyContent.trim()}
                    className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {submittingReply ? '发送中...' : '回复'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className={`
              ${depth < 2 ? 'pl-4 border-l-2 border-zinc-100 dark:border-zinc-800' : '-ml-[40px]'}
              ${depth >= 2 ? 'mt-2' : 'mt-4'}
            `}>
              {comment.replies.map((reply) => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  depth={depth + 1}
                  session={session}
                  onReply={onReply}
                  replyToId={replyToId}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleReplySubmit={handleReplySubmit}
                  submittingReply={submittingReply}
                  setReplyToId={setReplyToId}
                  parentAuthor={comment.user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CommentSection({ targetId, type, initialComments = EMPTY_COMMENTS, title }: CommentSectionProps) {
  const { data: session } = useSession();
  const [flatComments, setFlatComments] = useState<Comment[]>(initialComments);
  const prevInitialComments = useRef(initialComments);

  useEffect(() => {
    // Check if initialComments actually changed by content to prevent infinite loop
    const hasChanged = initialComments.length !== prevInitialComments.current.length || 
                       initialComments.some((c, i) => c.id !== prevInitialComments.current[i]?.id);
    
    if (hasChanged) {
      prevInitialComments.current = initialComments;
      setFlatComments(initialComments);
    }
  }, [initialComments]);

  // Build Tree
  const rootComments = useMemo(() => {
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    // Initialize map with shallow copies to avoid mutation issues if props change
    flatComments.forEach(c => {
      map.set(c.id, { ...c, replies: [] });
    });

    // Link
    flatComments.forEach(c => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies!.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort roots: Newest first
    roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Sort replies: Oldest first (chronological) - though API already returns sorted by ASC,
    // but just in case we mixed them
    const sortReplies = (nodes: Comment[]) => {
      nodes.forEach(node => {
        if (node.replies && node.replies.length > 0) {
          node.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          sortReplies(node.replies);
        }
      });
    };
    sortReplies(roots);

    return roots;
  }, [flatComments]);

  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getApiUrl = () => {
    return type === 'collection' 
      ? `/api/collections/${targetId}/comments`
      : `/api/users/${targetId}/comments`;
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!res.ok) throw new Error('Failed to comment');

      const newComment = await res.json();
      setFlatComments(prev => [...prev, newComment]);
      setCommentContent('');
      showToastMessage('评论发布成功');
    } catch (e) {
      console.error(e);
      showToastMessage('发布失败', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!session) return;
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (!res.ok) throw new Error('Failed to reply');

      const newReply = await res.json();
      setFlatComments(prev => [...prev, newReply]);
      setReplyContent('');
      setReplyToId(null);
      showToastMessage('回复成功');
    } catch (e) {
      console.error(e);
      showToastMessage('回复失败', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const onReply = (id: string) => {
    if (!session) {
      showToastMessage('请先登录', 'error');
      return;
    }
    setReplyToId(replyToId === id ? null : id);
    setReplyContent('');
  };

  return (
    <div id="comments" className="max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white text-sm z-50 animate-in slide-in-from-bottom-2 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        {title ? `${title} (${rootComments.length})` : `评论 (${rootComments.length})`}
      </h2>

      {session ? (
        <form onSubmit={handleComment} className="mb-10 flex gap-4">
          <div className="shrink-0">
            <Avatar src={session.user?.image} name={session.user?.name} size={40} />
          </div>
          <div className="flex-1">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:outline-none min-h-[100px] resize-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submittingComment || !commentContent.trim()}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? '发送中...' : '发表评论'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">登录后参与讨论</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-sm font-medium hover:opacity-90"
          >
            去登录
          </Link>
        </div>
      )}

      <div className="space-y-8">
        {rootComments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            session={session}
            onReply={onReply}
            replyToId={replyToId}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleReplySubmit={handleReplySubmit}
            submittingReply={submittingReply}
            setReplyToId={setReplyToId}
          />
        ))}
      </div>
    </div>
  );
}
