import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Platform } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useTheme } from "../theme";

const INTEGRANTES = [
  { id: "1", nome: "Felipe Furlanetto", rm: "RM562766", github: "https://github.com/Felipe-Furlanetto0504" },
  { id: "2", nome: "Raul Rezende Iemini Aguiar", rm: "RM564002", github: "https://github.com/Raul-Rezende" },
  { id: "3", nome: "João Victor Caetano Alves da Silva", rm: "RM562074", github: "https://github.com/joaocaetano1310" },
  { id: "4", nome: "Ryan Victor da Silva Vetoriano", rm: "RM565667", github: "https://github.com/ryanvetoriano" },
  { id: "5", nome: "João Victor Bueno Castelini da Silva", rm: "RM564115", github: "https://github.com/Buenozw" },
];

const LINKS = {
  github: "https://github.com/Felipe-Furlanetto0504/Challenge-FutureVet-Mobile",
  video:  "https://github.com/Felipe-Furlanetto0504/Challenge-FutureVet-Mobile#-v%C3%ADdeo",
};

const VERSAO = Constants.expoConfig?.version ?? "-";
const COMMIT = Constants.expoConfig?.extra?.commitHash ?? "-";

const FUNCIONALIDADES = [
  { icone: "vaccines",         cor: "#4A90E2", nome: "Carteira de vacinação", detalhe: "Doses registradas por pet, com aviso de atrasadas e próximas" },
  { icone: "event",            cor: "#27ae60", nome: "Consultas com a clínica", detalhe: "Agendar, reagendar e cancelar, com lembrete 1 hora antes" },
  { icone: "notifications",    cor: "#f39c12", nome: "Notificações",           detalhe: "Aviso quando a clínica confirma, cancela ou registra uma vacina" },
  { icone: "sensors",          cor: "#9b59b6", nome: "Coleira inteligente",    detalhe: "Sinais vitais e modelo preditivo de anomalias (leituras simuladas)" },
];

const TECNOLOGIAS = [
  { icone: "phone-android", cor: "#4A90E2", nome: "React Native + Expo",       detalhe: "App mobile multiplataforma (SDK 54)"            },
  { icone: "navigation",    cor: "#3498db", nome: "React Navigation",          detalhe: "Abas e rotas protegidas pela sessão"            },
  { icone: "sync",          cor: "#1abc9c", nome: "TanStack Query",            detalhe: "Cache e sincronização com a API"                },
  { icone: "dns",           cor: "#e67e22", nome: "API Java / Spring Boot",    detalhe: "Backend REST publicado no Render"               },
  { icone: "lock",          cor: "#e74c3c", nome: "JWT",                       detalhe: "Autenticação e sessão persistente"              },
  { icone: "notifications", cor: "#f39c12", nome: "expo-notifications",        detalhe: "Notificações locais e lembretes"                },
  { icone: "storage",       cor: "#27ae60", nome: "AsyncStorage",              detalhe: "Sessão, tema e lembretes no aparelho"           },
  { icone: "build",         cor: "#9b59b6", nome: "EAS Build",                 detalhe: "Geração do APK Android"                         },
  { icone: "cloud-upload",  cor: "#4A90E2", nome: "Firebase App Distribution", detalhe: "Distribuição do app para testers"               },
];

