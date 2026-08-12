import type { Metadata } from "next";
import LegalDocumentPage from "../components/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy Policy · buds",
  description: "Privacy policy for Buds — the friendship health tracker.",
};

const LAST_UPDATED = "August 11, 2026";
const SUPPORT_EMAIL = "buds@JEN-JPEG.COM";

function EmailLink() {
  return <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
}

const intro = (
  <p>
    Buds is a playful friendship health tracker operated by JPEG DEV LLC
    (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy
    describes how the Buds website and mobile app handle information. In short:
    your garden stays on your device. We have no accounts or login, and we do 
    not collect your friend data.
  </p>
);

const PRIVACY_SECTIONS = [
  {
    id: "data-we-process",
    title: "1. Data we process",
    content: (
      <>
        <p>
          <strong>Information you provide.</strong> You may enter friend display
          names, relationship preferences (such as how often you want to stay in
          touch), care history (chats, calls, visits), plans, custom dates,
          notes, and contact details you type in yourself (phone, email, or
          social handles). All this data is stored locally on your device only, we 
          never access it.
        </p>
        <p>
          <strong>Information from import.</strong> If you paste JSON exported
          from the Buds website into the mobile app, that data is stored locally
          in the same categories as above. Nothing is uploaded during import.
        </p>
        <p>
          <strong>What we do not access.</strong> Buds does not read your device
          address book, system calendar, precise location, photos, microphone, or
          automatically sync contacts.
        </p>
        <p>
          <strong>No accounts.</strong> Buds does not require a login. We do not
          create user accounts or store passwords.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "2. How we use information",
    content: (
      <>
        <p>
          Information you enter is used only to run Buds on your device: to show
          your garden, calculate friendship health, schedule local reminders,
          display your plans and dates, power the iOS home-screen widget, and
          open contact actions when you tap them.
        </p>
        <p>
          We do not sell your data, use it for advertising, or profile you for
          ads. The current versions of Buds do not include analytics, crash
          reporting, or advertising SDKs.
        </p>
      </>
    ),
  },
  {
    id: "where-data-is-stored",
    title: "3. Where data is stored",
    content: (
      <>
        <p>
          On the website, your garden is stored in your browser&apos;s local
          storage. On the mobile app, it is stored in on-device app storage. On
          iOS, a limited snapshot (such as friend names, flower type, health,
          and plans) may also be shared with the Buds widget through an on-device
          App Group so the widget can update.
        </p>
        <p>
          Buds does not operate a cloud backup or sync service in the current
          version. Your device&apos;s own backup features (for example, iCloud
          Backup or Android backup) may include app data as part of a full
          device backup—that is controlled by your operating system, not by
          Buds.
        </p>
        <p>
          You can delete individual buds in the app, use Clear all data in
          Settings, or uninstall the app. Uninstalling removes Buds&apos; local
          data from that device.
        </p>
      </>
    ),
  },
  {
    id: "notifications",
    title: "4. Notifications",
    content: (
      <>
        <p>
          The mobile app can schedule local notifications on your device (for
          example, friendship health reminders or upcoming plans). These
          notifications are created and delivered on your device only. Buds does
          not use remote push notifications or send your reminder data to a Buds
          server.
        </p>
        <p>
          Notification text may include friend names you entered. You can turn
          notifications off in Buds Settings or in your device system settings.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "5. Children",
    content: (
      <p>
        Buds is not directed at children under 13 (or the equivalent minimum age
        in your region). We do not knowingly collect personal information from
        children. If you believe a child has provided information through Buds
        support channels, contact us and we will help address it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "6. Changes to this policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last
        updated&quot; date at the top will change when we do. If we add features
        that collect or share data differently—such as accounts, cloud sync,
        subscriptions, or analytics—we will update this policy before those
        features go live.
      </p>
    ),
  },
  {
    id: "contact",
    title: "7. Contact us",
    content: (
      <>
        <p>
          Questions about this Privacy Policy or Buds privacy practices? Email{" "}
          <EmailLink />.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title=".✦ ݁˖ privacy policy ⋆˚✿˖°"
      description="How Buds handles your information on the web and in the mobile app."
      lastUpdated={LAST_UPDATED}
      intro={intro}
      sections={PRIVACY_SECTIONS}
    />
  );
}
