import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary', delay = 0, to }) {
  const colors = {
    primary: 'from-primary-600/20 to-primary-600/5 border-primary-500/20',
    success: 'from-success-600/20 to-success-600/5 border-success-500/20',
    accent: 'from-accent-500/20 to-accent-500/5 border-accent-500/20',
    danger: 'from-danger-600/20 to-danger-600/5 border-danger-500/20',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20',
  };

  const iconColors = {
    primary: 'text-primary-400 bg-primary-500/15',
    success: 'text-success-400 bg-success-500/15',
    accent: 'text-accent-400 bg-accent-500/15',
    danger: 'text-danger-400 bg-danger-500/15',
    purple: 'text-purple-400 bg-purple-500/15',
  };

  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={clsx(
        'rounded-xl border bg-gradient-to-br p-5 hover-lift',
        colors[color],
        to && 'cursor-pointer hover:border-primary-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            {value}
          </motion.p>
          {trend && (
            <p className={clsx('text-xs font-medium', trend > 0 ? 'text-success-400' : 'text-danger-400')}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last batch
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-lg', iconColors[color])}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );

  return to ? <Link to={to} className="block w-full">{CardContent}</Link> : CardContent;
}
