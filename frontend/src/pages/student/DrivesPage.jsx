import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Briefcase, IndianRupee, Calendar, Users, CheckCircle, Send, ClipboardList } from 'lucide-react';

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  const fetchDrives = () => {
    api.get('/student/drives').then(res => setDrives(res.data.drives)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrives(); }, []);

  const handleApply = async (driveId) => {
    setApplying(driveId);
    try {
      await api.post(`/student/drives/${driveId}/apply`);
      toast.success('Application submitted!');
      fetchDrives();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to apply'); }
    finally { setApplying(null); }
  };

  if (loading) return <LoadingSpinner text="Loading eligible drives..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Eligible Drives</h1>
          <p className="text-gray-400 text-sm">{drives.length} drives available for you</p>
        </div>

        {drives.length === 0 ? (
          <EmptyState icon={Briefcase} title="No eligible drives" description="New drives will appear here based on your profile" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((d, i) => (
              <motion.div key={d.drive_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center">
                        <Briefcase size={20} className="text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{d.company?.name}</h3>
                        <p className="text-sm text-gray-300">{d.role_offered}</p>
                      </div>
                    </div>
                    <Badge status={d.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5"><IndianRupee size={14} /> ₹{parseFloat(d.ctc_offered).toFixed(1)} LPA</div>
                    <div className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(d.drive_date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5"><Users size={14} /> {d._count?.applications || 0} applied</div>
                    <div className="flex items-center gap-1.5"><ClipboardList size={14} /> {d.rounds?.length || 0} rounds</div>
                  </div>

                  {d.rounds?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {d.rounds.map(r => (
                        <span key={r.round_id} className="text-xs px-2 py-1 rounded bg-surface-700 text-gray-400 border border-surface-600">
                          {r.round_name}
                        </span>
                      ))}
                    </div>
                  )}

                  {d.already_applied ? (
                    <Button variant="secondary" disabled className="w-full">
                      <CheckCircle size={16} className="text-success-400" /> Already Applied
                    </Button>
                  ) : (
                    <Button onClick={() => handleApply(d.drive_id)} loading={applying === d.drive_id} className="w-full">
                      <Send size={16} /> Apply Now
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
