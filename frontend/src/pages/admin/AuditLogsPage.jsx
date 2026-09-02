import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Shield, Clock, User, Activity } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'POST': return 'text-success-400 bg-success-400/10';
      case 'PUT': return 'text-warning-400 bg-warning-400/10';
      case 'DELETE': return 'text-danger-400 bg-danger-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    });
  };

  if (loading) return <div className="p-8 text-gray-400">Loading audit trail...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="text-primary-500" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-gray-400 text-sm">Track mutating actions performed by placement officers</p>
        </div>
      </div>

      <div className="bg-surface-800 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-surface-900/50 text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No recent audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={14} />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary-400" />
                        <span>{log.admin?.name || 'Unknown Admin'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getMethodColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {log.target}
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
