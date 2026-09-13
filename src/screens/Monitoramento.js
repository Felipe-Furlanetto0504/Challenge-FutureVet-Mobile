import { useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme, Button, Chip } from "../theme";
import { useAnimais } from "../hooks/useAnimais";

const HISTORICO_MAXIMO = 30;
const BASELINE_MINIMO = 8;
const Z_SCORE_LIMITE = 2.0;

const LIMITES = {
  CAO:    { temp: [37.5, 39.2], hr: [60,  120] },
  GATO:   { temp: [38.0, 39.5], hr: [120, 220] },
  COELHO: { temp: [38.5, 40.0], hr: [140, 300] },
  OUTRO:  { temp: [37.5, 39.2], hr: [60,  120] },
};

const BASE_POR_ESPECIE = {
  CAO:    { temp: 38.5, hr: 90,  steps: 60 },
  GATO:   { temp: 38.3, hr: 150, steps: 40 },
  COELHO: { temp: 38.9, hr: 220, steps: 50 },
  OUTRO:  { temp: 38.5, hr: 90,  steps: 60 },
};

function media(valores) {
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

function desvioPadrao(valores, m) {
  const variancia = valores.reduce((soma, v) => soma + (v - m) ** 2, 0) / valores.length;
  return Math.sqrt(variancia) || 0.01;
}

function gerarLeitura(pet, forcarAnomalia = false) {
  const base = BASE_POR_ESPECIE[pet.especie] || BASE_POR_ESPECIE.OUTRO;
  const simularAnomalia = forcarAnomalia || Math.random() < 0.2;

  const temperature_celsius = parseFloat(
    (simularAnomalia ? base.temp + 1.3 + Math.random() * 0.4 : base.temp + (Math.random() - 0.5) * 0.6).toFixed(1)
  );
  const activity_score = parseFloat(
    (simularAnomalia ? 0.03 + Math.random() * 0.05 : 0.3 + Math.random() * 0.5).toFixed(2)
  );

  return {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    timestamp: new Date(),
    species: pet.especie,
    sensors: {
      temperature_celsius,
      heart_rate_bpm:    Math.round(base.hr + (Math.random() - 0.5) * 18),
      activity_score,
      steps_last_minute: Math.round(base.steps + (Math.random() - 0.5) * 20),
      weight_kg:         pet.peso ?? null,
    },
  };
}

function avaliarAnomalia(petNome, historico) {
  if (historico.length < BASELINE_MINIMO + 1) return null;

  const anteriores = historico.slice(0, -1);
  const atual = historico[historico.length - 1];

  const temps = anteriores.map((r) => r.sensors.temperature_celsius);
  const atividades = anteriores.map((r) => r.sensors.activity_score);

  const muTemp = media(temps);
  const sigmaTemp = desvioPadrao(temps, muTemp);
  const muAtividade = media(atividades);
  const sigmaAtividade = desvioPadrao(atividades, muAtividade);

  const zTemp = (atual.sensors.temperature_celsius - muTemp) / sigmaTemp;
  const zAtividade = (atual.sensors.activity_score - muAtividade) / sigmaAtividade;

  const signals = [];
  let severidadeScore = 0;

  if (zTemp > Z_SCORE_LIMITE) {
    signals.push(
      `Temperatura ${atual.sensors.temperature_celsius}°C acima da linha de base (${muTemp.toFixed(1)}°C ± ${sigmaTemp.toFixed(2)}), z-score=${zTemp.toFixed(2)}`
    );
    severidadeScore += zTemp > Z_SCORE_LIMITE * 1.5 ? 2 : 1;
  }

  if (zAtividade < -Z_SCORE_LIMITE) {
    signals.push(
      `Nível de atividade muito abaixo da linha de base (${muAtividade.toFixed(2)} ± ${sigmaAtividade.toFixed(2)}), z-score=${zAtividade.toFixed(2)}`
    );
    severidadeScore += zAtividade < -Z_SCORE_LIMITE * 1.5 ? 2 : 1;
  }

  if (signals.length === 0) return null;

  let severity, recommendation;
  if (severidadeScore >= 3) {
    severity = "critica";
    recommendation = "Agendar consulta veterinária com urgência (mesmo dia).";
  } else if (severidadeScore === 2) {
    severity = "media";
    recommendation = "Observar o pet nas próximas horas e considerar agendar consulta.";
  } else {
    severity = "baixa";
    recommendation = "Monitorar continuamente; nenhuma ação imediata necessária.";
  }

  return {
    severity,
    message: `Anomalia detectada para o pet '${petNome}'.`,
    signals,
    recommendation,
  };
}

function emojiEspecie(especie) {
  return { CAO: "🐕", GATO: "🐈", COELHO: "🐇", OUTRO: "🐾" }[especie] || "🐾";
}

export default function Monitoramento({ navigation }) {
  const { t } = useTheme();

  const { data: pets = [], isLoading: carregandoPets } = useAnimais();

  const [petSelecionadoId, SetPetSelecionadoId] = useState(null);
  const [historicos, SetHistoricos]             = useState({});
  const [atualizando, SetAtualizando]           = useState(false);
  const [modalLog, SetModalLog]                 = useState(false);

  const petAtivo = pets.find((p) => p.id === petSelecionadoId) || pets[0] || null;

  function seedarHistorico(pet) {
    SetHistoricos((prev) => {
      if (prev[pet.id]) return prev;
      const base = Array.from({ length: BASELINE_MINIMO + 2 }, () => gerarLeitura(pet, false));
      return { ...prev, [pet.id]: base };
    });
  }

  function selecionarPet(pet) {
    SetPetSelecionadoId(pet.id);
    seedarHistorico(pet);
  }

  function novaLeitura() {
    if (!petAtivo) return;
    seedarHistorico(petAtivo);
    SetHistoricos((prev) => {
      const historicoPet = prev[petAtivo.id] || [];
      const leitura = gerarLeitura(petAtivo);
      const atualizado = [...historicoPet, leitura].slice(-HISTORICO_MAXIMO);
      return { ...prev, [petAtivo.id]: atualizado };
    });
  }

  async function aoAtualizar() {
    SetAtualizando(true);
    novaLeitura();
    await new Promise((resolve) => setTimeout(resolve, 400));
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

  function estiloSeveridade(severidade) {
    if (severidade === "critica") return { cor: t.danger,  icone: "warning",       label: "CRÍTICA" };
    if (severidade === "media")   return { cor: t.warning, icone: "error-outline", label: "MÉDIA" };
    return                              { cor: t.success, icone: "info-outline",  label: "BAIXA" };
  }

  const historicoAtual = petAtivo ? (historicos[petAtivo.id] || []) : [];
  const leitura = historicoAtual[historicoAtual.length - 1] || null;
  const s       = leitura?.sensors;
  const lim     = LIMITES[petAtivo?.especie] || LIMITES.OUTRO;

  const alertaIA = (petAtivo && historicoAtual.length > 0)
    ? avaliarAnomalia(petAtivo.nome, historicoAtual)
    : null;

  const stTemp = s ? statusTemperatura(s.temperature_celsius, lim) : null;
  const stHR   = s ? statusFrequencia(s.heart_rate_bpm, lim) : null;

  useEffect(() => {
    if (petAtivo && !historicos[petAtivo.id]) {
      seedarHistorico(petAtivo);
    }
  }, [petAtivo?.id, carregandoPets]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={[styles.titulo, { color: t.text }]}>Monitoramento</Text>
          <Text style={[styles.subtitulo, { color: t.muted }]}>Simulação local de sensores</Text>
        </View>
      </View>

      {carregandoPets ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : pets.length === 0 ? (
        <View style={styles.semPets}>
          <FontAwesome5 name="paw" size={48} color={t.muted2} />
          <Text style={[styles.semPetsTitulo, { color: t.text }]}>Nenhum pet cadastrado</Text>
          <Text style={[styles.semPetsTexto, { color: t.muted }]}>
            Adicione um pet no Perfil para começar o monitoramento.
          </Text>
          <TouchableOpacity
            style={[styles.botaoIrPerfil, { backgroundColor: t.primary }]}
            onPress={() => navigation.navigate("Perfil")}
          >
            <MaterialIcons name="pets" size={18} color="#fff" />
            <Text style={styles.botaoIrPerfilTexto}>Ir para Perfil</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={styles.petScroll} contentContainerStyle={styles.petScrollContent}>
            {pets.map((p) => (
              <Chip key={p.id} label={emojiEspecie(p.especie) + " " + p.nome} ativo={petAtivo?.id === p.id} onPress={() => selecionarPet(p)} />
            ))}
          </ScrollView>

          <Button
            label="Gerar Nova Leitura"
            onPress={novaLeitura}
            icon={<MaterialIcons name="refresh" size={18} color="#fff" />}
            style={{ marginHorizontal: 20, marginVertical: 10 }}
          />

          <ScrollView showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingHorizontal: 20 }]}
            refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[t.primary]} />}>

          {s ? (
          <>
            <Text style={[styles.secaoTitulo, { color: t.text }]}>Sensores</Text>

            <View style={styles.gridSensores}>
              {[
                { icone: "thermostat",    cor: t.danger,  valor: s.temperature_celsius, unidade: "°C",  label: "Temperatura", st: stTemp },
                { icone: "favorite",      cor: t.primary, valor: s.heart_rate_bpm,       unidade: " bpm",label: "Freq. Cardíaca", st: stHR },
                { icone: "directions-run",cor: t.warning, valor: s.steps_last_minute,    unidade: "/min",label: "Atividade",
                  st: { texto: s.activity_score > 0.1 ? "Ativo" : "Atividade baixa",
                        cor:   s.activity_score > 0.1 ? t.success : t.warning,
                        icone: s.activity_score > 0.1 ? "check-circle" : "warning" } },
                { icone: "monitor-weight",cor: t.success, valor: s.weight_kg ?? "—",     unidade: s.weight_kg != null ? " kg" : "", label: "Peso",
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

            {alertaIA && (
              <>
                <Text style={[styles.secaoTitulo, { color: t.text }]}>Alerta de IA · Modelo Preditivo</Text>
                {(() => {
                  const sev = estiloSeveridade(alertaIA.severity);
                  return (
                    <View style={[styles.cardAlertaIA, { backgroundColor: t.surfaceCard, borderLeftColor: sev.cor }]}>
                      <View style={styles.cardAlertaIAHeader}>
                        <MaterialIcons name={sev.icone} size={20} color={sev.cor} />
                        <Text style={[styles.cardAlertaIASeveridade, { color: sev.cor }]}>{sev.label}</Text>
                      </View>

                      <Text style={[styles.cardAlertaIAMensagem, { color: t.text }]}>{alertaIA.message}</Text>

                      {alertaIA.signals.map((sinal, i) => (
                        <Text key={i} style={[styles.cardAlertaIASinal, { color: t.text2 }]}>• {sinal}</Text>
                      ))}

                      <View style={[styles.cardAlertaIARecomendacaoBox, { borderColor: sev.cor }]}>
                        <Text style={[styles.cardAlertaIARecomendacao, { color: sev.cor }]}>
                          {alertaIA.recommendation}
                        </Text>
                      </View>

                      {alertaIA.severity !== "baixa" && (
                        <Button
                          label="Agendar Consulta"
                          onPress={() => navigation.navigate("Consultas")}
                          style={{ marginTop: 10, backgroundColor: sev.cor, borderColor: sev.cor }}
                          icon={<MaterialIcons name="event" size={18} color="#fff" />}
                        />
                      )}
                    </View>
                  );
                })()}
              </>
            )}
          </>
          ) : (
            <View style={styles.carregando}>
              <FontAwesome5 name="paw" size={40} color={t.muted2} />
              <Text style={[styles.carregandoTexto, { color: t.muted2 }]}>Preparando leituras iniciais...</Text>
            </View>
          )}

          <Button
            label={`Ver Histórico${historicoAtual.length > 0 ? "  (" + historicoAtual.length + ")" : ""}`}
            variant="outline"
            onPress={() => SetModalLog(true)}
            icon={<MaterialIcons name="history" size={18} color={t.btnOutlineText} />}
            style={{ marginTop: 8 }}
          />
          </ScrollView>
        </>
      )}

      <Modal visible={modalLog} animationType="slide" transparent>
        <View style={[styles.modalFundo, { backgroundColor: t.modalFundo }]}>
          <View style={[styles.modalContainer, { backgroundColor: t.modalBg }]}>
            <View style={styles.modalCabecalho}>
              <Text style={[styles.modalTitulo, { color: t.text }]}>Histórico de Leituras</Text>
              <TouchableOpacity onPress={() => SetModalLog(false)}>
                <MaterialIcons name="close" size={24} color={t.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitulo, { color: t.muted }]}>
              Leituras simuladas localmente no dispositivo
            </Text>
            {historicoAtual.length === 0 ? (
              <View style={styles.logVazio}>
                <MaterialIcons name="history" size={40} color={t.muted2} />
                <Text style={[styles.logVazioTexto, { color: t.muted2 }]}>Nenhuma leitura ainda</Text>
              </View>
            ) : (
              <FlatList
                data={[...historicoAtual].reverse()}
                keyExtractor={(i) => i.id}
                style={{ maxHeight: 380 }}
                renderItem={({ item }) => (
                  <View style={[styles.logItem, { backgroundColor: t.bg2 }]}>
                    <Text style={[styles.logTs, { color: t.muted }]}>
                      {item.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </Text>
                    <Text style={[styles.logMensagem, { color: t.text2 }]} numberOfLines={2}>
                      T:{item.sensors.temperature_celsius}°C  HR:{item.sensors.heart_rate_bpm}bpm  Steps:{item.sensors.steps_last_minute}
                    </Text>
                  </View>
                )}
              />
            )}
            <Button
              label="Limpar histórico"
              variant="danger"
              onPress={() => { if (petAtivo) SetHistoricos((prev) => ({ ...prev, [petAtivo.id]: [] })); SetModalLog(false); }}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 4,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 12,
    marginTop: 2,
  },
  petScroll: {
    marginTop: 12,
    marginBottom: 4,
  },
  petScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  scroll: {
    paddingTop: 4,
    paddingBottom: 30,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
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
  cardAlertaIA: {
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardAlertaIAHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  cardAlertaIASeveridade: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cardAlertaIAMensagem: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardAlertaIASinal: {
    fontSize: 12.5,
    marginBottom: 2,
    lineHeight: 17,
  },
  cardAlertaIARecomendacaoBox: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginTop: 8,
  },
  cardAlertaIARecomendacao: {
    fontSize: 13,
    fontWeight: "600",
  },
  semPets: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
    paddingTop: 60,
  },
  semPetsTitulo: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },
  semPetsTexto: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  botaoIrPerfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  botaoIrPerfilTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  carregando: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
    flex: 1,
  },
  carregandoTexto: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  modalFundo: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
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
  },
  modalSubtitulo: {
    fontSize: 12,
    marginBottom: 16,
  },
  logVazio: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 10,
  },
  logVazioTexto: {
    fontSize: 14,
  },
  logItem: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 2,
  },
  logTs: {
    fontSize: 10,
  },
  logMensagem: {
    fontSize: 12,
    marginTop: 2,
  },
});