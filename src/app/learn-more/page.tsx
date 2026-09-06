import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F8FAFC] overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4 backdrop-blur-xl border-b border-[#1E2935]/80 bg-[#0B0F14]/80">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-400 to-blue-500 font-heading text-base font-bold text-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <span className="font-brand text-2xl font-bold tracking-wider text-white group-hover:text-teal-300 transition-colors">
            FLENDLY
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#60A5FA] text-[#0B0F14] text-sm font-bold shadow-lg shadow-teal-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
        {/* Animated grid background */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(rgba(45,212,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.3) 1px, transparent 1px)`,
            backgroundSize: "48px 48px"
          }}
        />
        
        {/* Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-br from-teal-500/15 via-blue-600/15 to-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

          <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight mb-8">
            <span className="block text-white">No awkward chats.</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#2DD4BF] via-[#60A5FA] to-[#C084FC]">
              Just bulletproof clarity.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed text-[#94A3B8] mb-12">
            Flendly eliminates the tension when lending or borrowing with your inner circle. 
            Send requests, lock terms, track micro-repayments, and keep a shared single source of truth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#60A5FA] px-8 text-base font-bold text-[#0B0F14] transition-all hover:shadow-2xl hover:shadow-teal-500/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Free
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex h-14 items-center justify-center rounded-xl border border-[#1E2935] bg-[#111820]/80 backdrop-blur px-8 text-base font-semibold text-white transition-all hover:bg-[#1E2935] hover:border-teal-500/30"
            >
              Back to Landing
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="relative z-10 border-y border-[#1E2935] bg-[#111820]/90 backdrop-blur-xl py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "100% Private", label: "Encrypted & isolated with Supabase RLS" },
            { value: "Zero Drama", label: "No unrecorded handoffs or forgotten debts" },
            { value: "Realtime Sync", label: "Live updates as soon as payments land" },
            { value: "Self Track", label: "Standalone offline & cash tracker included" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-300">{stat.value}</p>
              <p className="text-xs sm:text-sm text-[#94A3B8]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Pillars */}
      <section className="relative py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#2DD4BF] text-xs font-bold tracking-widest uppercase mb-3 block">Architecture</span>
            <h2 className="font-heading text-3xl sm:text-5xl font-black text-white">How Flendly Solves The Lending Dilemma</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-[#1E2935] bg-gradient-to-b from-[#111820] to-[#0B0F14] p-8 relative overflow-hidden group hover:border-teal-500/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 text-xl font-bold mb-6">
                01
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Structured Mutual Agreements</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Skip vague verbal promises. Send a clean loan request with exact amount, payback schedule, and optional interest rate. Both parties agree before it activates.
              </p>
            </div>

            <div className="rounded-3xl border border-[#1E2935] bg-gradient-to-b from-[#111820] to-[#0B0F14] p-8 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xl font-bold mb-6">
                02
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Counter-Offers & Negotiations</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Friend needs ₹10,000 but you can only spare ₹6,000? Hit them back with a custom counter-offer in seconds without having to draft awkward text excuses.
              </p>
            </div>

            <div className="rounded-3xl border border-[#1E2935] bg-gradient-to-b from-[#111820] to-[#0B0F14] p-8 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xl font-bold mb-6">
                03
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Dual-Approval Payment Proofs</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                When installments are sent via UPI or cash, submit a payment record. Once the other person confirms receipt, the balance auto-updates in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive: Self Track */}
      <section className="relative py-24 bg-[#111820]/70 border-y border-[#1E2935]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                Standalone Feature
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-white mb-6">
                Self Track: For Everything Outside Flendly Deals
              </h2>
              <p className="text-[#94A3B8] text-base leading-relaxed mb-6">
                Lent ₹500 for groceries to your roommate? Paid ₹1,200 for concert tickets? 
                Self Track is your private personal vault. It never sends requests, never notifies third parties, and is completely isolated to your account.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</div>
                  <p className="text-sm text-[#F8FAFC]"><strong>Partial Repayment Logs:</strong> Record repayments bit-by-bit with instant remaining balance computations.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</div>
                  <p className="text-sm text-[#F8FAFC]"><strong>Personal Notes & Context:</strong> Attach quick reminders for upcoming settles or cash exchanges.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 text-xs">✓</div>
                  <p className="text-sm text-[#F8FAFC]"><strong>100% Private:</strong> Guaranteed isolation via custom Supabase Row Level Security.</p>
                </div>
              </div>
            </div>

            {/* Interactive Mockup Visual */}
            <div className="rounded-3xl border border-[#1E2935] bg-[#0B0F14] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E2935]">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Live Preview · Self Track</span>
                <span className="text-xs text-[#94A3B8]">Active Records</span>
              </div>

              <div className="rounded-2xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">Lent</span>
                    <h4 className="font-bold text-white text-base mt-1">₹5,000 to Ananya</h4>
                    <p className="text-xs text-[#94A3B8]">Trip fuel & tolls</p>
                  </div>
                  <span className="text-sm font-bold text-teal-400">₹2,000 left</span>
                </div>
                <div className="w-full bg-[#1E2935] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[60%]" />
                </div>
                <div className="flex justify-between text-[11px] text-[#94A3B8]">
                  <span>Paid: ₹3,000 (60%)</span>
                  <span className="text-teal-400 font-medium">1 payment logged</span>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">Borrowed</span>
                    <h4 className="font-bold text-white text-base mt-1">₹3,500 from Siddharth</h4>
                    <p className="text-xs text-[#94A3B8]">Gym annual split</p>
                  </div>
                  <span className="text-sm font-bold text-rose-400">₹3,500 left</span>
                </div>
                <div className="w-full bg-[#1E2935] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-rose-500 to-red-400 h-full w-[0%]" />
                </div>
                <div className="flex justify-between text-[11px] text-[#94A3B8]">
                  <span>Pending full settlement</span>
                  <span className="text-rose-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center px-6">
        <h2 className="font-heading text-4xl sm:text-6xl font-black text-white mb-6">
          Ready to make money exchanges smooth?
        </h2>
        <p className="text-[#94A3B8] text-lg max-w-xl mx-auto mb-10">
          Setup takes under 30 seconds. Link with Google and start keeping things organized.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#2DD4BF] to-[#60A5FA] px-10 text-base font-bold text-[#0B0F14] transition-all hover:scale-105 shadow-xl shadow-teal-500/20"
        >
          Sign Up Now
        </Link>
      </section>
    </div>
  );
}
