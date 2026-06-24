/** Styled blocks for legal page content */
export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-10 scroll-mt-28">
      <h2 className="font-heading mb-4 text-xl font-bold text-[var(--text)]">{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-[#FF6A3D]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

import { LEGAL_EMAIL } from "@/lib/legal";

export function LegalContactBlock() {
  return (
    <p className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--text-muted)]">
      Questions about these policies? Contact us at{" "}
      <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-[#FF6A3D] hover:underline">
        {LEGAL_EMAIL}
      </a>
      .
    </p>
  );
}
