import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Flendly",
  description: "The terms that apply when you use Flendly.",
};

const sections = [
  {
    title: "Using Flendly",
    body: "Flendly is a record-keeping and coordination tool for people who choose to lend, borrow, split expenses, or track informal IOUs. You must provide accurate information, keep your account secure, and use the service only for lawful purposes.",
  },
  {
    title: "Your agreements",
    body: "Flendly does not create, guarantee, collect, or enforce a loan between users. A request, offer, acceptance, payment record, or reminder is information entered or confirmed by users. You are responsible for reviewing terms with the other participant and complying with applicable law.",
  },
  {
    title: "Not financial or legal advice",
    body: "The app's calculations, reminders, summaries, and educational material are general tools and are not financial, legal, tax, credit, or investment advice. Get independent professional advice when your situation requires it.",
  },
  {
    title: "Acceptable use",
    body: "Do not impersonate another person, misuse another user's information, attempt to bypass access controls, upload malicious content, abuse notifications, or use Flendly for fraud, harassment, unlawful lending, or unlawful debt collection.",
  },
  {
    title: "Availability and changes",
    body: "We may improve, suspend, or change parts of Flendly to maintain the service, address security issues, or comply with law. We do not guarantee uninterrupted availability or that every record will be error-free. We will publish material changes to these terms on this page.",
  },
  {
    title: "Contact",
    body: "For questions about these terms or a security concern, use the developer contact email shown in the Google consent screen. Include enough detail for us to understand the issue, but do not send passwords, tokens, or private financial information by email.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8 text-black dark:bg-[#0F1117] dark:text-white sm:px-6 md:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-mono text-xs font-bold uppercase underline decoration-2 underline-offset-4 hover:bg-[#FFE600] hover:text-black">
          &lt;- Back to Flendly
        </Link>
        <header className="mt-8 border-b-[3px] border-black pb-6 dark:border-white">
          <p className="font-mono text-xs font-bold uppercase text-[#F43F5E]">PUBLIC DOCUMENT // TERMS</p>
          <h1 className="mt-2 font-mono text-3xl font-black uppercase tracking-tight sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 font-sans text-sm text-gray-700 dark:text-gray-300">Last updated: September 18, 2026</p>
        </header>

        <div className="mt-8 space-y-4">
          <p className="border-[2px] border-black bg-[#2DD4BF] p-4 font-mono text-sm font-bold shadow-[3px_3px_0_0_#000]">
            By using Flendly, you agree to use it honestly and understand that your agreements with other people remain your responsibility.
          </p>
          {sections.map((section) => (
            <section key={section.title} className="border-[2px] border-black bg-white p-5 shadow-[3px_3px_0_0_#000] dark:border-white dark:bg-[#161821] sm:p-6">
              <h2 className="font-mono text-lg font-black uppercase">{section.title}</h2>
              <p className="mt-2 font-sans text-sm leading-7 text-gray-700 dark:text-gray-300">{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="mt-8 border-t-[2px] border-black pt-5 font-mono text-xs dark:border-white/40">
          Please review these terms alongside the Privacy Policy before using the service.
        </footer>
      </div>
    </main>
  );
}
