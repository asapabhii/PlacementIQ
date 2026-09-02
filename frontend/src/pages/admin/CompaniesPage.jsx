import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/FormControls';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Plus, Building2, Mail, Briefcase, Pencil, Trash2 } from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sector: '', hr_contact_email: '', description: '' });

  const fetchCompanies = () => {
    api.get('/admin/companies').then(res => setCompanies(res.data.companies)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', sector: '', hr_contact_email: '', description: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, sector: c.sector || '', hr_contact_email: c.hr_contact_email || '', description: c.description || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/companies/${editing.company_id}`, form);
        toast.success('Company updated');
      } else {
        await api.post('/admin/companies', form);
        toast.success('Company created');
      }
      setShowModal(false); fetchCompanies();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this company? This cannot be undone.')) return;
    try { await api.delete(`/admin/companies/${id}`); toast.success('Company deleted'); fetchCompanies(); }
    catch (err) { toast.error(err.response?.data?.error || 'Cannot delete — has related drives'); }
  };

  if (loading) return <LoadingSpinner text="Loading companies..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Companies</h1>
            <p className="text-gray-400 text-sm">{companies.length} companies registered</p>
          </div>
          <Button onClick={openCreate}><Plus size={16} /> Add Company</Button>
        </div>

        {companies.length === 0 ? (
          <EmptyState icon={Building2} title="No companies yet" description="Add your first recruiting company" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((c) => (
              <Card key={c.company_id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center">
                      <Building2 size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{c.name}</h3>
                      <p className="text-xs text-gray-400">{c.sector || 'No sector'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-surface-600 text-gray-400 hover:text-white transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.company_id)} className="p-1.5 rounded hover:bg-danger-500/20 text-gray-400 hover:text-danger-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {c.hr_contact_email && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail size={12} /> {c.hr_contact_email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Briefcase size={12} /> {c._count?.drives || 0} drive(s)
                </div>
                {c.description && <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Company' : 'Add Company'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Company Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Sector" placeholder="e.g. IT Services, Fintech" value={form.sector} onChange={e => setForm({...form, sector: e.target.value})} />
          <Input label="HR Contact Email" type="email" value={form.hr_contact_email} onChange={e => setForm({...form, hr_contact_email: e.target.value})} />
          <Textarea label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
