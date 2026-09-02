import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/FormControls';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Zap, Shield, GraduationCap, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password, role);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-900">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-white">PlacementIQ</h1>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            One platform for every
            <span className="text-gradient block">placement drive.</span>
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-md">
            Streamline campus recruitment with automated eligibility, real-time tracking, and powerful analytics.
          </p>

          <div className="space-y-4">
            {[
              { icon: '•', text: 'Live analytics dashboard with placement insights' },
              { icon: '•', text: 'Auto-filtered eligibility - no manual checking' },
              { icon: '•', text: 'Real-time notifications at every stage' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">PlacementIQ</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-surface-800 border border-surface-600 overflow-x-auto">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                role === 'student'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <GraduationCap size={16} />
              Student
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                role === 'admin'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Shield size={16} />
              Admin
            </button>
            <button
              onClick={() => setRole('company')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                role === 'company'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Building2 size={16} />
              Company
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg" variant="accent">
              Sign In
            </Button>
          </form>

          {role === 'student' && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Register here
              </Link>
            </p>
          )}

        </div>
      </motion.div>
    </div>
  );
}
