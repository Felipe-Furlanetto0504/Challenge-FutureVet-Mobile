import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/Api";
import { exibirAvisosNovos } from "../services/notificacoes";
import { useSessao } from "./useAuth";

const INTERVALO = 20_000; 


export function useNotificacoes() {
  const { data: sessao } = useSessao();
  const usuarioId = sessao?.usuario?.usuarioId;

  const consulta = useQuery({
    queryKey: ["notificacoes", usuarioId],
    queryFn: () => apiFetch("/api/notificacoes"),
    enabled: !!sessao?.token && !!usuarioId,
    refetchInterval: INTERVALO,
  });

  useEffect(() => {
    if (consulta.data) {
      exibirAvisosNovos(usuarioId, consulta.data).catch((erro) =>
        console.warn("[notificacoes]", erro?.message)
      );
    }
  }, [consulta.data, usuarioId]);

  return consulta;
}
