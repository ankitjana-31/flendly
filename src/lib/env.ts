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

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
});

const serverEnv = serverEnvSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
});

export const env = {
  supabaseUrl: publicEnv.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
  // Server-only. Never referenced from client components or anything under
  // NEXT_PUBLIC_*. Used exclusively by the /api/cron/deadline-reminders
  // route to invoke the privileged send_deadline_reminders() job function.
  supabaseServiceRoleKey: serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  cronSecret: serverEnv.CRON_SECRET,
};
