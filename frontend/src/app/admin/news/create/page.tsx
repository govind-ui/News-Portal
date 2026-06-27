'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Politics', 'Technology', 'Sports', 'Entertainment', 'Business', 'Health', 'Science'];

export default function CreateNewsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');

  // UI/UX States
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load social embeds widgets on preview
  useState(() => {
    // We can use a standard React useEffect for this; we'll add it below
    return;
  });

  const getYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim() || !category) {
      setError('Article headline, description content, and category are strictly required.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          title,
          content,
          featuredImage,
          videoUrl,
          socialUrl,
          category,
          isBreaking,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish news article');

      setSuccess('🎉 Article successfully published!');
      setTimeout(() => router.push('/admin'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Dynamically load scripts for widgets when preview is selected
  const { useEffect } = require('react');
  useEffect(() => {
    if (activeTab === 'preview' && socialUrl) {
      if (socialUrl.includes('twitter.com') || socialUrl.includes('x.com')) {
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
      if (socialUrl.includes('instagram.com')) {
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
  }, [activeTab, socialUrl]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:py-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Create News Post
          </h1>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">
            Write, design, and configure your news article for real-time publishing.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin')}
          className="self-start sm:self-center px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-200 flex items-center gap-2 hover:bg-slate-50"
        >
          <span>←</span> Back to Dashboard
        </button>
      </div>

      {/* Write / Preview Tab Switchers */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('write')}
          className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all duration-200 ${
            activeTab === 'write'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
          }`}
        >
          📝 Composer
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-2.5 font-bold text-sm rounded-t-xl transition-all duration-200 ${
            activeTab === 'preview'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
              : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
          }`}
        >
          👁️ Live Preview
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-2xl mb-6 text-sm flex items-center gap-2.5 animate-pulse">
          <span className="text-lg">⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-2xl mb-6 text-sm flex items-center gap-2.5 shadow-sm shadow-emerald-500/10">
          <span className="text-lg">✅</span>
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {activeTab === 'write' ? (
        <form onSubmit={handleSubmit}>
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Main Editor Area (takes 8 cols on large screens) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Article Headline Input Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="article-title" className="text-sm font-bold text-slate-800">
                    Article Headline *
                  </label>
                  <span className={`text-xs font-semibold ${title.length > 80 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {title.length} / 120 chars
                  </span>
                </div>
                <input
                  id="article-title"
                  type="text"
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Major Tech Breakthrough Revealed at Silicon Valley Event..."
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xl font-bold"
                  required
                />
              </div>

              {/* Rich Body Editor Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="article-content" className="text-sm font-bold text-slate-800">
                    Detailed Content / Description *
                  </label>
                  <span className="text-xs font-semibold text-slate-400">
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  id="article-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Draft the article story details here..."
                  rows={14}
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-serif text-base lg:text-lg leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Media Settings Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2">
                  Media & Asset Configurations
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="featured-image" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Featured Image URL
                    </label>
                    <input
                      id="featured-image"
                      type="url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="video-url" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Featured Video URL (optional)
                    </label>
                    <input
                      id="video-url"
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="social-url" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Social Embed URL (YouTube, Twitter, Instagram) (optional)
                  </label>
                  <input
                    id="social-url"
                    type="url"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="e.g., https://twitter.com/username/status/... or https://instagram.com/p/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {featuredImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 relative group aspect-video max-h-64 shadow-inner">
                    <img
                      src={featuredImage}
                      alt="Featured preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-semibold bg-blue-600/95 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                        Media Preview
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Sidebar controls (sticky config widget on desktop, stacked below on mobile) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* Publication Settings Panel */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5">
                <h3 className="text-base font-extrabold tracking-tight border-b border-slate-800 pb-3 mb-2 flex items-center justify-between">
                  <span>Publish Settings</span>
                  <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
                </h3>

                {/* Categories select options pills list */}
                <div>
                  <span className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Select Category *
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`text-xs px-3 py-2 rounded-xl font-bold transition-all duration-200 ${
                          category === cat
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Toggle Selector */}
                <div>
                  <label htmlFor="publish-status" className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Target Status
                  </label>
                  <select
                    id="publish-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Published">🚀 Immediate Release</option>
                    <option value="Draft">💾 Draft Option</option>
                  </select>
                </div>

                {/* Breaking News Toggle */}
                <div className="flex items-center justify-between bg-slate-850 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Breaking Alert</span>
                    <span className="text-[10px] text-slate-400">Trigger active homepage banner</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBreaking(!isBreaking)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      isBreaking ? 'bg-red-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                        isBreaking ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Primary Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="publish-article-btn"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Publishing article...
                      </>
                    ) : status === 'Draft' ? (
                      '💾 Save Draft Post'
                    ) : (
                      '🚀 Real-Time Release'
                    )}
                  </button>
                </div>
              </div>

              {/* Tips Panel */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  💡 Author Best Practices
                </h4>
                <ul className="text-xs text-blue-700/90 space-y-2 list-disc list-inside">
                  <li>Keep headings under 80 characters for higher click-throughs.</li>
                  <li>Include an image url to grab reader focus on home cards.</li>
                  <li>Use the live preview mode to format text accurately.</li>
                </ul>
              </div>

            </div>

          </div>
        </form>
      ) : (
        /* Preview Panel */
        <div className="max-w-3xl mx-auto py-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Visual Header */}
            <div className="p-6 md:p-8 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {category && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    {category}
                  </span>
                )}
                {isBreaking && (
                  <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    🚨 Breaking News
                  </span>
                )}
                <span className="text-slate-400 text-xs font-medium">
                  {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })} · 1 min read preview
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                {title || 'Untitled Headline Story'}
              </h1>
            </div>

            {/* Featured Image Panel */}
            <div className="relative aspect-video max-h-96 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
              <img
                src={featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80'}
                alt="Story banner"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 font-serif text-slate-800 leading-relaxed text-lg prose prose-slate max-w-none break-words whitespace-pre-wrap border-b border-slate-100">
              {content || 'No story details draft written yet. Use the composer tab to write detail description paragraphs...'}
            </div>

            {/* Social Embed Preview */}
            {socialUrl && (
              <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  🔗 Embedded Social Resource
                </h3>
                {(socialUrl.includes('youtube.com') || socialUrl.includes('youtu.be')) ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(socialUrl)}`}
                      title="YouTube video player"
                      className="w-full h-full border-none"
                      allowFullScreen
                    />
                  </div>
                ) : (socialUrl.includes('twitter.com') || socialUrl.includes('x.com')) ? (
                  <div className="flex justify-center">
                    <blockquote className="twitter-tweet w-full max-w-[550px]">
                      <a href={socialUrl}>Loading Tweet...</a>
                    </blockquote>
                  </div>
                ) : socialUrl.includes('instagram.com') ? (
                  <div className="flex justify-center">
                    <blockquote className="instagram-media w-full max-w-[540px]" data-instgrm-permalink={socialUrl}>
                      <a href={socialUrl}>Loading Instagram Post...</a>
                    </blockquote>
                  </div>
                ) : (
                  <div className="p-4 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Linked Content</p>
                      <a href={socialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {socialUrl}
                      </a>
                    </div>
                    <span className="text-xl">🔗</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
