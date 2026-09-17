import Link from "next/link";

export function LegalFooterLinks() {
  return (
    <nav aria-label="Legal" className="flex items-center gap-3 font-mono text-[11px] font-bold uppercase">
      <Link
        href="/privacy"
        className="underline decoration-2 underline-offset-4 hover:bg-[#FFE600] hover:text-black"
      >
        Privacy
      </Link>
      <span aria-hidden="true">//</span>
      <Link
        href="/terms"
        className="underline decoration-2 underline-offset-4 hover:bg-[#FFE600] hover:text-black"
      >
        Terms
      </Link>
    </nav>
  );
}
