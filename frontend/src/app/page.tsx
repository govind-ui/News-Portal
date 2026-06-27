'use client';

import { useState, useEffect } from 'react';
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

// We will compute categories dynamically inside the component to support real-time category addition!

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const FALLBACK_NEWS: NewsArticle[] = [
  {
    _id: '1',
    title: 'The Future of AI in Web Development',
    content: 'Artificial intelligence is reshaping how developers build, deploy, and maintain modern web applications.',
    featuredImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    category: { _id: 'c1', name: 'Technology' },
    author: { _id: 'a1', name: 'Admin User' },
    isBreaking: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: '2',
    title: 'Global Markets Reach All-Time Highs',
    content: 'Stock markets around the world hit record-breaking levels as investor confidence surges amid positive economic reports.',
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    category: { _id: 'c2', name: 'Business' },
    author: { _id: 'a1', name: 'Admin User' },
    isBreaking: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: '3',
    title: 'Champions League: Historic Comeback',
    content: 'In a stunning turn of events, the underdog team clinched victory in the final minutes to advance to the next round.',
    featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    category: { _id: 'c3', name: 'Sports' },
    author: { _id: 'a1', name: 'Admin User' },
    isBreaking: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filtered, setFiltered] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamically extract unique categories from news database articles
  const categoriesList = ['All', ...Array.from(new Set(news.map(article => {
    return typeof article.category === 'object' ? article.category?.name : article.category;
  }).filter(Boolean)))];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/news`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.length > 0 ? data : FALLBACK_NEWS);
        } else {
          setNews(FALLBACK_NEWS);
        }
      } catch {
        setNews(FALLBACK_NEWS);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    let result = news;
    if (activeCategory !== 'All') {
      result = result.filter((n) => {
        const cat = typeof n.category === 'object' ? n.category.name : n.category;
        return cat?.toLowerCase() === activeCategory.toLowerCase();
      });
    }
    if (search.trim()) {
      result = result.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [news, activeCategory, search]);

  const breakingNews = news.filter((n) => n.isBreaking);
  const getCategoryName = (cat: NewsArticle['category']) =>
    typeof cat === 'object' ? cat.name : cat;
  const getAuthorName = (author: NewsArticle['author']) =>
    typeof author === 'object' ? author.name : author;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 rounded-xl mb-6 flex items-center gap-3 shadow-md shadow-red-600/20 overflow-hidden">
          <span className="font-bold uppercase tracking-wider bg-white text-red-600 px-2.5 py-1 rounded-lg text-xs flex-shrink-0">
            🔴 Breaking
          </span>
          <div className="overflow-hidden">
            <p className="text-sm font-medium whitespace-nowrap animate-marquee">
              {breakingNews.map((n) => n.title).join('  •  ')}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
        <input
          type="text"
          id="news-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search news articles..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeCategory === 'All' ? 'Latest News' : activeCategory}
            </h2>
            <span className="text-sm text-gray-400">{filtered.length} articles</span>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-gray-500 font-medium">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different keyword or category</p>
            </div>
          ) : (
            filtered.map((article) => (
              <article
                key={article._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {article.featuredImage && (
                  <div className="h-52 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {article.isBreaking && (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                        🔴 Breaking
                      </span>
                    )}
                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {getCategoryName(article.category)}
                    </span>
                  </div>
                  <Link href={`/news/${article._id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors leading-snug cursor-pointer">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{article.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>By <span className="font-medium text-gray-600">{getAuthorName(article.author)}</span> · {timeAgo(article.createdAt)}</span>
                    <Link
                      href={`/news/${article._id}`}
                      className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Trending */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔥 Trending Now
            </h3>
            {news.slice(0, 5).map((article, i) => (
              <Link href={`/news/${article._id}`} key={article._id}>
                <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                  <span className="text-2xl font-extrabold text-gray-200 leading-none mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(article.createdAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Browse Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.filter((c) => c !== 'All').map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg border border-gray-100 hover:border-blue-200 transition-all text-left"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
