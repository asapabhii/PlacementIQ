import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Circle } from 'lucide-react';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    api.get('/student/notifications').then(res => setNotifications(res.data.notifications)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/student/notifications/${id}/read`);
      fetchNotifs();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/student/notifications/read-all');
      toast.success('All marked as read');
      fetchNotifs();
    } catch {}
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400 text-sm">{unread} unread notification(s)</p>
          </div>
          {unread > 0 && (
            <Button variant="secondary" onClick={markAllRead} size="sm">
              <CheckCheck size={14} /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="You'll receive notifications about drives, results, and offers" />
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div key={n.notification_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <div
                  onClick={() => !n.is_read && markRead(n.notification_id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    n.is_read
                      ? 'bg-surface-800/30 border-surface-700/50 opacity-60'
                      : 'glass border-primary-500/15 hover:border-primary-500/30'
                  }`}
                >
                  <div className={`mt-0.5 ${n.is_read ? 'text-gray-600' : 'text-primary-400'}`}>
                    {n.is_read ? <Circle size={8} /> : <div className="w-2 h-2 rounded-full bg-primary-400" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-200'}`}>{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
