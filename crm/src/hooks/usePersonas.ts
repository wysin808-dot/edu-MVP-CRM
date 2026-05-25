"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Persona, PersonaInsert } from "@/lib/types";

const supabase = createClient();

export function usePersonaList() {
  return useQuery({
    queryKey: ["personas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Persona[]) || [];
    },
  });
}

export function usePersona(id: string) {
  return useQuery({
    queryKey: ["personas", id],
    queryFn: async () => {
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

  return useMutation({
    mutationFn: async (persona: PersonaInsert) => {
      const { data, error } = await supabase
        .from("personas")
        .insert(persona)
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
