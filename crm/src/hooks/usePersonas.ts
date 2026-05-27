"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Persona, PersonaInsert } from "@/lib/types";

function useTeamFilter() {
  const { profile, role } = useAuth();
  return role === "admin" ? null : profile?.team || null;
}

export function usePersonaList() {
  const team = useTeamFilter();

  return useQuery({
    queryKey: ["personas", { team }],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("personas")
        .select("*")
        .order("created_at", { ascending: false });

      if (team) query = query.eq("team", team);

      const { data, error } = await query;
      if (error) throw error;
      return (data as Persona[]) || [];
    },
  });
}

export function usePersona(id: string) {
  return useQuery({
    queryKey: ["personas", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Persona;
    },
    enabled: !!id,
  });
}

export function useCreatePersona() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (persona: PersonaInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("personas")
        .insert({ ...persona, team: profile?.team || "china" })
        .select()
        .single();
      if (error) throw error;
      return data as Persona;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Persona> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("personas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Persona;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      queryClient.setQueryData(["personas", data.id], data);
    },
  });
}
