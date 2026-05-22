import { Text, View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const INTEGRANTES = [
  { id: "1", nome: "Nome do Integrante 1", rm: "RM000000", github: "https://github.com/usuario1" },
  { id: "2", nome: "Nome do Integrante 2", rm: "RM000000", github: "https://github.com/usuario2" },
  { id: "3", nome: "Nome do Integrante 3", rm: "RM000000", github: "https://github.com/usuario3" },
  { id: "4", nome: "Nome do Integrante 4", rm: "RM000000", github: "https://github.com/usuario4" },
  { id: "5", nome: "Nome do Integrante 5", rm: "RM000000", github: "https://github.com/usuario5" },
];

const LINKS = {
  github: "https://github.com/seu-usuario/Challenge-FutureVet",
  video:  "https://youtube.com/watch?v=SEU_VIDEO_ID",
};

const TECNOLOGIAS = [
  { icone: "phone-android", cor: "#4A90E2", nome: "React Native",    detalhe: "Interface mobile multiplataforma"  },
  { icone: "storage",       cor: "#27ae60", nome: "AsyncStorage",    detalhe: "Persistência local de dados"        },
  { icone: "sensors",       cor: "#f39c12", nome: "ESP32-S3",        detalhe: "Microcontrolador IoT da coleira"    },
  { icone: "wifi",          cor: "#9b59b6", nome: "MQTT / HTTP",     detalhe: "Protocolos de comunicação IoT"      },
  { icone: "computer",      cor: "#e74c3c", nome: "Wokwi",           detalhe: "Simulador de circuitos online"      },
  { icone: "cloud",         cor: "#1abc9c", nome: "HiveMQ",          detalhe: "Broker MQTT na nuvem"               },
  { icone: "thermostat",    cor: "#e67e22", nome: "DS18B20",         detalhe: "Sensor de temperatura corporal"     },
  { icone: "favorite",      cor: "#e74c3c", nome: "MAX30102",        detalhe: "Sensor de frequência cardíaca"      },
  { icone: "directions-run",cor: "#3498db", nome: "MPU-6050",        detalhe: "Acelerômetro — detecção de atividade"},
];

export default function Sobre() {

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
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Cabeçalho do projeto ── */}
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoIcone}>
          <FontAwesome5 name="paw" size={32} color="#4A90E2" />
        </View>
        <Text style={styles.cabecalhoNome}>FutureVet</Text>
        <Text style={styles.cabecalhoVersao}>v1.0.0 · FIAP 2025</Text>
        <Text style={styles.cabecalhoDescricao}>
          Monitoramento inteligente da saúde dos seus pets via IoT, com sensores
          conectados em tempo real e gestão completa de vacinas e consultas.
        </Text>
      </View>

      {/* ── O Problema ── */}
      <Text style={styles.secaoTitulo}>O Problema</Text>
      <View style={styles.card}>
        <View style={styles.cardIcone}>
          <MaterialIcons name="help-outline" size={22} color="#e74c3c" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>Saúde invisível entre consultas</Text>
          <Text style={styles.cardDetalhe}>
            Tutores não têm como monitorar a saúde do pet no dia a dia. Febre, alterações
            cardíacas e inatividade passam despercebidas até a próxima visita ao veterinário.
          </Text>
        </View>
      </View>

      {/* ── A Solução ── */}
      <Text style={styles.secaoTitulo}>A Solução</Text>
      <View style={styles.card}>
        <View style={styles.cardIcone}>
          <MaterialIcons name="lightbulb-outline" size={22} color="#f39c12" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>Coleira inteligente + app</Text>
          <Text style={styles.cardDetalhe}>
            Uma coleira com ESP32-S3 coleta temperatura corporal, frequência cardíaca
            e nível de atividade continuamente. Os dados chegam via MQTT ao app,
            que alerta o tutor em tempo real e mantém o histórico de saúde do pet.
          </Text>
        </View>
      </View>

      {/* ── Links entregáveis ── */}
      <Text style={styles.secaoTitulo}>Entregáveis</Text>

      <TouchableOpacity
        style={styles.cardLink}
        onPress={() => abrirLink(LINKS.github, "GitHub")}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIcone, { backgroundColor: "#f2f2f2" }]}>
          <MaterialIcons name="code" size={22} color="#333" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>Repositório GitHub</Text>
          <Text style={styles.cardDetalhe} numberOfLines={1}>{LINKS.github}</Text>
        </View>
        <MaterialIcons name="open-in-new" size={18} color="#4A90E2" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cardLink}
        onPress={() => abrirLink(LINKS.video, "vídeo")}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIcone, { backgroundColor: "#fdecea" }]}>
          <MaterialIcons name="play-circle-outline" size={22} color="#e74c3c" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNome}>Vídeo Pitch — YouTube</Text>
          <Text style={styles.cardDetalhe} numberOfLines={1}>{LINKS.video}</Text>
        </View>
        <MaterialIcons name="open-in-new" size={18} color="#4A90E2" />
      </TouchableOpacity>

      {/* ── Tecnologias ── */}
      <Text style={styles.secaoTitulo}>Tecnologias Utilizadas</Text>
      {TECNOLOGIAS.map((t) => (
        <View key={t.nome} style={styles.card}>
          <View style={[styles.cardIcone, { backgroundColor: t.cor + "18" }]}>
            <MaterialIcons name={t.icone} size={22} color={t.cor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNome}>{t.nome}</Text>
            <Text style={styles.cardDetalhe}>{t.detalhe}</Text>
          </View>
        </View>
      ))}

      {/* ── Integrantes ── */}
      <Text style={styles.secaoTitulo}>O Time</Text>
      {INTEGRANTES.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.card}
          onPress={() => abrirLink(p.github, p.nome)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>
              {p.nome.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNome}>{p.nome}</Text>
            <Text style={styles.cardDetalhe}>{p.rm}</Text>
          </View>
          <MaterialIcons name="open-in-new" size={16} color="#ccc" />
        </TouchableOpacity>
      ))}

      {/* ── Rodapé ── */}
      <View style={styles.rodape}>
        <FontAwesome5 name="paw" size={14} color="#ccc" />
        <Text style={styles.rodapeTexto}>
          FIAP · Disruptive Architectures: IoT, IoB & Generative IA · 1º Sprint 2025
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
    backgroundColor: "#eaf3fb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cabecalhoNome: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cabecalhoVersao: {
    fontSize: 12,
    color: "#888",
    marginBottom: 14,
  },
  cabecalhoDescricao: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardIcone: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#eaf3fb",
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
    color: "#333",
    marginBottom: 3,
  },
  cardDetalhe: {
    fontSize: 13,
    color: "#555",
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A90E2",
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
    borderTopColor: "#f2f2f2",
  },
  rodapeTexto: {
    fontSize: 11,
    color: "#aaa",
    textAlign: "center",
    flex: 1,
    lineHeight: 16,
  },
});