import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Select } from '../../components/ui/FormControls';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Calendar, IndianRupee, CheckCircle2, XCircle } from 'lucide-react';

export default function DriveDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('applications');

  const fetchDrive = () => {
    Promise.all([
      api.get(`/admin/drives/${id}`),
      api.get(`/admin/drives/${id}/eligible-students`),
    ]).then(([d, e]) => {
      setDrive(d.data.drive);
      setEligibleStudents(e.data.students);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDrive(); }, [id]);

  const updateResult = async (applicationId, roundId, result) => {
    try {
      await api.post('/admin/round-results', { application_id: applicationId, round_id: roundId, result });
      toast.success(`Marked as ${result}`);
      fetchDrive();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!drive) return <div className="text-gray-400">Drive not found</div>;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/drives')} className="p-2 rounded-lg hover:bg-surface-700 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{drive.company?.name} | {drive.role_offered}</h1>
              <Badge status={drive.status} />
            </div>
            <div className="flex gap-4 mt-1 text-sm text-gray-400">
              <span className="flex items-center gap-1"><IndianRupee size={14} /> ₹{parseFloat(drive.ctc_offered).toFixed(1)} LPA</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(drive.drive_date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {drive.applications?.length || 0} applicants</span>
            </div>
          </div>
        </div>

        {/* Rounds overview */}
        <Card hover={false}>
          <h3 className="font-semibold text-white mb-3">Rounds</h3>
          <div className="flex gap-2 flex-wrap">
            {drive.rounds?.map((r) => (
              <div key={r.round_id} className="px-3 py-1.5 rounded-lg bg-surface-700 text-sm text-gray-300 border border-surface-500">
                {r.round_number}. {r.round_name}
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-surface-600 pb-2">
          {['applications', 'eligible'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-surface-700 text-white border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-200'
              }`}>
              {t === 'applications' ? `Applications (${drive.applications?.length || 0})` : `Eligible Students (${eligibleStudents.length})`}
            </button>
          ))}
        </div>

        {/* Applications tab */}
        {tab === 'applications' && (
          <div className="space-y-3">
            {drive.applications?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No applications yet</p>
            ) : (
              drive.applications?.map((app) => (
                <Card key={app.application_id} hover={false} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{app.student?.name}</h4>
                      <p className="text-xs text-gray-400">{app.student?.email} · {app.student?.branch} · CGPA: {parseFloat(app.student?.cgpa).toFixed(1)}</p>
                    </div>
                    <Badge status={app.current_status} />
                  </div>

                  {/* Round results */}
                  <div className="flex gap-2 flex-wrap">
                    {drive.rounds?.map((round) => {
                      const result = app.results?.find(r => r.round_id === round.round_id);
                      return (
                        <div key={round.round_id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800 border border-surface-600 text-sm">
                          <span className="text-gray-400">{round.round_name}:</span>
                          {result ? (
                            <Badge status={result.result} />
                          ) : (
                            app.current_status !== 'Rejected' && (
                              <div className="flex gap-1">
                                <button onClick={() => updateResult(app.application_id, round.round_id, 'Pass')}
                                  className="p-1 rounded hover:bg-success-500/20 text-success-400 transition-colors" title="Pass">
                                  <CheckCircle2 size={16} />
                                </button>
                                <button onClick={() => updateResult(app.application_id, round.round_id, 'Fail')}
                                  className="p-1 rounded hover:bg-danger-500/20 text-danger-400 transition-colors" title="Fail">
                                  <XCircle size={16} />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {app.offer && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Offer:</span>
                      <Badge status={app.offer.offer_status} />
                      <span className="text-gray-300">₹{parseFloat(app.offer.final_ctc).toFixed(1)} LPA</span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Eligible students tab */}
        {tab === 'eligible' && (
          <Card hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-surface-600">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Branch</th>
                    <th className="pb-3 pr-4">CGPA</th>
                    <th className="pb-3 pr-4">Backlogs</th>
                    <th className="pb-3">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.map((s, i) => (
                    <tr key={s.student_id} className="border-b border-surface-700/50 text-gray-300 hover:bg-surface-700/30 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-500">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium text-white">{s.name}</td>
                      <td className="py-2.5 pr-4">{s.branch}</td>
                      <td className="py-2.5 pr-4">{parseFloat(s.cgpa).toFixed(1)}</td>
                      <td className="py-2.5 pr-4">{s.backlogs}</td>
                      <td className="py-2.5 text-gray-400">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
