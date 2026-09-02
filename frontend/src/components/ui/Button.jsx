import { motion } from 'framer-motion';
import clsx from 'clsx';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20',
  secondary: 'bg-surface-700 hover:bg-surface-600 text-gray-200 border border-surface-500',
  danger: 'bg-danger-600 hover:bg-danger-500 text-white shadow-lg shadow-danger-600/20',
  success: 'bg-success-600 hover:bg-success-500 text-white shadow-lg shadow-success-600/20',
  ghost: 'bg-transparent hover:bg-surface-700 text-gray-300',
  accent: 'gradient-accent text-white shadow-lg shadow-primary-600/25',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children, variant = 'primary', size = 'md', className = '',
  disabled = false, loading = false, onClick, type = 'button', ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
