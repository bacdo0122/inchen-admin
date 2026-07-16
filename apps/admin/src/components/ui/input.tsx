import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-lg border bg-panel px-3 py-2 text-sm text-fg placeholder:text-muted-fg ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand ' +
  'disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldBase, 'h-10', className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldBase, 'min-h-[96px]', className)} {...props} />;
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(fieldBase, 'h-10 pr-8', className)} {...props} />;
});
