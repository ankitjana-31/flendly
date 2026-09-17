import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HandCoins, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Flendly | Who Lends Who?",
  description:
    "Learn how Flendly helps anyone lend money to friends while tracking loans, repayments, and money owed through clear peer-to-peer lending records.",
  alternates: { canonical: "/learn-more/lending" },
};

const steps = [
  "Choose who you want to help and set the amount.",
  "Agree on the due date, interest, and note together.",
  "Track repayments and keep the full history in one place.",
];

export default function LendingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-8 text-black dark:bg-[#0F1117] dark:text-white sm:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/learn-more" className="font-mono text-xs font-bold uppercase underline decoration-2 underline-offset-4 hover:bg-[#FFE600] hover:text-black">
          &lt;- Back to Learn More
        </Link>

        <header className="mt-8 border-b-[3px] border-black pb-8 dark:border-white">
          <p className="font-mono text-xs font-bold uppercase text-[#059669] dark:text-[#2DD4BF]">LENDING MODE // OPEN TO EVERYONE</p>
          <h1 className="mt-2 max-w-3xl font-mono text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Anyone can become a lender.
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-base leading-7 text-gray-700 dark:text-gray-300">
            You do not need to be a bank to help a friend, split a cost, or give someone breathing room. Flendly turns an informal promise into a clear track both people can understand.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="border-[2px] border-black bg-[#2DD4BF] p-5 shadow-[3px_3px_0_0_#000]">
            <HandCoins className="h-7 w-7" />
            <h2 className="mt-4 font-mono text-lg font-black uppercase">Lend to friends</h2>
            <p className="mt-2 font-sans text-sm leading-6">Support someone you know while keeping the amount and promise visible.</p>
          </div>
          <div className="border-[2px] border-black bg-[#FFE600] p-5 text-black shadow-[3px_3px_0_0_#000]">
            <ShieldCheck className="h-7 w-7" />
            <h2 className="mt-4 font-mono text-lg font-black uppercase">Agree clearly</h2>
            <p className="mt-2 font-sans text-sm leading-6">Set terms together before the agreement becomes an active loan.</p>
          </div>
          <div className="border-[2px] border-black bg-[#2563EB] p-5 text-white shadow-[3px_3px_0_0_#000]">
            <CheckCircle2 className="h-7 w-7" />
            <h2 className="mt-4 font-mono text-lg font-black uppercase">Track fairly</h2>
            <p className="mt-2 font-sans text-sm leading-6">Log repayments and see what remains without awkward calculations.</p>
          </div>
        </section>

        <section className="mt-8 border-[2px] border-black bg-white p-6 shadow-[4px_4px_0_0_#000] dark:border-white dark:bg-[#161821] sm:p-8">
          <h2 className="font-mono text-xl font-black uppercase">How lending works</h2>
          <ol className="mt-5 space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 font-sans text-sm leading-6 text-gray-700 dark:text-gray-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center border-[2px] border-black bg-[#F43F5E] font-mono font-black text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Link href="/auth/login" className="mt-7 inline-flex items-center gap-2 border-[2px] border-black bg-[#FFE600] px-5 py-3 font-mono text-xs font-black uppercase text-black shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 hover:bg-yellow-300">
            Start a lending record <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mt-6 max-w-3xl font-mono text-xs leading-6 text-gray-600 dark:text-gray-400">
          Flendly records agreements; it does not guarantee repayment or replace legal, financial, or tax advice. Make agreements responsibly and follow the laws that apply to you.
        </p>
      </div>
    </main>
  );
}
