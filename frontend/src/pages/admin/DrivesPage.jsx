import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/FormControls';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Briefcase, Building2, Users, Calendar, IndianRupee } from 'lucide-react';

export default function DrivesPage() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_id: '', role_offered: '', ctc_offered: '', drive_date: '',
    min_cgpa: '6.0', max_backlogs: '0', eligible_branches: 'BCA,CSE,ECE,ME',
    rounds: [{ round_name: 'Aptitude Test' }, { round_name: 'Technical Interview' }, { round_name: 'HR Interview' }],
  });

  useEffect(() => {
    Promise.all([
      api.get('/admin/drives'),
      api.get('/admin/companies'),
    ]).then(([d, c]) => {
      setDrives(d.data.drives);
      setCompanies(c.data.companies);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const addRound = () => setForm({ ...form, rounds: [...form.rounds, { round_name: '' }] });
  const removeRound = (i) => setForm({ ...form, rounds: form.rounds.filter((_, idx) => idx !== i) });
  const updateRound = (i, val) => { const r = [...form.rounds]; r[i].round_name = val; setForm({ ...form, rounds: r }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/drives', form);
      toast.success('Drive created successfully');
      setShowModal(false);
      const res = await api.get('/admin/drives');
      setDrives(res.data.drives);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create drive'); }
  };

  if (loading) return <LoadingSpinner text="Loading drives..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Placement Drives</h1>
            <p className="text-gray-400 text-sm">{drives.length} drives total</p>
          </div>
          <Button onClick={() => setShowModal(true)}><Plus size={16} /> Create Drive</Button>
        </div>

        {drives.length === 0 ? (
          <EmptyState icon={Briefcase} title="No drives yet" description="Create your first placement drive" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((d) => (
              <Card key={d.drive_id} className="space-y-3 cursor-pointer" onClick={() => navigate(`/admin/drives/${d.drive_id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center">
                      <Building2 size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{d.company?.name}</h3>
                      <p className="text-sm text-gray-300">{d.role_offered}</p>
                    </div>
                  </div>
                  <Badge status={d.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5"><IndianRupee size={12} /> ₹{parseFloat(d.ctc_offered).toFixed(1)} LPA</div>
                  <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(d.drive_date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5"><Users size={12} /> {d._count?.applications || 0} applicants</div>
                  <div className="flex items-center gap-1.5">CGPA ≥ {parseFloat(d.min_cgpa).toFixed(1)}</div>
                </div>

                <p className="text-xs text-gray-500">Eligible: {d.eligible_branches}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Placement Drive" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Company" value={form.company_id} onChange={e => setForm({...form, company_id: e.target.value})} required>
            <option value="">Select company...</option>
            {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name}</option>)}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Role Offered" placeholder="e.g. SDE 1" value={form.role_offered} onChange={e => setForm({...form, role_offered: e.target.value})} required />
            <Input label="CTC (LPA)" type="number" step="0.1" min="0" placeholder="8.5" value={form.ctc_offered} onChange={e => setForm({...form, ctc_offered: e.target.value})} required />
            <Input label="Drive Date" type="date" value={form.drive_date} onChange={e => setForm({...form, drive_date: e.target.value})} required />
            <Input label="Min CGPA" type="number" step="0.1" min="0" max="10" value={form.min_cgpa} onChange={e => setForm({...form, min_cgpa: e.target.value})} required />
            <Input label="Max Backlogs" type="number" min="0" value={form.max_backlogs} onChange={e => setForm({...form, max_backlogs: e.target.value})} />
            <Input label="Eligible Branches" placeholder="BCA,CSE,ECE" value={form.eligible_branches} onChange={e => setForm({...form, eligible_branches: e.target.value})} required />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Rounds</label>
              <button type="button" onClick={addRound} className="text-xs text-primary-400 hover:text-primary-300">+ Add Round</button>
            </div>
            <div className="space-y-2">
              {form.rounds.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">{i + 1}.</span>
                  <input className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-surface-500 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="Round name" value={r.round_name} onChange={e => updateRound(i, e.target.value)} required />
                  {form.rounds.length > 1 && (
                    <button type="button" onClick={() => removeRound(i)} className="text-xs text-danger-400 hover:text-danger-300">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create Drive</Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
