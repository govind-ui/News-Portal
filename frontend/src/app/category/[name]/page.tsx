'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NewsArticle {
  _id: string;
  title: string;
  content: string;
  featuredImage?: string;
  category: { _id: string; name: string } | string;
  author: { _id: string; name: string } | string;
  isBreaking: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const rawName = params?.name as string || '';
  // Capitalize name for cleaner presentation
  const categoryName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/news`);
        if (res.ok) {
          const data = await res.json();
          // Filter matching category case-insensitively
          const filtered = data.filter((art: NewsArticle) => {
            const catName = typeof art.category === 'object' ? art.category.name : art.category;
            return catName?.toLowerCase() === rawName.toLowerCase();
          });
          setArticles(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (rawName) {
      fetchNews();
    }
  }, [rawName]);

  const getAuthorName = (author: NewsArticle['author']) =>
    typeof author === 'object' ? author.name : author;

  const getCategoryName = (cat: NewsArticle['category']) =>
    typeof cat === 'object' ? cat.name : cat;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Category Header */}
      <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-blue-600 text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-lg">
            Category Coverage
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            {categoryName} News
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Stay updated with the latest releases in {categoryName} globally.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="self-start sm:self-center px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center gap-1.5 hover:bg-slate-50"
        >
          ← Back to Homepage
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse shadow-sm">
              <div className="h-48 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 max-w-2xl mx-auto shadow-sm">
          <p className="text-5xl mb-4">📰</p>
          <h3 className="text-xl font-bold text-slate-800">No Coverage Yet</h3>
          <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
            We haven't uploaded articles under this specific category recently. Please browse other headlines.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/25 hover:shadow-lg"
          >
            Browse News Home
          </Link>
        </div>
      ) : (
        /* Grid list of articles */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article._id}
              className="bg-white rounded-2xl border border-slate-150 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col h-full group"
            >
              {article.featuredImage && (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
                    }}
                  />
                  {article.isBreaking && (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider shadow">
                      🔴 Breaking
                    </span>
                  )}
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-2.5">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">
                    {getCategoryName(article.category)}
                  </span>
                </div>
                
                <Link href={`/news/${article._id}`} className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors mb-3 cursor-pointer">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-xs mb-4 line-clamp-3 font-medium">
                    {article.content}
                  </p>
                </Link>

                <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">
                    By {getAuthorName(article.author)} · {timeAgo(article.createdAt)}
                  </span>
                  <Link
                    href={`/news/${article._id}`}
                    className="text-blue-600 font-extrabold hover:text-blue-800 transition-colors"
                  >
                    Read →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
