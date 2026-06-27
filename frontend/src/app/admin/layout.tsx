'use client';

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <AdminGuard>
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Admin Console</h2>
          {user && (
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${user.role === 'Admin' ? 'bg-rose-500' : 'bg-orange-500'}`} />
              Role: {user.role}
            </p>
          )}
        </div>
        <nav className="p-4 space-y-1.5 flex-1">
          <Link href="/admin" className="block px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all">
            📊 Console Overview
          </Link>
          <Link href="/admin/news/create" className="block px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all">
            📝 Post News Article
          </Link>
          <Link href="/admin/categories" className="block px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all">
            🏷️ Manage Categories
          </Link>
          {user?.role === 'Admin' && (
            <Link href="/admin/users" className="block px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all">
              👥 User Management
            </Link>
          )}
        </nav>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
    </AdminGuard>
  );
}
