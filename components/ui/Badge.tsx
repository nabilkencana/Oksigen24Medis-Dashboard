import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';
  
  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border border-border',
    outline: 'text-foreground border border-border',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
