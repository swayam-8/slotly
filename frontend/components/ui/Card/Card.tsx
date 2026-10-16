import { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, description, footer, children }: Props) {
  return (
    <div className="m-auto my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="px-5 py-5 sm:px-6">
        <h3 className="mb-1 text-2xl font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {footer && (
        <div className="border-t border-border bg-surface-muted p-4 text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
