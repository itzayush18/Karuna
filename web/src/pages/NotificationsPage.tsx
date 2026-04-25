import { Bell, AlertTriangle, UserCheck, Info, CheckCircle } from 'lucide-react';
import { useAsync, timeAgo } from '../hooks';
import { notificationsApi } from '../services/backend';
import type { NotificationItem } from '../types';

export function NotificationsPage() {
  const notifications = useAsync(() => notificationsApi.list(), []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      notifications.refetch();
    } catch {
      /* ignore */
    }
  };

  const iconMap: Record<string, { icon: React.ReactNode; className: string }> = {
    URGENT_NEED: { icon: <AlertTriangle size={18} />, className: 'urgent' },
    ASSIGNMENT: { icon: <UserCheck size={18} />, className: 'assignment' },
    ESCALATION: { icon: <AlertTriangle size={18} />, className: 'urgent' },
    SYSTEM: { icon: <Info size={18} />, className: 'system' },
  };

  const unreadCount = (notifications.data ?? []).filter((n: NotificationItem) => !n.readAt).length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-description">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {notifications.loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : !notifications.data?.length ? (
        <div className="card">
          <div className="empty-state">
            <Bell size={48} style={{ opacity: 0.3 }} />
            <h3>No notifications</h3>
            <p>You're all caught up</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 'var(--space-2)' }}>
          {notifications.data.map((n: NotificationItem) => {
            const { icon, className } = iconMap[n.type] ?? iconMap.SYSTEM;
            return (
              <div
                key={n.id}
                className={`notification-item ${!n.readAt ? 'unread' : ''}`}
                onClick={() => !n.readAt && handleMarkRead(n.id)}
              >
                <div className={`notification-icon-wrap ${className}`}>{icon}</div>
                <div className="notification-body">
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-text">{n.body}</div>
                  <div className="notification-time">{timeAgo(n.createdAt)}</div>
                </div>
                {n.readAt ? (
                  <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0, opacity: 0.5 }} />
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
