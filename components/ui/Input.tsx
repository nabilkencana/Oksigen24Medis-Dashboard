import React from 'react';

export function Label({ children, className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`} {...props}>
      {children}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isRupiah?: boolean;
}

export function Input({ label, error, className = '', id, isRupiah, onChange, value, ...props }: InputProps) {
  const formatRp = (val: any) => {
    if (val === undefined || val === null || val === '') return '';
    // Strip everything except digits
    const clean = String(val).replace(/\D/g, '');
    // Format with dots as thousands separators
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const displayValue = isRupiah ? formatRp(value) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    if (isRupiah) {
      const cleanVal = e.target.value.replace(/\D/g, '');
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: cleanVal,
        }
      } as any;
      onChange(newEvent);
    } else {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && id && <Label htmlFor={id}>{label}</Label>}
      <input
        id={id}
        type={isRupiah ? 'text' : props.type}
        value={displayValue}
        onChange={handleChange}
        className={`flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border/60 ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
}

export function Select({ label, options, error, className = '', id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && id && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <select
          id={id}
          className={`flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none dark:border-border/60 ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && id && <Label htmlFor={id}>{label}</Label>}
      <textarea
        id={id}
        className={`flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border/60 ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  );
}
