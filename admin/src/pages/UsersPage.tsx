// admin/src/pages/UsersPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { getAdminUsers, updateAdminUserStatus, getMe } from '../lib/api';
import { AdminUserItem } from '../types/admin';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Notifications
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current admin ID
  useEffect(() => {
    async function fetchMe() {
      const res = await getMe();
      if (res.success && res.data?.user) {
        setCurrentAdminId(res.data.user.id);
      }
    }
    fetchMe();
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        page,
        limit: 20,
        q: search.trim(),
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });

      if (res.success && res.data) {
        setUsers(res.data.items);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleStatusToggle(user: AdminUserItem) {
    if (user.id === currentAdminId) {
      setMsg({ type: 'error', text: 'You cannot suspend your own admin account.' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await updateAdminUserStatus(user.id, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
        setMsg({ type: 'success', text: `User "${user.username}" status updated to ${nextStatus}.` });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update user status.' });
      }
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error updating user' });
    }
  }

  async function handleRoleToggle(user: AdminUserItem) {
    if (user.id === currentAdminId) {
      setMsg({ type: 'error', text: 'You cannot change your own admin role.' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }

    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmed = window.confirm(
      `Are you sure you want to change ${user.username}'s role to ${nextRole.toUpperCase()}?`
    );
    if (!confirmed) return;

    try {
      const res = await updateAdminUserStatus(user.id, undefined, nextRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
        setMsg({ type: 'success', text: `User "${user.username}" role updated to ${nextRole}.` });
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update user role.' });
      }
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error updating user role' });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor community members, manage account statuses, and assign administrator privileges.
        </p>
      </div>

      {/* Toast Notification */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}
        >
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search username, email, name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="user">Users Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Favorites</th>
                <th className="py-3 px-4 text-center">Collections</th>
                <th className="py-3 px-4 text-center">Downloads</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((user) => {
                const isSelf = user.id === currentAdminId;

                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span>{user.username}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                                You
                              </span>
                            )}
                          </div>
                          {user.full_name && (
                            <div className="text-xs text-slate-400">{user.full_name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs">{user.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-300">
                      {user.favorites_count}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-300">
                      {user.collections_count}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-300">
                      {user.downloads_count}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isSelf && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRoleToggle(user)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                            title="Toggle Admin Privilege"
                          >
                            {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className={`px-2 py-1 text-xs font-medium rounded-lg border transition-colors ${
                              user.status === 'active'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No users match the search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-slate-200 font-semibold">{users.length}</span> of{' '}
            <span className="text-slate-200 font-semibold">{total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
