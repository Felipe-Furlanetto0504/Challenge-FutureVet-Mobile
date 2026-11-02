import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buscarHistoricoInicial, buscarNovaLeitura } from "../services/coleira";
import { avaliarAnomalia, HISTORICO_MAXIMO } from "../services/anomalias";

const chave = (petId) => ["leituras", petId];


export function useLeiturasColeira(pet) {
  const queryClient = useQueryClient();

  const consulta = useQuery({
    queryKey: chave(pet?.id),
    queryFn: () => buscarHistoricoInicial(pet),
    enabled: !!pet,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const nova = useMutation({
    mutationFn: () => buscarNovaLeitura(pet),
    onSuccess: (leitura) => {
      queryClient.setQueryData(chave(pet.id), (anterior = []) =>
        [...anterior, leitura].slice(-HISTORICO_MAXIMO)
      );
    },
  });

  const historico = consulta.data || [];
  const ultima = historico[historico.length - 1] || null;
  const alerta = pet && historico.length > 0 ? avaliarAnomalia(pet.nome, historico) : null;

  return {
    historico,
    ultima,
    alerta,
    carregando: consulta.isLoading,
    novaLeitura: () => pet && nova.mutateAsync(),
    limpar: () => pet && queryClient.setQueryData(chave(pet.id), []),
    gerandoLeitura: nova.isPending,
  };
}
