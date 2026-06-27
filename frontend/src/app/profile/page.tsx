'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const roleBadge = {
    Admin: 'bg-red-100 text-red-700 border border-red-200',
    'Sub-Admin': 'bg-orange-100 text-orange-700 border border-orange-200',
    User: 'bg-green-100 text-green-700 border border-green-200',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-10 mb-6">
            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-blue-600 bg-blue-50">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="pb-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadge[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Role</p>
              <p className="text-sm font-medium text-gray-900">{user.role}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">User ID</p>
              <p className="text-xs font-mono text-gray-600 truncate">{user._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm rounded-xl transition-colors"
          >
            📰 Browse News
          </Link>
          {(user.role === 'Admin' || user.role === 'Sub-Admin') && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium text-sm rounded-xl transition-colors"
            >
              🛡️ Admin Dashboard
            </Link>
          )}
          <button
            id="profile-logout-btn"
            onClick={() => { logout(); router.push('/'); }}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm rounded-xl transition-colors"
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
