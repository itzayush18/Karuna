import { useState, type FormEvent } from 'react';
import { Shield, Plus, UserPlus } from 'lucide-react';
import { useAsync, formatDate } from '../hooks';
import { directoryApi } from '../services/backend';
import type { UserRecord } from '../types';

export function UsersPage() {
  const users = useAsync(() => directoryApi.users(), []);
  const roles = useAsync(() => directoryApi.roles(), []);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = (users.data ?? []).filter((u: UserRecord) => {
    if (roleFilter && u.role.name !== roleFilter) return false;
    if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-description">Manage users, roles, and access permissions</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {showCreate && <CreateUserForm roles={roles.data ?? []} onDone={() => { setShowCreate(false); users.refetch(); }} />}

      <div className="filter-bar">
        <input className="form-input" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        <select className="form-input form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['ADMIN', 'COORDINATOR', 'FIELD_WORKER', 'VOLUNTEER', 'VIEWER'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {users.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <Shield size={40} style={{ opacity: 0.3 }} />
                    <h3>No users found</h3>
                  </div>
                </td></tr>
              ) : (
                filtered.map((u: UserRecord) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.6875rem', flexShrink: 0,
                        }}>
                          {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role.name === 'ADMIN' ? 'badge-danger' : u.role.name === 'COORDINATOR' ? 'badge-primary' : 'badge-neutral'}`}>
                        {u.role.name}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      {u.organization?.name ?? '—'}
                    </td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-success' : 'badge-neutral'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{formatDate(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateUserForm({ roles, onDone }: { roles: { id: string; name: string }[]; onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await directoryApi.createUser({ email, fullName, password, roleId });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
        <Plus size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Create New User
      </div>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input form-select" value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
              <option value="">Select role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create User'}</button>
          <button className="btn btn-secondary" type="button" onClick={onDone}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
