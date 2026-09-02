import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import StatCard from '../../components/ui/StatCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  Users, Building2, Briefcase, Trophy, TrendingUp, IndianRupee, Target, FileCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [branchStats, setBranchStats] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/overview'),
      api.get('/admin/analytics/branch-wise'),
      api.get('/admin/analytics/drive-funnel'),
      api.get('/admin/analytics/top-companies'),
    ]).then(([o, b, f, t]) => {
      setOverview(o.data.overview);
      setBranchStats(b.data.branchStats);
      setFunnelData(f.data.funnelData);
      setTopCompanies(t.data.topCompanies);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm">Overview of placement activities and performance</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={overview?.totalStudents || 0} icon={Users} color="primary" delay={0} to="/admin/reports" />
          <StatCard title="Placed Students" value={overview?.placedStudents || 0} icon={Trophy} color="success" delay={0.1} to="/admin/offers" />
          <StatCard title="Placement %" value={`${overview?.placementPercentage || 0}%`} icon={Target} color="accent" delay={0.2} to="/admin/reports" />
          <StatCard title="Avg CTC" value={`₹${overview?.avgCTC || 0}L`} icon={IndianRupee} color="purple" delay={0.3} to="/admin/offers" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Companies" value={overview?.totalCompanies || 0} icon={Building2} color="primary" delay={0.1} to="/admin/companies" />
          <StatCard title="Drives" value={overview?.totalDrives || 0} icon={Briefcase} color="success" delay={0.15} to="/admin/drives" />
          <StatCard title="Applications" value={overview?.totalApplications || 0} icon={FileCheck} color="accent" delay={0.2} to="/admin/drives" />
          <StatCard title="Highest CTC" value={`₹${overview?.highestCTC || 0}L`} icon={TrendingUp} color="purple" delay={0.25} to="/admin/offers" />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch-wise placement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Branch-wise Placement %</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#322e46" />
                <XAxis dataKey="branch" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1a1726', border: '1px solid #322e46', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Bar dataKey="placementPercentage" fill="#6366f1" radius={[6, 6, 0, 0]} name="Placement %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Placement pie chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Placement Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Placed', value: overview?.placedStudents || 0 },
                    { name: 'Unplaced', value: (overview?.totalStudents || 0) - (overview?.placedStudents || 0) },
                  ]}
                  cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#475569" />
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1726', border: '1px solid #322e46', borderRadius: '8px', color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CTC by branch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Average CTC by Branch (LPA)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#322e46" />
                <XAxis dataKey="branch" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1726', border: '1px solid #322e46', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="avgCTC" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Avg CTC (LPA)" />
                <Bar dataKey="highestCTC" fill="#22c55e" radius={[6, 6, 0, 0]} name="Highest CTC (LPA)" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Top Recruiting Companies</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCompanies} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#322e46" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis type="category" dataKey="company" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: '#1a1726', border: '1px solid #322e46', borderRadius: '8px', color: '#e2e8f0' }} />
                <Bar dataKey="totalOffers" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Total Offers" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Drive funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-xl p-5"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Drive-wise Application Funnel</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#322e46" />
              <XAxis dataKey="drive" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a1726', border: '1px solid #322e46', borderRadius: '8px', color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar dataKey="applied" fill="#6366f1" name="Applied" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" radius={[4, 4, 0, 0]} />
              <Bar dataKey="selected" fill="#22c55e" name="Selected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </PageTransition>
  );
}
