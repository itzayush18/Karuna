import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  UserCheck,
  BarChart3,
  BrainCircuit,
  Bell,
  Shield,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../hooks';
import { logout } from '../store/auth';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number;
  roles?: string[];
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Tasks', path: '/tasks', icon: <ClipboardList size={18} /> },
      { label: 'Reports', path: '/reports', icon: <FileText size={18} /> },
      { label: 'Assignments', path: '/assignments', icon: <UserCheck size={18} /> },
      { label: 'Volunteers', path: '/volunteers', icon: <Users size={18} /> },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={18} /> },
      { label: 'Predictions', path: '/predictions', icon: <BrainCircuit size={18} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', path: '/notifications', icon: <Bell size={18} /> },
      { label: 'Users', path: '/users', icon: <Shield size={18} />, roles: ['ADMIN', 'COORDINATOR'] },
      { label: 'Audit Logs', path: '/audit', icon: <ScrollText size={18} />, roles: ['ADMIN', 'COORDINATOR'] },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get page info from location
  const currentNav = navSections
    .flatMap((s) => s.items)
    .find((item) => {
      if (item.path === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.path);
    });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">K</div>
          <span className="sidebar-brand-text">Karuna</span>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items
                .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
                .map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span className="sidebar-item-label">{item.label}</span>
                    {item.badge ? <span className="sidebar-item-badge">{item.badge}</span> : null}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button className="btn btn-ghost btn-icon" style={{ display: 'none' }} onClick={() => setMobileOpen(!mobileOpen)}>
              <Menu size={20} />
            </button>
            <div>
              <div className="header-title">{currentNav?.label ?? 'Page'}</div>
            </div>
          </div>
          <div className="header-right">
            <button className="header-notification-btn" onClick={() => navigate('/notifications')}>
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div className="header-avatar">{initials}</div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.fullName ?? 'User'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.role ?? ''}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 90,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
