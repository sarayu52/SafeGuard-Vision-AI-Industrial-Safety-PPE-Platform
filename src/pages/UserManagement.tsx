import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New user form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('safety_manager');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setErrorMessage(null);

    try {
      await api.createUser({ email, name, role, password });
      setShowCreateModal(false);
      setEmail('');
      setName('');
      setPassword('');
      await loadUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            User &amp; Access Role Administration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage site safety officers, floor managers, and third-party compliance inspectors.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Authorized User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Registered Safety Personnel ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Officer Name</th>
                <th className="py-2.5 px-4">Email Address</th>
                <th className="py-2.5 px-4">Role Permission</th>
                <th className="py-2.5 px-4">Date Authorized</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px]">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'safety_manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Capabilities Matrix */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Role-Based Access Control (RBAC) Permissions Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900">Chief Safety Officer (Admin)</span>
            <p className="text-[11px] text-slate-500">
              Full administrative privileges: configure scoring penalty weights, add/remove users, delete surveillance records, deploy model weights.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900">Site Safety Manager</span>
            <p className="text-[11px] text-slate-500">
              Ingest surveillance media, run YOLOv8 analyses, acknowledge and resolve violation alerts, export daily PDF audits.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900">Field Compliance Inspector</span>
            <p className="text-[11px] text-slate-500">
              Read-only inspection access: view media reports, inspect bounding boxes, filter alerts, export CSV logs.
            </p>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-600" />
              Add New Authorized Safety User
            </h3>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.jenkins@safeguard.industrial"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                >
                  <option value="safety_manager">Safety Manager</option>
                  <option value="inspector">Site Inspector</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
