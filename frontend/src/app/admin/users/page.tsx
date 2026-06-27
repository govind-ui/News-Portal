'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sub-Admin' | 'User';
  createdAt: string;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Sub-Admin' | 'User'>('Sub-Admin');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users list.');

      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      fetchUsers();
    }
  }, [currentUser]);

  // Handle new account creation by Admin
  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSuccess('');

    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setModalError('All fields are required.');
      return;
    }

    setModalLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword.trim(),
          role: newUserRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register account.');

      setSuccess(`🎉 Successfully registered new ${newUserRole} account: "${newUserName}"!`);
      
      // Reset form & close modal
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('Sub-Admin');
      setIsModalOpen(false);

      fetchUsers(); // Reload list
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to register staff account.');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle role modification
  const handleRoleChange = async (id: string, newRole: 'Admin' | 'Sub-Admin' | 'User') => {
    if (id === currentUser?._id) {
      setError('⚠️ Self-demotion is strictly forbidden.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update role.');

      setSuccess(`✅ Successfully updated role to "${newRole}".`);
      fetchUsers(); // Reload lists
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change role.');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?._id) {
      setError('⚠️ You cannot delete your own session account.');
      return;
    }

    if (!confirm(`Are you absolutely sure you want to permanently delete the account of "${name}"? This action is irreversible.`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user.');

      setSuccess(`🗑️ Successfully deleted account of "${name}".`);
      fetchUsers(); // Reload list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deactivation failed.');
    }
  };

  // Filter computations
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Aggregates
  const totalAdmins = users.filter(u => u.role === 'Admin').length;
  const totalSubAdmins = users.filter(u => u.role === 'Sub-Admin').length;
  const totalUsers = users.filter(u => u.role === 'User').length;

  const roleStyles = {
    Admin: 'bg-red-50 text-red-700 border-red-100',
    'Sub-Admin': 'bg-orange-50 text-orange-700 border-orange-100',
    User: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 lg:py-8 space-y-8 animate-fadeIn relative">
      {/* Title Header with Add Staff button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Audit, promote, demote, or terminate platform access rights and security clearances.</p>
        </div>
        <button
          onClick={() => { setModalError(''); setIsModalOpen(true); }}
          className="self-start sm:self-center bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          ➕ Add Staff Account
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          ✅ {success}
        </div>
      )}

      {/* Aggregate Counts Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Admins</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalAdmins}</p>
          </div>
          <span className="text-2xl">🛡️</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sub-Admins</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalSubAdmins}</p>
          </div>
          <span className="text-2xl">⚡</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regular Users</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</p>
          </div>
          <span className="text-2xl">👥</span>
        </div>
      </div>

      {/* Controls: Search / Filter Block */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Admin', 'Sub-Admin', 'User'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-medium">Downloading user indexes...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-semibold text-sm">
            👥 No matches found for your query. Try adjusting search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">User Name</th>
                  <th className="py-4 px-6">Security Clearance Role</th>
                  <th className="py-4 px-6">Registered Date</th>
                  <th className="py-4 px-6 text-right">Clearance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredUsers.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User Profile Block */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-sm shadow-inner flex-shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate">
                          {item.name} {item._id === currentUser?._id && <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-100 ml-1.5">You</span>}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{item.email}</p>
                      </div>
                    </td>

                    {/* Role selector pill */}
                    <td className="py-4 px-6">
                      <select
                        value={item.role}
                        disabled={item._id === currentUser?._id}
                        onChange={(e) => handleRoleChange(item._id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer disabled:cursor-not-allowed ${
                          roleStyles[item.role]
                        }`}
                      >
                        <option value="User">👥 Regular User</option>
                        <option value="Sub-Admin">⚡ Sub-Admin</option>
                        <option value="Admin">🛡️ Super Admin</option>
                      </select>
                    </td>

                    {/* Reg Date */}
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        dateStyle: 'medium',
                      })}
                    </td>

                    {/* Clearance Actions */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(item._id, item.name)}
                        disabled={item._id === currentUser?._id}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-rose-600 disabled:hover:border-rose-200 disabled:cursor-not-allowed"
                      >
                        Terminate Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OVERLAY MODAL: Add Staff Account Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-scaleIn">
            
            {/* Close Cross */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Staff Account</h3>
              <p className="text-slate-500 text-xs mt-1">Register a new Administrator, Sub-Admin, or regular user account directly.</p>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-1.5">
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. johndoe@newsportal.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Assign Password *</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Security Role Clearance *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-bold cursor-pointer"
                >
                  <option value="Sub-Admin">⚡ Sub-Admin</option>
                  <option value="Admin">🛡️ Super Admin</option>
                  <option value="User">👥 Regular User</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-350 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm shadow-md shadow-blue-600/15 transition-all flex items-center justify-center gap-1.5"
                >
                  {modalLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    '🚀 Register Staff'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
