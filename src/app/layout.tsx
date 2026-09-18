import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans, Syne } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://flendly.in"),
  title: "Flendly | Who Lends Who?",
  icons: {
    icon: "/brand/flendly-symbol.svg",
    apple: "/brand/flendly-symbol.svg",
  },
  description:
    "Flendly is a Gen Z-friendly money tracker for friends: track money between friends, lendings, borrowed money, repayments, loans, and personal money owed. Go beyond split-bill apps with peer-to-peer lending and debt tracking.",
  keywords: [
    "money tracker for friends",
    "track money between friends",
    "loan tracker",
    "debt tracker",
    "debt tracking app",
    "repayment tracker",
    "money owed tracker",
    "track loans between friends",
    "lend money to friends",
    "borrowed money tracker",
    "personal loan tracker",
    "peer-to-peer lending",
    "debt tracking",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    url: "https://flendly.in/",
    siteName: "Flendly",
    title: "Flendly | Who Lends Who?",
    description:
      "Track lending, borrowing, repayments, loans, and personal money owed between friends with Flendly, a peer-to-peer lending and debt tracking app.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Flendly | Who Lends Who?",
    description:
      "A Gen Z-friendly money, loan, repayment, and debt tracker for people managing money between friends.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable} ${syne.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={["light", "dark", "ocean", "sunset", "tropical"]}
            enableSystem={false}
            disableTransitionOnChange
          >
          {children}
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Flendly",
              url: "https://flendly.in/",
              description:
                "A peer-to-peer lending and debt tracking app for tracking money, loans, repayments, and personal money owed between friends.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              featureList: [
                "Track money between friends",
                "Track lending and borrowing",
                "Track repayments and money owed",
                "Personal loan and debt tracking",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
