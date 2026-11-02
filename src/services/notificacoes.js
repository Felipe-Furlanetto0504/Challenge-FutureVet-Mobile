import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Canal do Android usado por todas as notificações do app
const CANAL = "futurevet";

// { [consultaId]: idDaNotificacaoAgendada }
const CHAVE_LEMBRETES = "@futurevet/lembretes";

// Avisos do backend que já viraram notificação neste aparelho (um conjunto por usuário)
const chaveAvisosVistos = (usuarioId) => `@futurevet/avisos-vistos/${usuarioId}`;

const UMA_HORA = 60 * 60 * 1000;

// Mostra a notificação mesmo com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepararNotificacoes() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: "Consultas e vacinas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4A90E2",
    });
  }

  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

// ---------- Lembrete local da consulta ----------

async function lerLembretes() {
  try {
    return JSON.parse((await AsyncStorage.getItem(CHAVE_LEMBRETES)) || "{}");
  } catch {
    return {};
  }
}

// "2026-11-05" + "14:30" -> Date no fuso do aparelho
export function dataHoraConsulta(dataIso, hora) {
  if (!dataIso || !hora) return null;
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const [h, m] = hora.slice(0, 5).split(":").map(Number);
  return new Date(ano, mes - 1, dia, h, m);
}

export async function cancelarLembreteConsulta(consultaId) {
  const lembretes = await lerLembretes();
  const idNotificacao = lembretes[consultaId];
  if (!idNotificacao) return;

  await Notifications.cancelScheduledNotificationAsync(idNotificacao);
  delete lembretes[consultaId];
  await AsyncStorage.setItem(CHAVE_LEMBRETES, JSON.stringify(lembretes));
}

// Agenda um aviso 1 hora antes da consulta. Se a consulta mudar, o aviso antigo é substituído.
export async function agendarLembreteConsulta({ consultaId, pet, tipo, dataIso, hora, local }) {
  await cancelarLembreteConsulta(consultaId);

  const inicio = dataHoraConsulta(dataIso, hora);
  if (!inicio) return;
  const quando = new Date(inicio.getTime() - UMA_HORA);
  if (quando <= new Date()) return; // consulta muito próxima ou já passou

  const idNotificacao = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Consulta de ${pet} em 1 hora`,
      body: `${tipo} às ${hora.slice(0, 5)}${local ? ` · ${local}` : ""}. Toque para ver o agendamento.`,
      data: { tela: "Consultas", consultaId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: quando,
      channelId: CANAL,
    },
  });

  const lembretes = await lerLembretes();
  lembretes[consultaId] = idNotificacao;
  await AsyncStorage.setItem(CHAVE_LEMBRETES, JSON.stringify(lembretes));
}

// ---------- Avisos vindos do backend (/api/notificacoes) ----------

function dataBr(dataIso) {
  if (!dataIso) return "";
  const [a, m, d] = String(dataIso).split("-");
  return `${d}/${m}/${a}`;
}

// Mesmos textos que o backend usa na versão web
export function textoDoAviso(aviso) {
  const pet = aviso.animal;
  const detalhe = aviso.detalhe ? String(aviso.detalhe).slice(0, 5) : "";
  const data = dataBr(aviso.dataEvento);

  switch (aviso.tipo) {
    case "CONSULTA_SOLICITADA":
      return { titulo: "Nova solicitação de consulta", corpo: `Consulta solicitada para ${pet} em ${data}, às ${detalhe}. Aguardando confirmação.`, tela: "Consultas" };
    case "CONSULTA_REAGENDADA":
      return { titulo: "Consulta reagendada", corpo: `A consulta de ${pet} foi reagendada para ${data}, às ${detalhe}.`, tela: "Consultas" };
    case "CONSULTA_CONFIRMADA":
      return { titulo: "Consulta confirmada ✅", corpo: `A consulta de ${pet} está confirmada para ${data}, às ${detalhe}.`, tela: "Consultas" };
    case "CONSULTA_CANCELADA":
      return { titulo: "Consulta cancelada", corpo: `A consulta de ${pet} marcada para ${data}, às ${detalhe}, foi cancelada.`, tela: "Consultas" };
    case "CONSULTA_REALIZADA":
      return { titulo: "Atendimento registrado", corpo: `O atendimento de ${pet} em ${data} foi concluído. Confira o resumo na agenda.`, tela: "Consultas" };
    case "VACINA_REGISTRADA":
      return { titulo: "Vacina registrada 💉", corpo: `A vacina ${aviso.detalhe} de ${pet}, aplicada em ${data}, foi registrada na carteira.`, tela: "Vacinas" };
    case "REFORCO_REGISTRADO":
      return { titulo: "Reforço registrado 💉", corpo: `O reforço da vacina ${aviso.detalhe} de ${pet} foi registrado em ${data}.`, tela: "Vacinas" };
    default:
      return { titulo: "FutureVet", corpo: `Novidade sobre ${pet}.`, tela: "Início" };
  }
}

async function lerAvisosVistos(usuarioId) {
  try {
    const salvo = await AsyncStorage.getItem(chaveAvisosVistos(usuarioId));
    return salvo ? new Set(JSON.parse(salvo)) : null;
  } catch {
    return null;
  }
}

// Recebe a lista de /api/notificacoes e mostra na hora os avisos novos e não lidos.
// Na primeira vez que o usuário entra neste aparelho, só guarda o que já existia,
// para não disparar dezenas de avisos antigos de uma vez.
export async function exibirAvisosNovos(usuarioId, avisos) {
  if (!usuarioId || !Array.isArray(avisos)) return;

  const vistos = await lerAvisosVistos(usuarioId);
  const primeiraVez = vistos === null;
  const conjunto = vistos ?? new Set();

  const novos = avisos.filter((a) => !a.lida && !conjunto.has(a.id));
  avisos.forEach((a) => conjunto.add(a.id));
  await AsyncStorage.setItem(chaveAvisosVistos(usuarioId), JSON.stringify([...conjunto].slice(-200)));

  if (primeiraVez) return;

  // A API devolve do mais novo para o mais antigo; mostramos na ordem em que aconteceram
  for (const aviso of novos.reverse()) {
    const { titulo, corpo, tela } = textoDoAviso(aviso);
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: corpo, data: { tela, avisoId: aviso.id } },
      trigger: Platform.OS === "android" ? { channelId: CANAL } : null,
    });
  }
}

// Ao sair da conta, nada do usuário anterior pode disparar neste aparelho
export async function limparNotificacoes() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(CHAVE_LEMBRETES);
}

// Remove lembretes de consultas que deixaram de estar ativas
// (por exemplo, canceladas pela clínica em outro aparelho)
export async function sincronizarLembretes(consultas) {
  if (!Array.isArray(consultas)) return;
  const lembretes = await lerLembretes();
  const ids = Object.keys(lembretes);
  if (ids.length === 0) return;

  for (const id of ids) {
    const consulta = consultas.find((c) => String(c.id) === id);
    const ativa = consulta && (consulta.status === "AGENDADA" || consulta.status === "CONFIRMADA");
    if (!ativa) await cancelarLembreteConsulta(id);
  }
}
