import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/Api";

export function useVacinas() {
  return useQuery({
    queryKey: ["vacinas"],
    queryFn: () => apiFetch("/api/vacinas"),
  });
}

export function useCriarVacina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form) => apiFetch("/api/vacinas", { method: "POST", body: form }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vacinas"] }),
  });
}

export function useAtualizarVacina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => apiFetch(`/api/vacinas/${id}`, { method: "PUT", body: form }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vacinas"] }),
  });
}

export function useExcluirVacina() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFetch(`/api/vacinas/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vacinas"] }),
  });
}