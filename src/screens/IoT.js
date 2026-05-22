import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

// Troque pelo IP da sua máquina se testar em device físico
// Ex: 'http://192.168.1.100:8080'
const API_BASE = "http://localhost:8080";
const POLL_MS = 5000;

const LIMITES = {
  dog:    { temp: [37.5, 39.2], hr: [60, 120],  especie: "Cão"    },
  cat:    { temp: [38.0, 39.5], hr: [120, 220], especie: "Gato"   },
  rabbit: { temp: [38.5, 40.0], hr: [140, 300], especie: "Coelho" },
};

const ALERTAS_PREVENTIVOS = [
  { id: "1", icone: "medication",     cor: "#e74c3c", titulo: "Vermífugo atrasado",  detalhe: "Venceu há 12 dias · Push enviado", badge: "Urgente"    },
  { id: "2", icone: "vaccines",       cor: "#f39c12", titulo: "V10 — reforço anual", detalhe: "Vence em 18 dias · Agendado",       badge: "18 dias"    },
  { id: "3", icone: "local-hospital", cor: "#4A90E2", titulo: "Consulta preventiva", detalhe: "Última: 4 meses atrás",             badge: "Recomendar" },
  { id: "4", icone: "bug-report",     cor: "#27ae60", titulo: "Pulga & Carrapato",   detalhe: "Próxima dose: em 5 dias",           badge: "5 dias"     },
];

