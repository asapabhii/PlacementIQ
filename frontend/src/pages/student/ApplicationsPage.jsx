import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { ClipboardList, CheckCircle2, Circle, XCircle } from 'lucide-react';

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/applications').then(res => setApps(res.data.applications)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading applications..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Applications</h1>
          <p className="text-gray-400 text-sm">{apps.length} application(s)</p>
        </div>

        {apps.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No applications" description="Apply to drives to track your progress here" />
        ) : (
          <div className="space-y-4">
            {apps.map((app, idx) => (
              <motion.div key={app.application_id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card hover={false} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{app.drive?.company?.name}</h3>
                      <p className="text-sm text-gray-400">{app.drive?.role_offered} · ₹{parseFloat(app.drive?.ctc_offered || 0).toFixed(1)} LPA</p>
                    </div>
                    <Badge status={app.current_status} />
                  </div>

                  {/* Visual round stepper */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {/* Applied step */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-500/15 border border-primary-500/30">
                        <CheckCircle2 size={16} className="text-primary-400" />
                        <span className="text-xs font-medium text-primary-300">Applied</span>
                      </div>
                    </div>

                    {/* Round steps */}
                    {app.drive?.rounds?.map((round) => {
                      const result = app.results?.find(r => r.round?.round_id === round.round_id);
                      let stepColor, stepIcon, stepBorder;

                      if (result?.result === 'Pass') {
                        stepColor = 'text-success-400'; stepIcon = <CheckCircle2 size={16} />; stepBorder = 'bg-success-500/15 border-success-500/30';
                      } else if (result?.result === 'Fail') {
                        stepColor = 'text-danger-400'; stepIcon = <XCircle size={16} />; stepBorder = 'bg-danger-500/15 border-danger-500/30';
                      } else {
                        stepColor = 'text-gray-500'; stepIcon = <Circle size={16} />; stepBorder = 'bg-surface-700 border-surface-500';
                      }

                      return (
                        <div key={round.round_id} className="flex items-center gap-1 shrink-0">
                          <div className="w-6 h-px bg-surface-500" />
                          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${stepBorder}`}>
                            <span className={stepColor}>{stepIcon}</span>
                            <span className={`text-xs font-medium ${stepColor}`}>{round.round_name}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Offer step (if selected) */}
                    {app.offer && (
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="w-6 h-px bg-surface-500" />
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent-500/15 border border-accent-500/30">
                          <span className="text-xs font-medium text-accent-400">
                            Offer: {app.offer.offer_status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">Applied on {new Date(app.applied_date).toLocaleDateString()}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
