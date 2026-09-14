"use client";

import { useFormStatus } from "react-dom";

export function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <div className="relative">
      <button
        type="submit"
        disabled={pending}
        className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden border-[2.5px] border-black bg-white dark:bg-[#1E212D] px-6 font-mono text-sm font-bold text-black dark:text-white shadow-[4px_4px_0_0_#000000] dark:shadow-[4px_4px_0_0_#FFE600] transition-all hover:bg-[#FFE600] dark:hover:bg-[#FFE600] hover:text-black dark:hover:text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {/* Subtle sleek glass sheen reflection on hover */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" 
        />

        {pending ? (
          <>
            <svg className="h-5 w-5 animate-spin text-black dark:text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="font-mono text-xs tracking-wider uppercase font-bold">CONNECTING_SESSION…</span>
          </>
        ) : (
          <>
            <div className="flex h-7 w-7 items-center justify-center border border-black bg-white shadow-[1px_1px_0_0_#000000] transition-transform group-hover:scale-105">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3a7.4 7.4 0 0 1-4.07 1.16c-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.29A7.2 7.2 0 0 1 4.88 12c0-.8.14-1.57.39-2.29v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.1z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z"
                />
              </svg>
            </div>
            <span className="font-mono text-sm uppercase tracking-wide font-bold">
              CONTINUE WITH GOOGLE
            </span>
          </>
        )}
      </button>
    </div>
  );
}
