import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

const publicEnv = publicEnvSchema
  .refine(
    (env) =>
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      message:
        "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    },
  )
  .parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

export const env = {
  supabaseUrl: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
};
