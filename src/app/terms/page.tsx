import type { Metadata } from "next";
import LegalDocumentPage, {
  PlaceholderSection,
} from "../components/legal-document-page";

export const metadata: Metadata = {
  title: "Terms of Use · buds",
  description: "Terms of use for Buds — the friendship health tracker.",
};

const LAST_UPDATED = "July 4, 2026";

const TERMS_SECTIONS = [
  { id: "introduction", title: "1. Introduction" },
  { id: "acceptance", title: "2. Acceptance of terms" },
  { id: "use-of-service", title: "3. Use of the service" },
  { id: "user-content", title: "4. Your content and data" },
  { id: "intellectual-property", title: "5. Intellectual property" },
  { id: "disclaimer", title: "6. Disclaimer of warranties" },
  {
    id: "limitation-of-liability",
    title: "7. Limitation of liability",
  },
  { id: "changes", title: "8. Changes to these terms" },
  { id: "governing-law", title: "9. Governing law" },
  { id: "contact", title: "10. Contact us" },
].map((section) => ({
  ...section,
  content: <PlaceholderSection />,
}));

export default function TermsOfUsePage() {
  return (
    <LegalDocumentPage
      title=".✦ ݁˖ terms of use ⋆˚✿˖°"
      description="Terms for using Buds on the web and in the mobile app."
      lastUpdated={LAST_UPDATED}
      sections={TERMS_SECTIONS}
    />
  );
}
