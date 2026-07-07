import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[auth] profile fetch failed:", error.message);
    return null;
  }

  return data as Profile | null;
}

export function useAuthBootstrap() {
  const { setSession, setProfile, setHydrated, reset } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function hydrate(session: Session | null) {
      if (!mounted) return;
      setSession(session);

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) setProfile(profile);
      } else {
        reset();
      }

      if (mounted) setHydrated(true);
    }

    if (!isSupabaseConfigured) {
      setHydrated(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await hydrate(session);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [reset, setHydrated, setProfile, setSession]);
}
