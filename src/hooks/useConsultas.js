import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/Api";

export function useConsultas() {
  return useQuery({
    queryKey: ["consultas"],
    queryFn: () => apiFetch("/api/consultas"),
  });
}

export function useAgendarConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form) => apiFetch("/api/consultas", { method: "POST", body: form }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consultas"] }),
  });
}

export function useReagendarConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => apiFetch(`/api/consultas/${id}`, { method: "PUT", body: form }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consultas"] }),
  });
}

export function useConfirmarConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => apiFetch(`/api/consultas/${id}/confirmar`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consultas"] }),
  });
}

export function useCancelarConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }) => apiFetch(`/api/consultas/${id}/cancelar`, { method: "POST", body: { motivo } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consultas"] }),
  });
}

export function useConcluirConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observacao }) => apiFetch(`/api/consultas/${id}/concluir`, { method: "POST", body: { observacao } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["consultas"] }),
  });
}