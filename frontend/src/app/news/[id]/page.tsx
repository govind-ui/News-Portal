'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface CommentRecord {
  _id?: string;
  user: { _id: string; name: string } | string;
  text: string;
  createdAt: string;
}

interface NewsArticle {
  _id: string;
  title: string;
  content: string;
  featuredImage?: string;
  videoUrl?: string;
  socialUrl?: string;
  category: { _id: string; name: string } | string;
  author: { _id: string; name: string } | string;
  comments: CommentRecord[];
  isBreaking: boolean;
  createdAt: string;
}

export default function DynamicNewsArticle() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string || '';

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment posting states
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  const fetchArticleDetails = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/news/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'News article not found.');
      setArticle(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Database sync failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticleDetails();
    }
  }, [id]);

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Dynamically load scripts for widgets when article details load
  useEffect(() => {
    if (article?.socialUrl) {
      if (article.socialUrl.includes('twitter.com') || article.socialUrl.includes('x.com')) {
        // @ts-ignore
        if (window.twttr && window.twttr.widgets) {
          // @ts-ignore
          window.twttr.widgets.load();
        } else {
          const script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          document.body.appendChild(script);
        }
      }
      if (article.socialUrl.includes('instagram.com')) {
        // @ts-ignore
        if (window.instgrm && window.instgrm.Embeds) {
          // @ts-ignore
          window.instgrm.Embeds.process();
        } else {
          const script = document.createElement('script');
          script.src = 'https://www.instagram.com/embed.js';
          script.async = true;
          document.body.appendChild(script);
        }
      }
    }
  }, [article]);

  // Handle comment submit
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!commentText.trim()) {
      setCommentError('Comment content cannot be empty.');
      return;
    }

    if (!user?.token) {
      setCommentError('You must be signed in to post comments.');
      return;
    }

    setCommentLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/news/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text: commentText.trim() }),
      });

      const updatedCommentsList = await res.json();
      if (!res.ok) throw new Error(updatedCommentsList.message || 'Failed to submit comment.');

      // Success
      setArticle((prev) => prev ? { ...prev, comments: updatedCommentsList } : null);
      setCommentText('');
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Downloading story files...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-5 rounded-2xl shadow-sm mb-6">
          <p className="text-4xl mb-3">⚠️</p>
          <h3 className="text-lg font-bold">Failed to Download Article</h3>
          <p className="text-sm mt-1">{error || 'This article record does not exist.'}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/15"
        >
          ← Back to News Portal
        </button>
      </div>
    );
  }

  const categoryName = typeof article.category === 'object' ? article.category.name : article.category;
  const authorName = typeof article.author === 'object' ? article.author.name : article.author;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Visual Back Button */}
      <button
        onClick={() => router.push('/')}
        className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center gap-2 mb-6 hover:bg-slate-50 bg-white"
      >
        ← Back to Homepage
      </button>

      <article className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
        <header className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {categoryName && (
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                {categoryName}
              </span>
            )}
            {article.isBreaking && (
              <span className="bg-red-50 text-red-600 text-xs font-black uppercase px-2.5 py-1 rounded-lg tracking-wider border border-red-100">
                🚨 Breaking News
              </span>
            )}
            <span className="text-slate-400 text-xs font-medium">
              {new Date(article.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-sm shadow-inner mr-3 flex-shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">{authorName}</p>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Portal Publisher Staff</p>
            </div>
          </div>
        </header>

        {/* Featured image or Video Embed player */}
        {article.featuredImage && (
          <div className="relative aspect-video max-h-[420px] w-full bg-slate-100 border-b border-slate-100 overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80';
              }}
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="p-6 sm:p-8 prose prose-slate max-w-none text-slate-800 font-serif leading-relaxed text-base sm:text-lg break-words whitespace-pre-wrap">
          {article.content}
        </div>

        {/* Embedded Video Panel */}
        {article.videoUrl && (
          <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
              🎥 Video Coverage Available
            </h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
              {article.videoUrl.includes('youtube.com') || article.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${article.videoUrl.split('v=')[1]?.split('&')[0] || article.videoUrl.split('/').pop()}`}
                  title="YouTube video player"
                  className="w-full h-full border-none"
                  allowFullScreen
                />
              ) : (
                <video src={article.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          </div>
        )}

        {/* Embedded Social Media Panel */}
        {article.socialUrl && (
          <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-1.5">
              🔗 Embedded Social Media
            </h3>
            {(article.socialUrl.includes('youtube.com') || article.socialUrl.includes('youtu.be')) ? (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(article.socialUrl)}`}
                  title="YouTube video player"
                  className="w-full h-full border-none"
                  allowFullScreen
                />
              </div>
            ) : (article.socialUrl.includes('twitter.com') || article.socialUrl.includes('x.com')) ? (
              <div className="flex justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <blockquote className="twitter-tweet w-full max-w-[550px]">
                  <a href={article.socialUrl}>Loading Tweet...</a>
                </blockquote>
              </div>
            ) : article.socialUrl.includes('instagram.com') ? (
              <div className="flex justify-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <blockquote className="instagram-media w-full max-w-[540px]" data-instgrm-permalink={article.socialUrl}>
                  <a href={article.socialUrl}>Loading Instagram Post...</a>
                </blockquote>
              </div>
            ) : (
              <div className="p-4 border border-slate-200 rounded-2xl bg-white flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-slate-850">Linked Content</p>
                  <a href={article.socialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all font-semibold">
                    {article.socialUrl}
                  </a>
                </div>
                <span className="text-xl">🔗</span>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Dynamic Comments System */}
      <section className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">
          Discussion Board ({article.comments?.length || 0})
        </h3>

        {/* Comment Posting box */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            {commentError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-semibold mb-3">
                ⚠️ {commentError}
              </div>
            )}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Join the discussion, write your thoughts..."
              className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm text-slate-900 placeholder-slate-400 transition-all resize-none bg-slate-50/30"
              required
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={commentLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm py-2.5 px-6 rounded-xl shadow-md shadow-blue-600/15 transition-all flex items-center gap-2"
              >
                {commentLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  '💬 Post Comment'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl text-center">
            <span className="text-xl">🔒</span>
            <p className="text-xs font-bold text-blue-800 mt-1.5">Want to join the conversation?</p>
            <p className="text-[11px] text-blue-600 mt-0.5">Please log in to post a comment under this article feed.</p>
            <Link
              href="/login"
              className="inline-block mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition-all"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {/* Dynamic Comments List */}
        <div className="space-y-4">
          {!article.comments || article.comments.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-medium">
              💭 No comments posted yet. Be the first to share your perspective!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {article.comments.map((comment) => {
                const commentUser = typeof comment.user === 'object' ? comment.user.name : 'Registered User';
                return (
                  <div key={comment._id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                      {commentUser.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-900">{commentUser}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(comment.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs mt-1.5 leading-relaxed break-words font-medium">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
