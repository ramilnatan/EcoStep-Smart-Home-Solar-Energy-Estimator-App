import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  glow?: 'green' | 'cyan' | 'amber' | 'none';
  hover?: boolean;
};

export function GlassCard({ children, className = '', glow = 'none', hover = false }: GlassCardProps) {
  const glowStyles = {
    green: 'border-eco-green/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]',
    cyan: 'border-eco-cyan/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    amber: 'border-eco-amber/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    none: 'border-white/10',
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-white/5 to-white/[0.02]
        backdrop-blur-xl
        border ${glowStyles[glow]}
        ${hover ? 'cursor-pointer transition-all duration-300 hover:border-eco-green/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-eco-green/5 via-transparent to-eco-cyan/5 opacity-50" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
