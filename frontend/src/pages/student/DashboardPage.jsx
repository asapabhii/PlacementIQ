import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, ClipboardList, Trophy, Bell } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [offers, setOffers] = useState([]);
  const [drives, setDrives] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/applications'),
      api.get('/student/offers'),
      api.get('/student/drives'),
      api.get('/student/notifications'),
    ]).then(([a, o, d, n]) => {
      setApps(a.data.applications);
      setOffers(o.data.offers);
      setDrives(d.data.drives);
      setNotifs(n.data.notifications.filter(x => !x.is_read));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-400 text-sm">Here's your placement overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Eligible Drives" value={drives.filter(d => !d.already_applied).length} icon={Briefcase} color="primary" delay={0} />
          <StatCard title="My Applications" value={apps.length} icon={ClipboardList} color="accent" delay={0.1} />
          <StatCard title="My Offers" value={offers.length} icon={Trophy} color="success" delay={0.2} />
          <StatCard title="Unread Notifications" value={notifs.length} icon={Bell} color="purple" delay={0.3} />
        </div>

        {/* Recent applications */}
        <Card hover={false}>
          <h3 className="font-semibold text-white mb-4">Recent Applications</h3>
          {apps.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No applications yet. Check eligible drives to get started!</p>
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 5).map((app) => (
                <div key={app.application_id} className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50 border border-surface-600/50">
                  <div>
                    <p className="font-medium text-white text-sm">{app.drive?.company?.name} | {app.drive?.role_offered}</p>
                    <p className="text-xs text-gray-400">Applied {new Date(app.applied_date).toLocaleDateString()}</p>
                  </div>
                  <Badge status={app.current_status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent notifications */}
        {notifs.length > 0 && (
          <Card hover={false}>
            <h3 className="font-semibold text-white mb-4">Recent Notifications</h3>
            <div className="space-y-2">
              {notifs.slice(0, 5).map((n) => (
                <div key={n.notification_id} className="p-3 rounded-lg bg-primary-500/5 border border-primary-500/10 text-sm text-gray-300">
                  {n.message}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
