import type { Metadata } from "next";
import LegalDocumentPage, {
  PlaceholderSection,
} from "../components/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy Policy · buds",
  description: "Privacy policy for Buds — the friendship health tracker.",
};

const LAST_UPDATED = "July 4, 2026";

const PRIVACY_SECTIONS = [
  { id: "introduction", title: "1. Introduction" },
  { id: "data-we-process", title: "2. Data we process" },
  { id: "how-we-use-information", title: "3. How we use information" },
  { id: "where-data-is-stored", title: "4. Where data is stored" },
  { id: "sharing-and-third-parties", title: "5. Sharing and third parties" },
  { id: "children", title: "6. Children" },
  { id: "your-rights", title: "7. Your rights" },
  { id: "international-transfers", title: "8. International transfers" },
  { id: "retention", title: "9. Retention" },
  { id: "security", title: "10. Security" },
  { id: "changes", title: "11. Changes to this policy" },
  { id: "contact", title: "12. Contact us" },
].map((section) => ({
  ...section,
  content: <PlaceholderSection />,
}));

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title=".✦ ݁˖ privacy policy ⋆˚✿˖°"
      description="How Buds handles your information on the web and in the mobile app."
      lastUpdated={LAST_UPDATED}
      sections={PRIVACY_SECTIONS}
    />
  );
}
