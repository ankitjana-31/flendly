import Link from "next/link";
import { GalleryHeading } from "@/components/threeui/gallery-heading";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="font-heading text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="font-heading text-xl font-bold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      {/* 3D Animation for when page fails to load */}
      <div className="absolute inset-0 w-full h-full">
        <GalleryHeading
          headline={{
            line1: "PAGE NOT",
            line2: "FOUND",
          }}
          className="w-full h-full"
        />
      </div>
      <div className="relative z-10">
        <Link
          href="/dashboard"
          className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
