import { redirect } from "next/navigation";
import { getCurrentUserProfile, isPlaceholderUsername } from "@/lib/auth/queries";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HandshakeStoryScroll } from "@/components/landing/handshake-story-scroll";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TrustSection } from "@/components/landing/trust-section";
import { LenderSection } from "@/components/landing/lender-section";
import { BorrowerSection } from "@/components/landing/borrower-section";
import { NetworkSection } from "@/components/landing/network-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function Home() {
  const { user, profile } = await getCurrentUserProfile();

  if (user && isPlaceholderUsername(profile?.username)) {
    redirect("/complete-profile");
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-[#0B0F14] text-[#F8FAFC] selection:bg-teal-400 selection:text-[#0B0F14]">
      {/* Minimal Glass Navbar */}
      <LandingNavbar />

      <main>
        {/* Core 3D Interactive Handshake Storyline */}
        <HandshakeStoryScroll />

        {/* How It Works - 4 Step Lifecycle */}
        <HowItWorksSection />

        {/* Institutional Trust & Cryptographic Verification */}
        <TrustSection />

        {/* Lender Experience & Yield Simulator */}
        <LenderSection />

        {/* Borrower Experience & Proposal System */}
        <BorrowerSection />

        {/* P2P Network Liquidity & Growth Metrics */}
        <NetworkSection />

        {/* Final Cinematic Call to Action */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}