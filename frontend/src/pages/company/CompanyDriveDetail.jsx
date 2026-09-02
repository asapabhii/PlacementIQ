import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function CompanyDriveDetail() {
  const { id } = useParams();
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriveDetail();
  }, [id]);

  const fetchDriveDetail = async () => {
    try {
      const res = await api.get(`/company/drives/${id}`);
      setDrive(res.data);
    } catch (error) {
      console.error('Error fetching drive details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading drive details...</div>;
  if (!drive) return <div className="p-8 text-danger-400">Drive not found or access denied.</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto">
      <Link to="/company" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="bg-surface-800 rounded-xl border border-white/5 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{drive.role_offered}</h1>
          <p className="text-gray-400 mt-1">Total Applicants: {drive.applications?.length || 0}</p>
        </div>
        <div className="flex gap-2">
          {drive.rounds.map((r, idx) => (
            <div key={r.round_id} className="bg-surface-900 px-3 py-1.5 rounded-md border border-white/5 text-xs text-gray-300">
              Round {idx + 1}: {r.round_name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-800 rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-surface-900/50">
          <h2 className="font-semibold text-white">Applicant Tracking</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-surface-900/50 text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4">Resume</th>
                <th className="px-6 py-4">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {drive.applications?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applicants yet.</td>
                </tr>
              ) : (
                drive.applications?.map((app) => (
                  <tr key={app.application_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{app.student.name}</td>
                    <td className="px-6 py-4">{app.student.branch}</td>
                    <td className="px-6 py-4">{parseFloat(app.student.cgpa).toFixed(1)}</td>
                    <td className="px-6 py-4">
                      {app.student.resume_url ? (
                        <a href={`http://localhost:5000${app.student.resume_url}`} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">
                          View Resume
                        </a>
                      ) : (
                        <span className="text-gray-500">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.current_status === 'Selected' ? 'bg-success-400/10 text-success-400' :
                        app.current_status === 'Rejected' ? 'bg-danger-400/10 text-danger-400' :
                        'bg-warning-400/10 text-warning-400'
                      }`}>
                        {app.current_status === 'Selected' && <CheckCircle2 size={12} />}
                        {app.current_status === 'Rejected' && <XCircle size={12} />}
                        {(app.current_status !== 'Selected' && app.current_status !== 'Rejected') && <Clock size={12} />}
                        {app.current_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
