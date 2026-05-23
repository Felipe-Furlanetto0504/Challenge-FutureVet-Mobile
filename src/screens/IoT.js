import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useRef } from "react";
import {
  Text, View, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Alert, Modal, RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme, Button, Chip } from "../theme";

const API_BASE = "http://localhost:8080";
const POLL_MS  = 5000;

const LIMITES = {
  dog:    { temp: [37.5, 39.2], hr: [60,  120] },
  cat:    { temp: [38.0, 39.5], hr: [120, 220] },
  rabbit: { temp: [38.5, 40.0], hr: [140, 300] },
};

export default function IoT() {
  const { t } = useTheme();

  const [leitura, SetLeitura]               = useState(null);
  const [online, SetOnline]                 = useState(false);
  const [atualizando, SetAtualizando]       = useState(false);
  const [petSelecionado, SetPetSelecionado] = useState("rex");
  const [petsStorage, SetPetsStorage]       = useState([]);
  const [logs, SetLogs]                     = useState([]);
  const [modalLog, SetModalLog]             = useState(false);
  const pollRef = useRef(null);

  useEffect(() => { carregarPetsStorage(); }, []);

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
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.sensors) throw new Error();
      SetOnline(true); SetLeitura(data);
      adicionarLog(data.protocol || "MQTT", petSelecionado, data.sensors);
    } catch { SetOnline(false); gerarFallback(); }
  }

  function gerarFallback() {
    const base = {
      rex:     { especie: "dog",    temp: 38.5, hr: 90,  steps: 60,  peso: 28.3 },
      luna:    { especie: "cat",    temp: 38.3, hr: 150, steps: 40,  peso: 4.1  },
      bolinha: { especie: "rabbit", temp: 38.8, hr: 200, steps: 80,  peso: 2.3  },
    };
    const p = base[petSelecionado] || base.rex;
    const r = {
      sensors: {
        temperature_celsius: parseFloat((p.temp + (Math.random() - 0.5) * 0.6).toFixed(1)),
        heart_rate_bpm:      Math.round(p.hr + (Math.random() - 0.5) * 18),
        activity_score:      parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
        steps_last_minute:   Math.round(p.steps + (Math.random() - 0.5) * 20),
        weight_kg:           p.peso,
      },
      battery_pct: 95, health_score: parseFloat((78 + Math.random() * 18).toFixed(0)),
      alerts: [], protocol: "LOCAL", species: p.especie,
    };
    SetLeitura(r);
    adicionarLog("LOCAL", petSelecionado, r.sensors);
  }

  function adicionarLog(proto, pet, sensores) {
    const ts = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    SetLogs((prev) => [{
      id: Date.now().toString(), ts, proto, pet,
      msg: `T:${sensores.temperature_celsius}°C  HR:${sensores.heart_rate_bpm}bpm  Steps:${sensores.steps_last_minute}`,
    }, ...prev].slice(0, 20));
  }

  async function aoAtualizar() {
    SetAtualizando(true);
    await buscarDados();
    SetAtualizando(false);
  }

  function statusTemperatura(temp, limites) {
    if (temp > limites.temp[1]) return { texto: "Febre detectada", cor: t.danger,  icone: "thermostat"  };
    if (temp < limites.temp[0]) return { texto: "Hipotermia leve", cor: t.warning, icone: "ac-unit"     };
    return                             { texto: "Normal",           cor: t.success, icone: "check-circle" };
  }

  function statusFrequencia(hr, limites) {
    if (hr > limites.hr[1]) return { texto: "Acima do normal", cor: t.danger,  icone: "favorite" };
    if (hr < limites.hr[0]) return { texto: "Abaixo do normal",cor: t.danger,  icone: "favorite" };
    return                         { texto: "Normal",           cor: t.success, icone: "favorite" };
  }

  const s       = leitura?.sensors;
  const especie = leitura?.species || "dog";
  const lim     = LIMITES[especie] || LIMITES.dog;

  const alertasSensor = leitura?.alerts || [];

  const stTemp = s ? statusTemperatura(s.temperature_celsius, lim) : null;
  const stHR   = s ? statusFrequencia(s.heart_rate_bpm, lim) : null;

  const petsTabs = [
    { id: "rex",     emoji: "🐕", label: "Rex"     },
    { id: "luna",    emoji: "🐈", label: "Luna"    },
    { id: "bolinha", emoji: "🐇", label: "Bolinha" },
    ...petsStorage.map((p) => ({ id: p.id, emoji: "🐾", label: p.nome })),
  ];


  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={[styles.titulo, { color: t.text }]}>Monitor IoT</Text>
          <Text style={[styles.subtitulo, { color: t.muted }]}>ESP32-S3 · Wokwi Simulated</Text>
        </View>
        <View style={[styles.badgeStatus, { backgroundColor: online ? t.successBg : t.warningBg }]}>
          <MaterialIcons name={online ? "wifi" : "wifi-off"} size={14}
            color={online ? t.success : t.warning} />
          <Text style={[styles.badgeStatusTexto, { color: online ? t.success : t.warning }]}>
            {online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      {!online && (
        <View style={[styles.avisoOffline, { backgroundColor: t.warningBg }]}>
          <MaterialIcons name="info-outline" size={16} color={t.warning} />
          <Text style={[styles.avisoOfflineTexto, { color: t.warning }]}>
            Servidor offline · execute petlink_server.py
          </Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.petScroll} contentContainerStyle={styles.petScrollContent}>
        {petsTabs.map((p) => (
          <Chip key={p.id} label={p.emoji + " " + p.label} ativo={petSelecionado === p.id} onPress={() => SetPetSelecionado(p.id)} />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: 20 }]}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[t.primary]} />}>

        {s ? (
          <>
            <Text style={[styles.secaoTitulo, { color: t.text }]}>Sensores em Tempo Real</Text>

            <View style={styles.gridSensores}>
              {[
                { icone: "thermostat",    cor: t.danger,  valor: s.temperature_celsius, unidade: "°C",  label: "Temperatura", st: stTemp },
                { icone: "favorite",      cor: t.primary, valor: s.heart_rate_bpm,       unidade: " bpm",label: "Freq. Cardíaca", st: stHR },
                { icone: "directions-run",cor: t.warning, valor: s.steps_last_minute,    unidade: "/min",label: "Atividade",
                  st: { texto: s.activity_score > 0.1 ? "Ativo" : "Atividade baixa",
                        cor:   s.activity_score > 0.1 ? t.success : t.warning,
                        icone: s.activity_score > 0.1 ? "check-circle" : "warning" } },
                { icone: "monitor-weight",cor: t.success, valor: s.weight_kg,            unidade: " kg", label: "Peso",
                  st: { texto: "Dentro do ideal", cor: t.success, icone: "check-circle" } },
              ].map((item) => (
                <View key={item.label} style={[styles.cardSensor, styles.cardSensorMetade, { backgroundColor: t.surfaceCard }]}>
                  <View style={styles.cardSensorHeader}>
                    <MaterialIcons name={item.icone} size={20} color={item.cor} />
                    <Text style={[styles.cardSensorLabel, { color: t.muted }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.cardSensorValor, { color: item.cor }]}>
                    {item.valor}<Text style={[styles.cardSensorUnidade, { color: t.muted }]}>{item.unidade}</Text>
                  </Text>
                  <View style={styles.cardSensorStatus}>
                    <MaterialIcons name={item.st.icone} size={13} color={item.st.cor} />
                    <Text style={[styles.cardSensorStatusTexto, { color: item.st.cor }]}>{item.st.texto}</Text>
                  </View>
                </View>
              ))}
            </View>


            {alertasSensor.length > 0 && (
              <>
                <Text style={[styles.secaoTitulo, { color: t.text }]}>Alertas do Sensor</Text>
                {alertasSensor.map((a, i) => (
                  <View key={i} style={[styles.card, styles.cardAlertaUrgente, { backgroundColor: t.surfaceCard }]}>
                    <View style={[styles.cardIcone, { backgroundColor: t.dangerBg }]}>
                      <MaterialIcons name="warning" size={22} color={t.danger} />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardNome, { color: t.text }]}>{a.replace(/_/g, " ")}</Text>
                      <Text style={[styles.cardDetalhe, { color: t.text2 }]}>Verificar com veterinário</Text>
                    </View>
                    <View style={[styles.badgePequeno, { backgroundColor: t.dangerBg }]}>
                      <Text style={[styles.badgePequenoTexto, { color: t.danger }]}>Urgente</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={styles.carregando}>
            <FontAwesome5 name="paw" size={40} color={t.muted2} />
            <Text style={[styles.carregandoTexto, { color: t.muted2 }]}>Buscando dados do sensor...</Text>
          </View>
        )}



        <Button label={`Ver Log MQTT / HTTP${logs.length > 0 ? "  ("+logs.length+")" : ""}`} variant="outline" onPress={() => SetModalLog(true)} icon={<MaterialIcons name="terminal" size={18} color={t.btnOutlineText} />} style={{ marginTop: 8 }} />
      </ScrollView>

      <Modal visible={modalLog} animationType="slide" transparent>
        <View style={[styles.modalFundo, { backgroundColor: t.modalFundo }]}>
          <View style={[styles.modalContainer, { backgroundColor: t.modalBg }]}>
            <View style={styles.modalCabecalho}>
              <Text style={[styles.modalTitulo, { color: t.text }]}>Log MQTT / HTTP</Text>
              <TouchableOpacity onPress={() => SetModalLog(false)}>
                <MaterialIcons name="close" size={24} color={t.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitulo, { color: t.muted }]}>
              Tópico: petlink/sensors/{petSelecionado}
            </Text>
            {logs.length === 0 ? (
              <View style={styles.logVazio}>
                <MaterialIcons name="terminal" size={40} color={t.muted2} />
                <Text style={[styles.logVazioTexto, { color: t.muted2 }]}>Nenhum dado recebido ainda</Text>
              </View>
            ) : (
              <FlatList data={logs} keyExtractor={(i) => i.id} style={{ maxHeight: 380 }}
                renderItem={({ item }) => (
                  <View style={[styles.logItem, { backgroundColor: t.bg2 }]}>
                    <Text style={[styles.logTs, { color: t.muted }]}>{item.ts}</Text>
                    <Text style={[styles.logProto, {
                      color: item.proto === "MQTT" ? t.primary : item.proto === "LOCAL" ? t.warning : t.muted,
                    }]}>{item.proto}</Text>
                    <Text style={[styles.logMensagem, { color: t.text2 }]} numberOfLines={2}>{item.msg}</Text>
                  </View>
                )} />
            )}
            <Button label="Limpar logs" variant="danger" onPress={() => { SetLogs([]); SetModalLog(false); }} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho:             { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20, marginBottom: 4 },
  titulo:                { fontSize: 28, fontWeight: "bold" },
  subtitulo:             { fontSize: 12, marginTop: 2 },
  badgeStatus:           { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeStatusTexto:      { fontSize: 12, fontWeight: "bold" },
  avisoOffline:          { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 20, marginTop: 8, padding: 10, borderRadius: 8 },
  avisoOfflineTexto:     { fontSize: 12, flex: 1 },
  petScroll:             { marginTop: 12, marginBottom: 4 },
  petScrollContent:      { paddingHorizontal: 20, gap: 8 },
  petChip:               { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  petChipEmoji:          { fontSize: 14 },
  petChipTexto:          { fontSize: 13, fontWeight: "500" },
  scroll:                { paddingTop: 12, paddingBottom: 30 },
  secaoTitulo:           { fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 8 },
  gridSensores:          { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  cardSensor:            { borderRadius: 12, padding: 14 },
  cardSensorMetade:      { width: "47.5%" },
  cardSensorHeader:      { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  cardSensorLabel:       { fontSize: 12, fontWeight: "500" },
  cardSensorValor:       { fontSize: 26, fontWeight: "bold", marginBottom: 6 },
  cardSensorUnidade:     { fontSize: 13, fontWeight: "400" },
  cardSensorStatus:      { flexDirection: "row", alignItems: "center", gap: 4 },
  cardSensorStatusTexto: { fontSize: 11, fontWeight: "500" },
  barraFundo:            { height: 6, borderRadius: 3, overflow: "hidden" },
  barraPreenchida:       { height: 6, borderRadius: 3 },
  card:                  { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 10 },
  cardAlertaUrgente:     { borderLeftWidth: 3, borderLeftColor: "#e74c3c" },
  cardIcone:             { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardInfo:              { flex: 1 },
  cardNome:              { fontSize: 15, fontWeight: "bold", marginBottom: 3 },
  cardDetalhe:           { fontSize: 13 },
  badgePequeno:          { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgePequenoTexto:     { fontSize: 11, fontWeight: "bold" },
  carregando:            { alignItems: "center", paddingVertical: 40, gap: 12 },
  carregandoTexto:       { fontSize: 14 },
  botaoLog:              { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  botaoLogTexto:         { fontWeight: "bold", fontSize: 15, flex: 1 },
  badgeLog:              { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeLogTexto:         { color: "#fff", fontSize: 11, fontWeight: "bold" },
  modalFundo:            { flex: 1, justifyContent: "flex-end" },
  modalContainer:        { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  modalCabecalho:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitulo:           { fontSize: 22, fontWeight: "bold" },
  modalSubtitulo:        { fontSize: 12, marginBottom: 16 },
  logVazio:              { alignItems: "center", paddingVertical: 30, gap: 10 },
  logVazioTexto:         { fontSize: 14 },
  logItem:               { borderRadius: 8, padding: 10, marginBottom: 8, gap: 2 },
  logTs:                 { fontSize: 10 },
  logProto:              { fontSize: 11, fontWeight: "bold" },
  logMensagem:           { fontSize: 12, marginTop: 2 },
  botaoLimparLog:        { marginTop: 16, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoLimparLogTexto:   { fontWeight: "bold", fontSize: 15 },
});