export default function Sobre() {
  const { t } = useTheme();

  async function abrirLink(url, nome) {
    const podeAbrir = await Linking.canOpenURL(url);
    if (podeAbrir) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Erro", `Não foi possível abrir o link de ${nome}.`);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cabecalho}>
        <View style={[styles.cabecalhoIcone, { backgroundColor: t.primaryBg }]}>
          <FontAwesome5 name="paw" size={32} color={t.primary} />
        </View>
        <Text style={[styles.cabecalhoNome, { color: t.text }]}>FutureVet</Text>
        <Text style={[styles.cabecalhoVersao, { color: t.muted }]}>v{VERSAO} · FIAP 2026</Text>
        <Text style={[styles.cabecalhoDescricao, { color: t.text2 }]}>
          A saúde do seu pet em um só lugar: vacinas, consultas com a clínica
          e avisos sempre que algo muda no atendimento.
        </Text>
      </View>

      <Text style={[styles.secaoTitulo, { color: t.text }]}>Versão publicada</Text>
      <View style={[styles.card, { backgroundColor: t.surfaceCard }]}>
        <View style={[styles.cardIcone, { backgroundColor: t.primaryBg }]}>
          <MaterialIcons name="tag" size={22} color={t.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardNome, { color: t.text }]}>Versão {VERSAO}</Text>
          <Text style={[styles.cardDetalhe, { color: t.text2 }]}>
            Commit <Text style={[styles.commitHash, { color: t.primary }]}>{COMMIT}</Text>
          </Text>
        </View>
      </View>

      <Text style={[styles.secaoTitulo, { color: t.text }]}>O Problema</Text>
      <View style={[styles.card, { backgroundColor: t.surfaceCard }]}>
        <View style={[styles.cardIcone, { backgroundColor: t.dangerBg }]}>
          <MaterialIcons name="help-outline" size={22} color={t.danger} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardNome, { color: t.text }]}>Cuidados espalhados e esquecidos</Text>
          <Text style={[styles.cardDetalhe, { color: t.text2 }]}>
            Vacinas e consultas ficam anotadas em papéis e mensagens. Doses atrasam,
            horários são esquecidos e o tutor só descobre que a clínica confirmou ou
            cancelou um atendimento quando liga para perguntar.
          </Text>
        </View>
      </View>

      <Text style={[styles.secaoTitulo, { color: t.text }]}>A Solução</Text>
      <View style={[styles.card, { backgroundColor: t.surfaceCard }]}>
        <View style={[styles.cardIcone, { backgroundColor: t.warningBg }]}>
          <MaterialIcons name="lightbulb-outline" size={22} color={t.warning} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardNome, { color: t.text }]}>App conectado à clínica</Text>
          <Text style={[styles.cardDetalhe, { color: t.text2 }]}>
            O FutureVet reúne pets, vacinas e consultas em um app ligado à API da clínica.
            Cada confirmação, cancelamento ou vacina registrada vira uma notificação no
            celular do tutor, que abre direto na tela certa.
          </Text>
        </View>
      </View>

      <Text style={[styles.secaoTitulo, { color: t.text }]}>O que o app faz</Text>
      {FUNCIONALIDADES.map((f) => (
        <View key={f.nome} style={[styles.card, { backgroundColor: t.surfaceCard }]}>
          <View style={[styles.cardIcone, { backgroundColor: f.cor + "20" }]}>
            <MaterialIcons name={f.icone} size={22} color={f.cor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: t.text }]}>{f.nome}</Text>
            <Text style={[styles.cardDetalhe, { color: t.text2 }]}>{f.detalhe}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.secaoTitulo, { color: t.text }]}>Entregáveis</Text>
      {[
        { icone: "code",               bg: t.surfaceCard, cor: t.text,    nome: "Repositório GitHub",      url: LINKS.github, urlLabel: LINKS.github },
        { icone: "play-circle-outline", bg: t.dangerBg,   cor: t.danger,  nome: "Vídeo da Sprint 4",   url: LINKS.video,  urlLabel: "Link na seção Vídeo do README"  },
      ].map((item) => (
        <TouchableOpacity key={item.nome}
          style={[styles.cardLink, { backgroundColor: t.surfaceCard, borderColor: t.border }]}
          onPress={() => abrirLink(item.url, item.nome)} activeOpacity={0.7}>
          <View style={[styles.cardIcone, { backgroundColor: item.bg }]}>
            <MaterialIcons name={item.icone} size={22} color={item.cor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: t.text }]}>{item.nome}</Text>
            <Text style={[styles.cardDetalhe, { color: t.muted }]} numberOfLines={1}>{item.urlLabel}</Text>
          </View>
          <MaterialIcons name="open-in-new" size={18} color={t.primary} />
        </TouchableOpacity>
      ))}

      <Text style={[styles.secaoTitulo, { color: t.text }]}>Tecnologias Utilizadas</Text>
      {TECNOLOGIAS.map((tech) => (
        <View key={tech.nome} style={[styles.card, { backgroundColor: t.surfaceCard }]}>
          <View style={[styles.cardIcone, { backgroundColor: tech.cor + "20" }]}>
            <MaterialIcons name={tech.icone} size={22} color={tech.cor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: t.text }]}>{tech.nome}</Text>
            <Text style={[styles.cardDetalhe, { color: t.text2 }]}>{tech.detalhe}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.secaoTitulo, { color: t.text }]}>O Time</Text>
      {INTEGRANTES.map((p) => (
        <TouchableOpacity key={p.id} style={[styles.card, { backgroundColor: t.surfaceCard }]}
          onPress={() => abrirLink(p.github, p.nome)} activeOpacity={0.7}>
          <View style={[styles.avatar, { backgroundColor: t.primary }]}>
            <Text style={styles.avatarLetra}>{p.nome.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: t.text }]}>{p.nome}</Text>
            <Text style={[styles.cardDetalhe, { color: t.muted }]}>{p.rm}</Text>
          </View>
          <MaterialIcons name="open-in-new" size={16} color={t.muted2} />
        </TouchableOpacity>
      ))}

      <View style={[styles.rodape, { borderTopColor: t.divisor }]}>
        <FontAwesome5 name="paw" size={14} color={t.muted2} />
        <Text style={[styles.rodapeTexto, { color: t.muted2 }]}>
          FIAP · Mobile Application Development · Challenge 2026 · Sprint 4
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  cabecalho: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 8,
  },
  cabecalhoIcone: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cabecalhoNome: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cabecalhoVersao: {
    fontSize: 12,
    marginBottom: 14,
  },
  commitHash: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: "bold",
  },
  cabecalhoDescricao: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardIcone: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 3,
  },
  cardDetalhe: {
    fontSize: 13,
    lineHeight: 18,
  },
  badgePontos: {
    width: 52,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  badgePontosTexto: {
    fontSize: 13,
    fontWeight: "bold",
  },
  criterioLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarLetra: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  rodapeTexto: {
    fontSize: 11,
    textAlign: "center",
    flex: 1,
    lineHeight: 16,
  },
});