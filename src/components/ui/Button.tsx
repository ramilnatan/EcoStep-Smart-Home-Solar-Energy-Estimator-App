import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'relative overflow-hidden rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-gradient-to-r from-eco-green to-eco-cyan text-black shadow-lg shadow-eco-green/30 hover:shadow-xl hover:shadow-eco-green/40',
    secondary: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
    ghost: 'bg-transparent text-eco-green hover:bg-eco-green/10',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-eco-cyan to-eco-green opacity-0 hover:opacity-100 transition-opacity duration-500" />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}
