import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({ children, className = '', hover = true, glow = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(99, 102, 241, 0.12)' } : {}}
      className={clsx(
        'glass rounded-xl p-5 transition-all duration-300',
        glow && 'animate-pulse-glow',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
