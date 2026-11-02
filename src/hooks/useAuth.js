import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, salvarSessao, limparSessao, lerSessao } from "../services/Api";
import { limparNotificacoes } from "../services/notificacoes";

export function useSessao() {
  return useQuery({
    queryKey: ["sessao"],
    queryFn: lerSessao,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, senha }) =>
      apiFetch("/api/auth/login", { method: "POST", body: { email, senha }, comAuth: false }),
    onSuccess: async (resposta) => {
      await salvarSessao(resposta.token, resposta);
      queryClient.setQueryData(["sessao"], { token: resposta.token, usuario: resposta });
    },
  });
}

export function useRegistro() {
  return useMutation({
    mutationFn: (dados) =>
      apiFetch("/api/auth/registro", { method: "POST", body: dados, comAuth: false }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await limparNotificacoes().catch(() => {});
      await limparSessao();
    },
    onSuccess: () => {
      queryClient.setQueryData(["sessao"], { token: null, usuario: null });
      queryClient.clear();
    },
  });
}