export default function IoT() {
  const [leitura, SetLeitura]         = useState(null);
  const [online, SetOnline]           = useState(false);
  const [atualizando, SetAtualizando] = useState(false);
  const [petSelecionado, SetPetSelecionado] = useState("rex");
  const [petsStorage, SetPetsStorage] = useState([]);
  const [logs, SetLogs]               = useState([]);
  const [modalLog, SetModalLog]       = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    carregarPetsStorage();
  }, []);

  useEffect(() => {
    buscarDados();
    pollRef.current = setInterval(buscarDados, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [petSelecionado]);

  async function carregarPetsStorage() {
    const dados = await AsyncStorage.getItem("PETS");
    if (dados) SetPetsStorage(JSON.parse(dados));
  }

  async function buscarDados() {
    try {
      const res = await fetch(`${API_BASE}/api/latest/${petSelecionado}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!data.sensors) throw new Error("payload invalido");

      SetOnline(true);
      SetLeitura(data);
      adicionarLog(data.protocol || "MQTT", petSelecionado, data.sensors);
    } catch {
      SetOnline(false);
      gerarFallback();
    }
  }

  function gerarFallback() {
    const base = { rex: { especie: "dog", temp: 38.5, hr: 90, steps: 60, peso: 28.3 },
                   luna: { especie: "cat", temp: 38.3, hr: 150, steps: 40, peso: 4.1 },
                   bolinha: { especie: "rabbit", temp: 38.8, hr: 200, steps: 80, peso: 2.3 } };
    const p = base[petSelecionado] || base.rex;
    const r = {
      sensors: {
        temperature_celsius: parseFloat((p.temp + (Math.random() - 0.5) * 0.6).toFixed(1)),
        heart_rate_bpm:      Math.round(p.hr + (Math.random() - 0.5) * 18),
        activity_score:      parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
        steps_last_minute:   Math.round(p.steps + (Math.random() - 0.5) * 20),
        weight_kg:           p.peso,
      },
      battery_pct: 95,
      health_score: parseFloat((78 + Math.random() * 18).toFixed(0)),
      alerts: [],
      protocol: "LOCAL",
      species: p.especie,
    };
    SetLeitura(r);
    adicionarLog("LOCAL", petSelecionado, r.sensors);
  }

  function adicionarLog(proto, pet, sensores) {
    const ts = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const msg = `T:${sensores.temperature_celsius}°C  HR:${sensores.heart_rate_bpm}bpm  Steps:${sensores.steps_last_minute}`;
    SetLogs((prev) => [{ id: Date.now().toString(), ts, proto, pet, msg }, ...prev].slice(0, 20));
  }

  async function aoAtualizar() {
    SetAtualizando(true);
    await buscarDados();
    SetAtualizando(false);
  }

  function statusTemperatura(temp, limites) {
    if (temp > limites.temp[1]) return { texto: "Febre detectada", cor: "#e74c3c", icone: "thermostat" };
    if (temp < limites.temp[0]) return { texto: "Hipotermia leve", cor: "#f39c12", icone: "ac-unit" };
    return { texto: "Normal", cor: "#27ae60", icone: "check-circle" };
  }

  function statusFrequencia(hr, limites) {
    if (hr > limites.hr[1]) return { texto: "Acima do normal", cor: "#e74c3c", icone: "favorite" };
    if (hr < limites.hr[0]) return { texto: "Abaixo do normal", cor: "#e74c3c", icone: "favorite" };
    return { texto: "Normal", cor: "#27ae60", icone: "favorite" };
  }

  const s       = leitura?.sensors;
  const especie = leitura?.species || "dog";
  const lim     = LIMITES[especie] || LIMITES.dog;
  const score   = Math.round(leitura?.health_score || 0);
  const bat     = leitura?.battery_pct || 0;
  const alertasSensor = leitura?.alerts || [];

  const stTemp = s ? statusTemperatura(s.temperature_celsius, lim) : null;
  const stHR   = s ? statusFrequencia(s.heart_rate_bpm, lim) : null;

  // Monta lista de pets: sempre mostra rex/luna/bolinha + os do storage
  const petsTabs = [
    { id: "rex",     emoji: "🐕", label: "Rex"     },
    { id: "luna",    emoji: "🐈", label: "Luna"    },
    { id: "bolinha", emoji: "🐇", label: "Bolinha" },
    ...petsStorage.map((p) => ({ id: p.id, emoji: "🐾", label: p.nome })),
  ];

  return (
    <View style={styles.container}>

      {/* ── Título ── */}
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.titulo}>Monitor IoT</Text>
          <Text style={styles.subtitulo}>ESP32-S3 · Wokwi Simulated</Text>
        </View>
        <View style={[styles.badgeStatus, online ? styles.badgeOnline : styles.badgeOffline]}>
          <MaterialIcons
            name={online ? "wifi" : "wifi-off"}
            size={14}
            color={online ? "#27ae60" : "#f39c12"}
          />
          <Text style={[styles.badgeStatusTexto, { color: online ? "#27ae60" : "#f39c12" }]}>
            {online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      {/* ── Aviso servidor ── */}
      {!online && (
        <View style={styles.avisoOffline}>
          <MaterialIcons name="info-outline" size={16} color="#f39c12" />
          <Text style={styles.avisoOfflineTexto}>
            Servidor offline · execute petlink_server.py
          </Text>
        </View>
      )}

      {/* ── Seletor de pet ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.petScroll}
        contentContainerStyle={styles.petScrollContent}
      >
        {petsTabs.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.petChip, petSelecionado === p.id && styles.petChipAtivo]}
            onPress={() => SetPetSelecionado(p.id)}
          >
            <Text style={styles.petChipEmoji}>{p.emoji}</Text>
            <Text style={[styles.petChipTexto, petSelecionado === p.id && styles.petChipTextoAtivo]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={["#4A90E2"]} />
        }
      >

        {/* ── Cards de sensores ── */}
        {s ? (
          <>
            <Text style={styles.secaoTitulo}>Sensores em Tempo Real</Text>

            <View style={styles.gridSensores}>

              <View style={[styles.cardSensor, styles.cardSensorMetade]}>
                <View style={styles.cardSensorHeader}>
                  <MaterialIcons name="thermostat" size={20} color="#e74c3c" />
                  <Text style={styles.cardSensorLabel}>Temperatura</Text>
                </View>
                <Text style={[styles.cardSensorValor, { color: "#e74c3c" }]}>
                  {s.temperature_celsius}
                  <Text style={styles.cardSensorUnidade}>°C</Text>
                </Text>
                {stTemp && (
                  <View style={styles.cardSensorStatus}>
                    <MaterialIcons name={stTemp.icone} size={13} color={stTemp.cor} />
                    <Text style={[styles.cardSensorStatusTexto, { color: stTemp.cor }]}>
                      {stTemp.texto}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.cardSensor, styles.cardSensorMetade]}>
                <View style={styles.cardSensorHeader}>
                  <MaterialIcons name="favorite" size={20} color="#4A90E2" />
                  <Text style={styles.cardSensorLabel}>Freq. Cardíaca</Text>
                </View>
                <Text style={[styles.cardSensorValor, { color: "#4A90E2" }]}>
                  {s.heart_rate_bpm}
                  <Text style={styles.cardSensorUnidade}> bpm</Text>
                </Text>
                {stHR && (
                  <View style={styles.cardSensorStatus}>
                    <MaterialIcons name={stHR.icone} size={13} color={stHR.cor} />
                    <Text style={[styles.cardSensorStatusTexto, { color: stHR.cor }]}>
                      {stHR.texto}
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.cardSensor, styles.cardSensorMetade]}>
                <View style={styles.cardSensorHeader}>
                  <MaterialIcons name="directions-run" size={20} color="#f39c12" />
                  <Text style={styles.cardSensorLabel}>Atividade</Text>
                </View>
                <Text style={[styles.cardSensorValor, { color: "#f39c12" }]}>
                  {s.steps_last_minute}
                  <Text style={styles.cardSensorUnidade}>/min</Text>
                </Text>
                <View style={styles.cardSensorStatus}>
                  <MaterialIcons
                    name={s.activity_score > 0.1 ? "check-circle" : "warning"}
                    size={13}
                    color={s.activity_score > 0.1 ? "#27ae60" : "#f39c12"}
                  />
                  <Text style={[styles.cardSensorStatusTexto, { color: s.activity_score > 0.1 ? "#27ae60" : "#f39c12" }]}>
                    {s.activity_score > 0.1 ? "Ativo" : "Atividade baixa"}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardSensor, styles.cardSensorMetade]}>
                <View style={styles.cardSensorHeader}>
                  <MaterialIcons name="monitor-weight" size={20} color="#27ae60" />
                  <Text style={styles.cardSensorLabel}>Peso</Text>
                </View>
                <Text style={[styles.cardSensorValor, { color: "#27ae60" }]}>
                  {s.weight_kg}
                  <Text style={styles.cardSensorUnidade}> kg</Text>
                </Text>
                <View style={styles.cardSensorStatus}>
                  <MaterialIcons name="check-circle" size={13} color="#27ae60" />
                  <Text style={[styles.cardSensorStatusTexto, { color: "#27ae60" }]}>Dentro do ideal</Text>
                </View>
              </View>

            </View>

            {/* ── Bateria ── */}
            <View style={styles.cardBateria}>
              <View style={styles.cardBateriaHeader}>
                <MaterialIcons
                  name="battery-full"
                  size={20}
                  color={bat > 50 ? "#27ae60" : bat > 20 ? "#f39c12" : "#e74c3c"}
                />
                <Text style={styles.cardBateriaLabel}>Bateria da coleira</Text>
                <Text style={[styles.cardBateriaValor, {
                  color: bat > 50 ? "#27ae60" : bat > 20 ? "#f39c12" : "#e74c3c",
                }]}>
                  {bat}%
                </Text>
              </View>
              <View style={styles.barraFundo}>
                <View style={[styles.barraPreenchida, {
                  width: `${bat}%`,
                  backgroundColor: bat > 50 ? "#27ae60" : bat > 20 ? "#f39c12" : "#e74c3c",
                }]} />
              </View>
            </View>

            {/* ── Score de saúde ── */}
            <View style={styles.cardScore}>
              <View style={styles.cardScoreEsquerda}>
                <Text style={styles.cardScoreNumero}>{score}</Text>
                <Text style={styles.cardScoreLabel}>/100</Text>
                <Text style={styles.cardScoreSub}>Score de Saúde</Text>
              </View>
              <View style={styles.cardScoreDireita}>
                {[
                  { label: "Vacinas",    valor: "5/5",     cor: "#27ae60" },
                  { label: "Consultas",  valor: "2/3",     cor: "#f39c12" },
                  { label: "Vermífugo",  valor: "Atrasado", cor: "#e74c3c" },
                  { label: "Bateria",    valor: bat + "%", cor: bat > 50 ? "#27ae60" : "#f39c12" },
                ].map((item, i) => (
                  <View key={i} style={styles.cardScoreLinha}>
                    <Text style={styles.cardScoreLinhaLabel}>{item.label}</Text>
                    <Text style={[styles.cardScoreLinhaValor, { color: item.cor }]}>{item.valor}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Alertas do sensor (dinâmico) ── */}
            {alertasSensor.length > 0 && (
              <>
                <Text style={styles.secaoTitulo}>Alertas do Sensor</Text>
                {alertasSensor.map((a, i) => (
                  <View key={i} style={[styles.card, styles.cardAlertaUrgente]}>
                    <View style={[styles.cardIcone, { backgroundColor: "#fdecea" }]}>
                      <MaterialIcons name="warning" size={22} color="#e74c3c" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardNome}>{a.replace(/_/g, " ")}</Text>
                      <Text style={styles.cardDetalhe}>Verificar com veterinário</Text>
                    </View>
                    <View style={[styles.badgePequeno, { backgroundColor: "#fdecea" }]}>
                      <Text style={[styles.badgePequenoTexto, { color: "#e74c3c" }]}>Urgente</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={styles.carregando}>
            <FontAwesome5 name="paw" size={40} color="#ccc" />
            <Text style={styles.carregandoTexto}>Buscando dados do sensor...</Text>
          </View>
        )}

        {/* ── Alertas preventivos ── */}
        <Text style={styles.secaoTitulo}>Alertas Preventivos</Text>
        {ALERTAS_PREVENTIVOS.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={[styles.cardIcone, { backgroundColor: a.cor + "20" }]}>
              <MaterialIcons name={a.icone} size={22} color={a.cor} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{a.titulo}</Text>
              <Text style={styles.cardDetalhe}>{a.detalhe}</Text>
            </View>
            <View style={[styles.badgePequeno, { backgroundColor: a.cor + "20" }]}>
              <Text style={[styles.badgePequenoTexto, { color: a.cor }]}>{a.badge}</Text>
            </View>
          </View>
        ))}

        {/* ── Botão ver logs ── */}
        <TouchableOpacity
          style={styles.botaoLog}
          onPress={() => SetModalLog(true)}
        >
          <MaterialIcons name="terminal" size={20} color="#4A90E2" />
          <Text style={styles.botaoLogTexto}>Ver Log MQTT / HTTP</Text>
          {logs.length > 0 && (
            <View style={styles.badgeLog}>
              <Text style={styles.badgeLogTexto}>{logs.length}</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* ── Modal de logs ── */}
      <Modal visible={modalLog} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>

            <View style={styles.modalCabecalho}>
              <Text style={styles.modalTitulo}>Log MQTT / HTTP</Text>
              <TouchableOpacity onPress={() => SetModalLog(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitulo}>
              Tópico: petlink/sensors/{petSelecionado}
            </Text>

            {logs.length === 0 ? (
              <View style={styles.logVazio}>
                <MaterialIcons name="terminal" size={40} color="#ccc" />
                <Text style={styles.logVazioTexto}>Nenhum dado recebido ainda</Text>
              </View>
            ) : (
              <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 380 }}
                renderItem={({ item }) => (
                  <View style={styles.logItem}>
                    <Text style={styles.logTs}>{item.ts}</Text>
                    <Text style={[styles.logProto, {
                      color: item.proto === "MQTT" ? "#4A90E2" : item.proto === "LOCAL" ? "#f39c12" : "#888",
                    }]}>
                      {item.proto}
                    </Text>
                    <Text style={styles.logMensagem} numberOfLines={2}>{item.msg}</Text>
                  </View>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.botaoLimparLog}
              onPress={() => { SetLogs([]); SetModalLog(false); }}
            >
              <Text style={styles.botaoLimparLogTexto}>Limpar logs</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitulo: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  badgeStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeOnline: {
    backgroundColor: "#eafaf1",
  },
  badgeOffline: {
    backgroundColor: "#fef9e7",
  },
  badgeStatusTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },
  avisoOffline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fef9e7",
    borderRadius: 8,
  },
  avisoOfflineTexto: {
    fontSize: 12,
    color: "#f39c12",
    flex: 1,
  },
  petScroll: {
    marginTop: 12,
    marginBottom: 4,
  },
  petScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  petChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#f2f2f2",
  },
  petChipAtivo: {
    backgroundColor: "#eaf3fb",
    borderColor: "#4A90E2",
  },
  petChipEmoji: {
    fontSize: 14,
  },
  petChipTexto: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  petChipTextoAtivo: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  gridSensores: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  cardSensor: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
  },
  cardSensorMetade: {
    width: "47.5%",
  },
  cardSensorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardSensorLabel: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  cardSensorValor: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardSensorUnidade: {
    fontSize: 13,
    fontWeight: "400",
    color: "#888",
  },
  cardSensorStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardSensorStatusTexto: {
    fontSize: 11,
    fontWeight: "500",
  },
  cardBateria: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardBateriaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardBateriaLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  cardBateriaValor: {
    fontSize: 16,
    fontWeight: "bold",
  },
  barraFundo: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  barraPreenchida: {
    height: 6,
    borderRadius: 3,
  },
  cardScore: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  cardScoreEsquerda: {
    alignItems: "center",
    minWidth: 70,
  },
  cardScoreNumero: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#4A90E2",
    lineHeight: 44,
  },
  cardScoreLabel: {
    fontSize: 14,
    color: "#888",
  },
  cardScoreSub: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },
  cardScoreDireita: {
    flex: 1,
    gap: 6,
  },
  cardScoreLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardScoreLinhaLabel: {
    fontSize: 13,
    color: "#555",
  },
  cardScoreLinhaValor: {
    fontSize: 13,
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardAlertaUrgente: {
    borderLeftWidth: 3,
    borderLeftColor: "#e74c3c",
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
    color: "#333",
    marginBottom: 3,
  },
  cardDetalhe: {
    fontSize: 13,
    color: "#555",
  },
  badgePequeno: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePequenoTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },
  carregando: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  carregandoTexto: {
    color: "#aaa",
    fontSize: 14,
  },
  botaoLog: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4A90E2",
    backgroundColor: "#eaf3fb",
  },
  botaoLogTexto: {
    color: "#4A90E2",
    fontWeight: "bold",
    fontSize: 15,
    flex: 1,
  },
  badgeLog: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeLogTexto: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  modalCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalSubtitulo: {
    fontSize: 12,
    color: "#888",
    marginBottom: 16,
  },
  logVazio: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 10,
  },
  logVazioTexto: {
    color: "#aaa",
    fontSize: 14,
  },
  logItem: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 2,
  },
  logTs: {
    fontSize: 10,
    color: "#888",
  },
  logProto: {
    fontSize: 11,
    fontWeight: "bold",
  },
  logMensagem: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  botaoLimparLog: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoLimparLogTexto: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 15,
  },
});
