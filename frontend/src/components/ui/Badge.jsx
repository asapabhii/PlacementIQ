import clsx from 'clsx';

const statusStyles = {
  Applied: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'In-Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Selected: 'bg-green-500/15 text-green-400 border-green-500/30',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  Pending: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  Accepted: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Declined: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Superseded: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Open: 'bg-green-500/15 text-green-400 border-green-500/30',
  Closed: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  Completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Pass: 'bg-green-500/15 text-green-400 border-green-500/30',
  Fail: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function Badge({ status, className = '' }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusStyles[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      className,
    )}>
      {status}
    </span>
  );
}
