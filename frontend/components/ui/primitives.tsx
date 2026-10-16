'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, Check, ChevronDown, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { toast } from '@/components/ui/Toasts/use-toast';

const buttonStyles = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-foreground shadow-sm hover:brightness-95',
        secondary: 'bg-surface-muted text-foreground hover:bg-muted',
        outline:
          'border border-border bg-surface text-foreground hover:bg-surface-muted',
        ghost: 'text-foreground hover:bg-surface-muted',
        destructive: 'bg-danger text-danger-foreground hover:brightness-95',
        link: 'min-h-0 px-0 text-brand underline-offset-4 hover:underline'
      },
      size: {
        sm: 'min-h-8 rounded-md px-3 py-1.5 text-xs',
        md: '',
        lg: 'min-h-12 rounded-xl px-6 text-base',
        icon: 'size-10 p-0'
      }
    },
    defaultVariants: { variant: 'primary', size: 'md' }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      type = 'button',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export function ButtonLink({
  className,
  variant,
  size,
  ...props
}: Omit<React.ComponentProps<typeof Link>, 'className'> &
  VariantProps<typeof buttonStyles> & { className?: string }) {
  return (
    <Link
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  id?: string;
  hint?: string;
  error?: string;
  className?: string;
};

function useFieldIds(id?: string) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  return { fieldId, hintId: `${fieldId}-hint`, errorId: `${fieldId}-error` };
}

function FieldLabel({
  label,
  htmlFor,
  required
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-danger">
          *
        </span>
      )}
    </label>
  );
}

function FieldMessages({
  hint,
  error,
  hintId,
  errorId
}: {
  hint?: string;
  error?: string;
  hintId: string;
  errorId: string;
}) {
  return (
    <>
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}
    </>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  FieldProps & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, id, hint, error, className, required, ...props }, ref) => {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  return (
    <div className="grid gap-2">
      <FieldLabel label={label} htmlFor={fieldId} required={required} />
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      <FieldMessages
        hint={hint}
        error={error}
        hintId={hintId}
        errorId={errorId}
      />
    </div>
  );
});
Input.displayName = 'Input';

export const Select = React.forwardRef<
  HTMLSelectElement,
  FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>
>(
  (
    { label, id, hint, error, className, required, children, ...props },
    ref
  ) => {
    const { fieldId, hintId, errorId } = useFieldIds(id);
    return (
      <div className="grid gap-2">
        <FieldLabel label={label} htmlFor={fieldId} required={required} />
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'min-h-11 w-full appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-10 text-sm text-foreground shadow-sm focus-visible:border-ring',
              error && 'border-danger',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        <FieldMessages
          hint={hint}
          error={error}
          hintId={hintId}
          errorId={errorId}
        />
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ label, id, hint, error, className, required, ...props }, ref) => {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  return (
    <div className="grid gap-2">
      <FieldLabel label={label} htmlFor={fieldId} required={required} />
      <textarea
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring',
          error && 'border-danger',
          className
        )}
        {...props}
      />
      <FieldMessages
        hint={hint}
        error={error}
        hintId={hintId}
        errorId={errorId}
      />
    </div>
  );
});
Textarea.displayName = 'Textarea';

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-1.5 p-5', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-base font-semibold tracking-tight text-foreground',
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}

const badgeStyles = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-muted text-foreground',
        brand: 'bg-brand-muted text-brand',
        success: 'bg-success-muted text-success',
        warning: 'bg-warning-muted text-warning',
        danger: 'bg-danger-muted text-danger'
      }
    },
    defaultVariants: { variant: 'neutral' }
  }
);

export function Badge({
  variant,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeStyles>) {
  return (
    <span className={cn(badgeStyles({ variant }), className)} {...props} />
  );
}

export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border">
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader(
  props: React.HTMLAttributes<HTMLTableSectionElement>
) {
  return (
    <thead
      className="bg-surface-muted text-left text-muted-foreground"
      {...props}
    />
  );
}
export function TableBody(
  props: React.HTMLAttributes<HTMLTableSectionElement>
) {
  return <tbody className="divide-y divide-border bg-surface" {...props} />;
}
export function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className="transition-colors hover:bg-surface-muted/70" {...props} />
  );
}
export function TableHead(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className="h-11 px-4 text-xs font-semibold uppercase tracking-wide"
      {...props}
    />
  );
}
export function TableCell(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-4 py-3 align-middle text-foreground" {...props} />;
}

export function TableEmptyState({
  colSpan,
  children
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-12 text-center text-sm text-muted-foreground"
      >
        {children}
      </td>
    </tr>
  );
}

export type TabItem = { value: string; label: string; disabled?: boolean };
export function Tabs({
  tabs,
  value,
  onValueChange,
  label = 'Options',
  className
}: {
  tabs: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const available = tabs.filter((tab) => !tab.disabled);
    const current = available.findIndex((tab) => tab.value === value);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? available.length - 1
          : (current +
              (event.key === 'ArrowRight' ? 1 : -1) +
              available.length) %
            available.length;
    const selected = available[next];
    onValueChange(selected.value);
    tabRefs.current[
      tabs.findIndex((tab) => tab.value === selected.value)
    ]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'inline-flex flex-wrap gap-1 rounded-lg bg-surface-muted p-1',
        className
      )}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.value}
          ref={(element) => {
            tabRefs.current[index] = element;
          }}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          disabled={tab.disabled}
          tabIndex={value === tab.value ? 0 : -1}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
            value === tab.value && 'bg-surface text-foreground shadow-sm'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-surface-muted', className)}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  className
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid justify-items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center',
        className
      )}
    >
      <span
        className="grid size-10 place-items-center rounded-full bg-brand-muted text-brand"
        aria-hidden="true"
      >
        <Check className="size-5" />
      </span>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="grid justify-items-start gap-2 rounded-xl border border-danger/30 bg-danger-muted p-5"
    >
      <div className="flex items-center gap-2 font-semibold text-danger">
        <AlertTriangle aria-hidden="true" className="size-4" />
        {title}
      </div>
      <p className="text-sm text-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Avatar({
  name,
  src,
  className
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={cn(
        'inline-grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-muted text-sm font-semibold text-brand',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span aria-label={name}>{initials || '?'}</span>
      )}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
  eyebrow
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
      }}
      className={cn(
        'm-auto max-h-[min(90dvh,48rem)] w-[min(92vw,36rem)] rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-foreground/40',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="grid gap-1">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Close dialog"
          onClick={() => onOpenChange(false)}
          className="rounded-md p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

export function DropdownMenu({
  label,
  items
}: {
  label: string;
  items: Array<{
    label: string;
    onSelect: () => void;
    destructive?: boolean;
    disabled?: boolean;
  }>;
}) {
  const detailsRef = React.useRef<HTMLDetailsElement>(null);
  return (
    <details ref={detailsRef} className="relative">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium marker:hidden focus-visible:ring-2 focus-visible:ring-ring">
        {label}
        <ChevronDown
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      </summary>
      <div className="absolute right-0 z-30 mt-2 min-w-48 rounded-xl border border-border bg-surface p-1 shadow-lg">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              item.onSelect();
              if (detailsRef.current) detailsRef.current.open = false;
            }}
            className={cn(
              'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-muted disabled:opacity-50',
              item.destructive && 'text-danger'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  destructive = false,
  loading = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant={destructive ? 'destructive' : 'primary'}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

export function toastSuccess(title: string, description?: string) {
  return toast({ title, description });
}

export function toastError(title: string, description?: string) {
  return toast({ title, description, variant: 'destructive' });
}
