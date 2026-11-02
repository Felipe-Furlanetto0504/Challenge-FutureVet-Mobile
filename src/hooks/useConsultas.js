import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/Api";
import {
  agendarLembreteConsulta,
  cancelarLembreteConsulta,
  sincronizarLembretes,
} from "../services/notificacoes";

// Uma falha ao agendar o lembrete não pode desfazer a consulta já salva na API
function semTravar(promessa) {
  promessa.catch((erro) => console.warn("[notificacoes]", erro?.message));
}

function nomeDoPet(queryClient, animalId) {
  const pets = queryClient.getQueryData(["animais"]) || [];
  return pets.find((p) => p.id === animalId)?.nome || "seu pet";
}

export function useConsultas() {
  return useQuery({
    queryKey: ["consultas"],
    queryFn: async () => {
      const consultas = await apiFetch("/api/consultas");
      semTravar(sincronizarLembretes(consultas));
      return consultas;
    },
  });
}

export function useAgendarConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form) => apiFetch("/api/consultas", { method: "POST", body: form }),
    onSuccess: (resposta, form) => {
      semTravar(agendarLembreteConsulta({
        consultaId: resposta.id,
        pet: nomeDoPet(queryClient, form.animalId),
        tipo: form.tipo,
        dataIso: form.data,
        hora: form.hora,
        local: form.local,
      }));
      return queryClient.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}

export function useReagendarConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }) => apiFetch(`/api/consultas/${id}`, { method: "PUT", body: form }),
    onSuccess: (consulta) => {
      semTravar(agendarLembreteConsulta({
        consultaId: consulta.id,
        pet: consulta.animal,
        tipo: consulta.tipo,
        dataIso: consulta.data,
        hora: consulta.hora,
        local: consulta.local,
      }));
      return queryClient.invalidateQueries({ queryKey: ["consultas"] });
    },
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
    onSuccess: (consulta, { id }) => {
      semTravar(cancelarLembreteConsulta(id));
      return queryClient.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}

export function useConcluirConsulta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observacao }) => apiFetch(`/api/consultas/${id}/concluir`, { method: "POST", body: { observacao } }),
    onSuccess: (consulta, { id }) => {
      semTravar(cancelarLembreteConsulta(id));
      return queryClient.invalidateQueries({ queryKey: ["consultas"] });
    },
  });
}
