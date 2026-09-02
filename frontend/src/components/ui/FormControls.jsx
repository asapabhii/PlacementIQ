import clsx from 'clsx';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <input
        className={clsx(
          'w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-500 text-gray-200',
          'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'transition-all duration-200',
          error && 'border-danger-500 focus:ring-danger-500/50',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <select
        className={clsx(
          'w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-500 text-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'transition-all duration-200',
          error && 'border-danger-500 focus:ring-danger-500/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-300">{label}</label>}
      <textarea
        className={clsx(
          'w-full px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-500 text-gray-200',
          'placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
          'transition-all duration-200 resize-none',
          error && 'border-danger-500 focus:ring-danger-500/50',
          className,
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  );
}
