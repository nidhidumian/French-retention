"use client";

/**
 * Small editorial form controls shared by the auth and onboarding screens:
 * mono uppercase labels, maroon inputs with hairline borders, one filled
 * pink primary button per screen — same voice as the rest of the app.
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
      className={`mt-2.5 w-full rounded-2xl border border-edge bg-maroon/60 px-5 py-3.5 text-[1.02rem] text-cream placeholder:text-cream-dim/40 focus:border-pink-hot/70 focus:outline-none ${className}`}
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
    <label className="flex cursor-pointer items-start gap-3.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-[1.15rem] w-[1.15rem] shrink-0 cursor-pointer appearance-none rounded-[0.35rem] border border-edge bg-maroon/60 transition-colors checked:border-pink-hot checked:bg-pink-hot"
      />
      <span className="text-[0.98rem] leading-relaxed text-cream">
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
      className="mono-label w-full rounded-full bg-pink-pale px-8 py-4 text-[0.8rem] text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
    >
      {children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm leading-relaxed text-coral">{message}</p>;
}
