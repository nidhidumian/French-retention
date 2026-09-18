"use client";

/**
 * Small editorial form controls shared by the auth and onboarding screens:
 * mono uppercase labels, maroon inputs with hairline borders, pink pill
 * submit buttons — same voice as the rest of the app.
 */

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mono-label block text-[0.68rem] text-pink-hot">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`mt-2 w-full rounded-[0.8rem] border border-edge bg-maroon/60 px-4 py-3 text-[1.02rem] text-cream placeholder:text-cream-dim/40 focus:border-pink-hot/60 focus:outline-none ${className}`}
    />
  );
}

export function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-[0.3rem] border border-edge bg-maroon/60 transition-colors checked:border-pink-hot checked:bg-pink-hot"
      />
      <span className="text-[0.95rem] leading-relaxed text-cream">
        {children}
      </span>
    </label>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="mono-label rounded-full bg-pink-pale px-7 py-3 text-[0.78rem] text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm leading-relaxed text-coral">{message}</p>;
}
