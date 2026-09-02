import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input } from '../../components/ui/FormControls';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { User, Upload, GraduationCap, Phone, Mail, Hash } from 'lucide-react';

export default function ProfilePage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get('/student/profile').then(res => {
      setStudent(res.data.student);
      setForm(res.data.student);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/student/profile', { name: form.name, phone: form.phone, cgpa: form.cgpa, backlogs: form.backlogs });
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await api.post('/student/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded');
      setForm({ ...form, resume_url: res.data.resume_url });
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm">Manage your personal information</p>
        </div>

        <Card hover={false} className="space-y-5">
          {/* Avatar + basic info */}
          <div className="flex items-center gap-4 pb-4 border-b border-surface-600">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white">
              {form.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{form.name}</h2>
              <p className="text-sm text-gray-400">{form.email}</p>
              <p className="text-xs text-gray-500">{form.branch} · Batch {form.batch_year}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Full Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="CGPA" type="number" step="0.01" min="0" max="10" value={form.cgpa || ''} onChange={e => setForm({...form, cgpa: e.target.value})} />
              <Input label="Backlogs" type="number" min="0" value={form.backlogs ?? ''} onChange={e => setForm({...form, backlogs: e.target.value})} />
            </div>
            <Input label="Phone" type="tel" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />

            {/* Resume */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Resume</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-700 border border-surface-500 text-sm text-gray-300 cursor-pointer hover:bg-surface-600 transition-colors">
                  <Upload size={16} />
                  Upload Resume
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                </label>
                {form.resume_url && <span className="text-xs text-success-400">✓ Resume uploaded</span>}
              </div>
            </div>

            <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}
