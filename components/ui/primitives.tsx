import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-card border border-line bg-card shadow-soft', className)}
      {...props}
    />
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-card text-ink border border-line hover:bg-canvas',
  danger: 'bg-urgent-bg text-urgent border border-[#F0D9D6] hover:bg-[#fbe9e7]',
  success: 'bg-status-done text-white hover:brightness-95',
  ghost: 'bg-transparent text-muted hover:bg-canvas',
};
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px] rounded-[10px]',
  md: 'h-11 px-4 text-sm rounded-[11px]',
  lg: 'h-[52px] px-5 text-[15px] rounded-[12px]',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, block, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export interface AvatarProps {
  name: string;
  initial: string;
  size?: number;
  className?: string;
}

export function Avatar({ initial, size = 38, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'flex flex-none items-center justify-center rounded-full bg-[#DCEBE8] font-bold text-brand',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-brand', className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      {icon && <div className="text-muted-faint">{icon}</div>}
      <div className="text-sm font-semibold text-muted">{title}</div>
      {hint && <div className="text-xs text-muted-faint">{hint}</div>}
    </div>
  );
}
