import { useEffect, useRef } from "react";
import { createNavigationContainerRef } from "@react-navigation/native";
import * as Notifications from "expo-notifications";


export const navigationRef = createNavigationContainerRef();

const TELAS = ["Início", "Vacinas", "Monitoramento", "Consultas", "Sobre", "Perfil"];


export function useAbrirTelaDaNotificacao({ pronto, logado }) {
  const ultimaResposta = Notifications.useLastNotificationResponse();
  const tratada = useRef(null);

  useEffect(() => {
    if (!ultimaResposta || !pronto || !logado) return;
    if (ultimaResposta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

    const id = ultimaResposta.notification.request.identifier;
    if (tratada.current === id) return;
    tratada.current = id;

    const tela = ultimaResposta.notification.request.content.data?.tela;
    if (TELAS.includes(tela) && navigationRef.isReady()) {
      navigationRef.navigate("App", { screen: tela });
    }
  }, [ultimaResposta, pronto, logado]);
}
