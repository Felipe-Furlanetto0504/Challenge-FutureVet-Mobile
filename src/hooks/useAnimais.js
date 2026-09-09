import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/Api";

export function useAnimais() {
  return useQuery({
    queryKey: ["animais"],
    queryFn: () => apiFetch("/api/animais"),
  });
}

export function useCriarAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form) => apiFetch("/api/animais", { method: "POST", body: form }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["animais"] }),
  });
}

export function useExcluirAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFetch(`/api/animais/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["animais"] }),
  });
}