import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Input, Select } from '../../components/ui/FormControls';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', branch: 'BCA',
    batch_year: '2026', cgpa: '', backlogs: '0', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Welcome to PlacementIQ.');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">PlacementIQ</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-gray-400">Register as a student to get started</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={update('name')} required className="col-span-2" />
              <Input label="Email" type="email" placeholder="you@students.edu" value={form.email} onChange={update('email')} required className="col-span-2" />
              <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={update('password')} required />
              <Input label="Phone" type="tel" placeholder="9876543210" value={form.phone} onChange={update('phone')} />
              <Select label="Branch" value={form.branch} onChange={update('branch')} required>
                <option value="BCA">BCA</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
              </Select>
              <Input label="Batch Year" type="number" min="2000" max="2100" value={form.batch_year} onChange={update('batch_year')} required />
              <Input label="CGPA" type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={update('cgpa')} required />
              <Input label="Backlogs" type="number" min="0" value={form.backlogs} onChange={update('backlogs')} />
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg" variant="accent">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
