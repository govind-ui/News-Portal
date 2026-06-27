'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Stats {
  totalNews: number;
  totalUsers: number;
  totalCategories: number;
  totalComments: number;
}

interface NewsArticle {
  _id: string;
  title: string;
  category: { _id: string; name: string } | string;
  author: { _id: string; name: string } | string;
  status: string;
  createdAt: string;
}

export default function AdminOverview() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<Stats>({
    totalNews: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalComments: 0,
  });
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.token) return;

    const fetchDashboardData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Parallel fetching
        const [statsRes, newsRes] = await Promise.all([
          fetch(`${API_URL}/news/dashboard/stats`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${API_URL}/news`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        if (!statsRes.ok || !newsRes.ok) {
          throw new Error('Failed to retrieve full dashboard analytics.');
        }

        const statsData = await statsRes.json();
        const newsData = await newsRes.json();

        setStats(statsData);
        setRecentNews(newsData.slice(0, 8)); // Grab most recent 8 articles
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Database sync failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleDeleteArticle = async (id: string, titleStr: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete the news article titled "${titleStr}"?`)) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/news/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete news article.');

      // Optimistic state refresh
      setRecentNews((prev) => prev.filter((art) => art._id !== id));
      setStats((prev) => ({
        ...prev,
        totalNews: Math.max(0, prev.totalNews - 1),
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deletion failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-semibold">Generating dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const getCategoryName = (cat: NewsArticle['category']) =>
    typeof cat === 'object' ? cat.name : cat;

  const getAuthorName = (author: NewsArticle['author']) =>
    typeof author === 'object' ? author.name : author;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time platform activity metrics, users, and content analytics.</p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total News */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Articles</p>
            <p className="text-3xl font-black text-slate-900">{stats.totalNews}</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-extrabold text-lg">
            📰
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Accounts</p>
            <p className="text-3xl font-black text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-extrabold text-lg">
            👥
          </div>
        </div>

        {/* Total Comments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Comments</p>
            <p className="text-3xl font-black text-slate-900">{stats.totalComments}</p>
          </div>
          <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-extrabold text-lg">
            💬
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Categories</p>
            <p className="text-3xl font-black text-slate-900">{stats.totalCategories}</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-extrabold text-lg">
            🏷️
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recent Content Updates</h2>
            <p className="text-xs text-slate-500 mt-0.5">List of last articles uploaded to the database feed.</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200"
          >
            Go to Portal →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentNews.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-semibold text-sm">
              🚀 No articles posted yet. Hit "Post Article" to launch your first release!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Article Headline</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Publisher</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {recentNews.map((article) => {
                  const isOwner = typeof article.author === 'object' ? article.author._id === user?._id : article.author === user?._id;
                  const canManage = user?.role === 'Admin' || isOwner;

                  return (
                    <tr key={article._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 max-w-sm truncate">
                        {article.title}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {getCategoryName(article.category)}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {getAuthorName(article.author)}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            article.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                        {new Date(article.createdAt).toLocaleDateString(undefined, {
                          dateStyle: 'medium',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {canManage ? (
                          <>
                            <Link
                              href={`/admin/news/edit/${article._id}`}
                              className="inline-block px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 hover:border-blue-600 rounded-lg transition-all"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDeleteArticle(article._id, article.title)}
                              className="px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="inline-block text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
