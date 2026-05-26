"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/types";
import type { UserRole } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  realRole: UserRole;
  isSimulating: boolean;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: "operator",
  realRole: "operator",
  isSimulating: false,
  simulatedRole: null,
  setSimulatedRole: () => {},
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      if (user) {
        loadProfile(user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        loadProfile(newUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(data as UserProfile | null);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const realRole = (profile?.role as UserRole) || "operator";
  const isSimulating = simulatedRole !== null && realRole === "admin";
  const role = isSimulating ? simulatedRole! : realRole;

  return (
    <AuthContext.Provider value={{
      user, profile, role, realRole, isSimulating, simulatedRole,
      setSimulatedRole, loading, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
