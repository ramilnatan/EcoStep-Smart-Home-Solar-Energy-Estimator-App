import { motion } from 'framer-motion';
import { forwardRef, InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 pl-11
              bg-white/5 border border-white/10 rounded-xl
              text-white placeholder-gray-500
              focus:outline-none focus:border-eco-green/50 focus:ring-2 focus:ring-eco-green/20
              transition-all duration-300
              ${error ? 'border-red-500/50' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            className="mt-2 text-sm text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
