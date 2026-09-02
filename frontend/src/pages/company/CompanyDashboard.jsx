import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Briefcase, IndianRupee, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/company/drives');
      setDrives(res.data);
    } catch (error) {
      console.error('Error fetching drives:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading your drives...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.name}</h1>
        <p className="text-gray-400 text-sm">Monitor your placement drives and applicant progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map((drive) => (
          <motion.div
            key={drive.drive_id}
            whileHover={{ y: -4 }}
            className="bg-surface-800 rounded-xl border border-white/5 overflow-hidden flex flex-col hover:border-primary-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all"
          >
            <div className="p-5 border-b border-white/5 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-white text-lg">{drive.role_offered}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(drive.drive_date), 'MMMM d, yyyy')}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${drive.status === 'Open' ? 'bg-success-400/10 text-success-400' : 'bg-gray-400/10 text-gray-400'}`}>
                {drive.status}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <IndianRupee size={16} className="text-gray-500" />
                <span>₹{parseFloat(drive.ctc_offered).toFixed(1)} LPA</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                <span>{drive._count.applications} Applicants</span>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-surface-900/50">
              <Link
                to={`/company/drives/${drive.drive_id}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white rounded-lg transition-all text-sm font-medium"
              >
                View Applicants <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ))}
        {drives.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-surface-800 rounded-xl border border-white/5">
            <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
            <p>You have no placement drives recorded.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
