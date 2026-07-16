import { Inbox, type LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-panel px-6 py-14 text-center">
      <Icon className="h-10 w-10 text-muted-fg" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-fg">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
