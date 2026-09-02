import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';
import api from '../../api/axios';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/student/notifications')
        .then(res => {
          const unread = res.data.notifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-surface-600/50 bg-surface-800/50 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white">{title}</h2>

      <div className="flex items-center gap-4">
        {user?.role === 'student' && (
          <div className="relative">
            <Bell size={20} className="text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-200">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
