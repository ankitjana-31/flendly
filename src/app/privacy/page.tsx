import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Flendly",
  description: "How Flendly collects, uses, and protects account and lending records.",
};

const sections = [
  {
    title: "What we collect",
    body: "When you sign in, we receive basic account details from Google, such as your name, email address, and profile image. We also store the lending requests, offers, loans, payments, notifications, and private ledger records that you choose to create in Flendly.",
  },
  {
    title: "How we use information",
    body: "We use this information to authenticate you, operate the peer-lending workflow, calculate and display records, send in-app notifications, protect the service, and respond to support requests. We do not sell personal information or use private ledger records to contact other people.",
  },
  {
    title: "Sharing and visibility",
    body: "Information is shared only as needed to run a feature you use. Participants can see the request, offer, loan, and payment details relevant to their shared agreement. Your private ledger is scoped to your account and is not sent to counterparties. We may disclose information when required by law or to protect the service and its users.",
  },
  {
    title: "Storage and security",
    body: "Flendly uses Supabase for authentication and database storage. We use authenticated sessions, row-level access rules, and server-side checks to restrict account data. No online service can promise absolute security, so keep your Google account secure and contact us promptly if you notice suspicious activity.",
  },
  {
    title: "Your choices",
    body: "You can update profile and visibility settings in the app, delete private ledger records, and request help with your account. You can stop using Flendly at any time. Some records may need to be retained where required for security, fraud prevention, legal obligations, or an active shared agreement.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8 text-black dark:bg-[#0F1117] dark:text-white sm:px-6 md:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-mono text-xs font-bold uppercase underline decoration-2 underline-offset-4 hover:bg-[#FFE600] hover:text-black">
          &lt;- Back to Flendly
        </Link>
        <header className="mt-8 border-b-[3px] border-black pb-6 dark:border-white">
          <p className="font-mono text-xs font-bold uppercase text-[#2563EB] dark:text-[#60A5FA]">PUBLIC DOCUMENT // PRIVACY</p>
          <h1 className="mt-2 font-mono text-3xl font-black uppercase tracking-tight sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 font-sans text-sm text-gray-700 dark:text-gray-300">Last updated: September 18, 2026</p>
        </header>

        <div className="mt-8 space-y-4">
          <p className="border-[2px] border-black bg-[#FFE600] p-4 font-mono text-sm font-bold shadow-[3px_3px_0_0_#000] dark:text-black">
            Flendly helps people keep clear records of money shared with people they know. This policy explains what we collect and how we handle it.
          </p>
          {sections.map((section) => (
            <section key={section.title} className="border-[2px] border-black bg-white p-5 shadow-[3px_3px_0_0_#000] dark:border-white dark:bg-[#161821] sm:p-6">
              <h2 className="font-mono text-lg font-black uppercase">{section.title}</h2>
              <p className="mt-2 font-sans text-sm leading-7 text-gray-700 dark:text-gray-300">{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="mt-8 border-t-[2px] border-black pt-5 font-mono text-xs dark:border-white/40">
          Questions about privacy? Contact the developer email listed in the Google consent screen.
        </footer>
      </div>
    </main>
  );
}
