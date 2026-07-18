import { createBrowserClient } from "@supabase/ssr";

// Client component usage: `const supabase = createClient()` inside a
// "use client" component. Safe to call on every render — createBrowserClient
// reuses the same underlying instance.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
