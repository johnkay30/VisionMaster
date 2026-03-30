import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'out' | 'in';
}

export const Card = ({ children, className, onClick, variant = 'out' }: CardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      'rounded-[2rem] p-8 cursor-pointer transition-all duration-300',
      variant === 'out' ? 'neo-out' : 'neo-in',
      className
    )}
  >
    {children}
  </motion.div>
);
