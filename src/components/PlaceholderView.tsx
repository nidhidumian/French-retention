"use client";

export function PlaceholderView({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center pt-10 text-center sm:pt-16">
      <div className="flex h-24 w-24 items-center justify-center rounded-tile border border-edge bg-surface text-pink sm:h-28 sm:w-28">
        {icon}
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-pink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-cream-dim">
        {description}
      </p>
      <p className="mt-6 rounded-full border border-edge px-4 py-1.5 label-caps text-sm font-semibold text-pink">
        Coming next
      </p>
    </section>
  );
}
