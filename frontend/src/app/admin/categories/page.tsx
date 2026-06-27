'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ManageCategories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category creation
  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Category label name is required.');
      return;
    }

    setActionLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create category.');

      setSuccess(`🎉 Category "${name}" successfully registered!`);
      setName('');
      setDescription('');
      fetchCategories(); // Reload list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this category? All news linked to it will remain but its category classification will be unlinked.')) {
      return;
    }

    setError('');
    setSuccess('');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete category.');

      setSuccess('🗑️ Category successfully deleted.');
      fetchCategories(); // Reload list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:py-8 space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Categories</h1>
        <p className="text-slate-500 text-sm mt-1">Add, edit, or delete article categories to refine user portal classification navigation.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-shake">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          ✅ {success}
        </div>
      )}

      {/* Grid Layout (Form on Left / List on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Create Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
            Create Category
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="cat-name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Category Name *
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science, Health, Politics..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label htmlFor="cat-description" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Brief Description
              </label>
              <textarea
                id="cat-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional summary details..."
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
            >
              {actionLoading ? 'Creating Category...' : '🚀 Create Category'}
            </button>
          </form>
        </div>

        {/* Right Side: List Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Platform Categories</h2>
              <p className="text-xs text-slate-500 mt-0.5">List of active classifications populated in your system.</p>
            </div>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
              {categories.length} Categories
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-medium">Fetching categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-semibold text-sm">
              🏷️ No categories registered yet. Use the composer on the left to add one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Registered Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                        {new Date(cat.createdAt).toLocaleDateString(undefined, {
                          dateStyle: 'medium',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
