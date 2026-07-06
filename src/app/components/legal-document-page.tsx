import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalDocumentPageProps = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export default function LegalDocumentPage({
  title,
  description,
  lastUpdated,
  sections,
}: LegalDocumentPageProps) {
  return (
    <main className="mx-auto w-[90%] max-w-4xl px-2 pb-16 pt-4 sm:px-6 sm:pt-6">
      <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-lg sm:p-8">
        <header className="border-b border-neutral-100 pb-5">
          <h1 className="text-[1.75rem] font-bold leading-snug text-secondary-foreground sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 font-pangolin text-[1.05rem] leading-snug text-foreground sm:text-[1.15rem]">
            {description} Last updated {lastUpdated}.
          </p>
        </header>

        <div className="mt-6 space-y-8">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-t border-neutral-100 pt-8 first:border-t-0 first:pt-0"
            >
              <h2 className="text-[1.25rem] font-semibold text-secondary-foreground sm:text-[1.35rem]">
                {section.title}
              </h2>
              <div className="mt-3 font-pangolin text-[1.05rem] leading-relaxed text-foreground/95 sm:text-[1.1rem]">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 space-y-4 border-t border-neutral-100 pt-5 text-[0.95rem] text-neutral-500 sm:text-[1rem]">
          <p className="font-pangolin text-foreground/80">
            See also{" "}
            <Link
              href="/faq"
              className="font-medium text-foreground underline decoration-health-bar-sage/60 underline-offset-2 transition hover:text-health-bar-sage"
            >
              FAQ
            </Link>
            ,{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline decoration-health-bar-sage/60 underline-offset-2 transition hover:text-health-bar-sage"
            >
              privacy policy
            </Link>
            , and{" "}
            <Link
              href="/terms"
              className="font-medium text-foreground underline decoration-health-bar-sage/60 underline-offset-2 transition hover:text-health-bar-sage"
            >
              terms of use
            </Link>
            .
          </p>
          <p>
            built & illustrated with ✿ by{" "}
            <a
              href="https://instagram.com/jen__jpeg"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition hover:text-health-bar-sage"
            >
              jen-jpeg
            </a>
          </p>
        </footer>
      </article>
    </main>
  );
}

export function PlaceholderSection() {
  return (
    <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 italic text-neutral-500">
      Content to be added.
    </p>
  );
}
