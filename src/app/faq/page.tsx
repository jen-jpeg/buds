import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FAQ · buds",
  description:
    "Frequently asked questions about Buds — the friendship health tracker for web and mobile.",
};

type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type FaqSection = {
  title: string;
  items: FaqItem[];
};

const SUPPORT_EMAIL = "jpegs.buds@gmail.com";

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: "About Buds",
    items: [
      {
        id: "what-is-buds",
        question: "What is Buds?",
        answer: (
          <>
            Buds is a playful friendship health tracker meant to help you be more intentional about the relationships you care about. You
            plant each friend as a flower bud and keep them healthy by staying in
            touch. Health slowly fades when you go too long without connecting, and
            you can log chats, calls, and in-person visits to bring it back up!
          </>
        ),
      },
      {
        id: "health-scores",
        question: "What do the flowers and health scores mean?",
        answer:
          "Each bud has a health score from 0–100. Health decreases a little each day based on how often you want to see that friend — roughly 25 points per full interval with no care. Watering, calling, and in-person visits raise health back up. Wilting flowers are a gentle reminder to reach out and maintain that relationship.",
      },
      {
        id: "is-buds-free",
        question: "Is Buds free?",
        answer: (
          <>
            The Buds website at{" "}
            <Link
              href="/"
              className="font-medium text-foreground underline decoration-health-bar-sage/60 underline-offset-2 transition hover:text-health-bar-sage"
            >
              flower-buds.vercel.app
            </Link>{" "}
            is free to use in your browser. The mobile app is also free to download. Certain features can be unlocked with a subscription or lifetime purchase ofBuds Pro.
          </>
        ),
      },
      {
        id: "account-required",
        question: "Do I need an account?",
        answer:
          "No. Buds does not require a login. Your garden lives directly on your device, but you can export your data.",
      },
    ],
  },
  {
    title: "Data and privacy",
    items: [
      {
        id: "where-is-data-stored",
        question: "Where is my data stored?",
        answer:
          "On your device only. The website saves data in your browser's local storage. The mobile app saves data locally on your phone. Buds does not access your friend data or upload it anywhere.",
      },
      {
        id: "contacts-calendar",
        question: "Does Buds read my phone contacts or calendar?",
        answer:
          "No. You enter friend names and contact details yourself. Buds does not access your address book, calendar, or photo library.",
      },
      {
        id: "sell-data-ads",
        question: "Does Buds sell my data or show ads?",
        answer:
          "No. Buds does not sell your personal information and does not show third-party ads.",
      },
      {
        id: "other-users-see-friends",
        question: "Can other Buds users see my friends?",
        answer:
          "No. There is no server that allows for users to see each other's gardens, since data is stored directly on your device.",
      },
      {
        id: "delete-data",
        question: "How do I delete my data?",
        answer: (
          <>
            Uninstalling the app will delete all your data. The mobile app also provides an option to clear your data and start fresh. See our{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline decoration-health-bar-sage/60 underline-offset-2 transition hover:text-health-bar-sage"
            >
              privacy policy
            </Link>{" "}
            for more detail.
          </>
        ),
      }
    ],
  },
  {
    title: "Using the mobile app",
    items: [
      {
        id: "data-import",
        question: "Can I import my data from the website to the mobile app?",
        answer:
          "Yes. Click \"edit\" in the website and copy the full JSON data. In the mobile app, click settings->import from the home screen and paste the entire JSON array. Buds with IDs you already have are skipped; new buds are added to the app. Note: data cannot be imported back from the mobile app to the website.",
      },
      {
        id: "water-fertilize-call",
        question: 'What is "water" vs "sun" vs "fertilize"?',
        answer: (
          <>
            <strong>Water</strong> means you chatted with that bud this week or had a small interaction. <strong>Sun</strong> is for logging phone
            or video calls. <strong>Fertilize</strong> is for in-person
            hangouts, which boosts bud health the most.
          </>
        ),
      }
    ],
  },
  {
    title: "Notifications and widgets",
    items: [
      {
        id: "notification-permission",
        question: "Why does Buds need notification permission?",
        answer:
          "Only for local reminders you choose — for example, nudges to water a bud or follow up on a planned hangout. Buds does not send remote push notifications from a server in the current version.",
      },
      {
        id: "home-screen-widget",
        question: "What appears on the home screen widget?",
        answer:
          "The iOS widget shows a snapshot of your garden — friend names and health — so you can glance at who might need care. Widget data is written locally by the app. Remove the widget anytime from your home screen like any other widget.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        id: "invalid-json",
        question: 'Import says "Invalid JSON" — what should I copy?',
        answer: (
          <>
            Copy the <strong>entire</strong> export from the website JSON editor —
            it should start with <code>[</code> and end with <code>]</code>. Partial
            copies, trailing commas, or edited fragments will fail. If you see
            "Wrong format," the paste is valid JSON but not a bud array.
          </>
        ),
      },
      {
        id: "lost-data-reinstall",
        question: "I lost my data after reinstalling — can you recover it?",
        answer:
          "Your data only lives on your device, so we cannot restore your garden from our side. If you exported JSON from the website before reinstalling, paste it back into the app. Regular exports are the best safety net.",
      },
      {
        id: "contact-support",
        question: "How do I contact support?",
        answer: (
          <>
            Send an email to{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-foreground underline decoration-health-bar-sage/60 underline-offset-2 transition hover:text-health-bar-sage"
            >
              {SUPPORT_EMAIL}
            </a>
            . We'll try to get back to you as soon as possible.
          </>
        ),
      },
    ],
  },
]
const LAST_UPDATED = "July 4, 2026";

export default function FaqPage() {
  return (
    <main className="mx-auto w-[90%] max-w-4xl px-2 pb-16 pt-4 sm:px-6 sm:pt-6">
      <article className="rounded-xl border border-neutral-200 bg-white p-5 shadow-lg sm:p-8">
        <header className="border-b border-neutral-100 pb-5">
          <h1 className="text-[1.75rem] font-bold leading-snug text-secondary-foreground sm:text-[2rem]">
            frequently asked questions ✿
          </h1>
          <p className="mt-3 font-pangolin text-[1.05rem] leading-snug text-foreground sm:text-[1.15rem]">
            Last updated{" "}
            {LAST_UPDATED}.
          </p>
        </header>

        <div className="mt-6 space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <section
              key={section.title}
              aria-labelledby={`faq-section-${section.title}`}
            >
              <h2
                id={`faq-section-${section.title}`}
                className="text-[1.35rem] font-semibold text-secondary-foreground sm:text-[1.5rem]"
              >
                {section.title}
              </h2>
              <div className="mt-4 space-y-0">
                {section.items.map((item) => (
                  <details
                    key={item.id}
                    id={item.id}
                    className="group scroll-mt-28 border-t border-neutral-100 first:border-t-0"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-5 font-pangolin text-[1.1rem] font-medium leading-snug text-foreground transition hover:text-health-bar-sage sm:text-[1.2rem] [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden
                        className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400 transition group-open:rotate-180"
                        fill="currentColor"
                      >
                        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                      </svg>
                    </summary>
                    <div className="pb-5 font-pangolin text-[1.05rem] leading-relaxed text-foreground/95 sm:text-[1.1rem]">
                      {item.answer}
                    </div>
                  </details>
                ))}
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
