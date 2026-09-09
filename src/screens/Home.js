import { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useSessao } from "../hooks/useAuth";
import { useAnimais } from "../hooks/useAnimais";
import { useVacinas } from "../hooks/useVacinas";

const IOT_API_BASE = "http://localhost:8080"; 

function emojiEspecie(especie) {
  return { CAO: "🐕", GATO: "🐈", COELHO: "🐇", OUTRO: "🐾" }[especie] || "🐾";
}

export default function Home({ navigation }) {
  const { t } = useTheme();
  const { data: sessao } = useSessao();
  const usuario = sessao?.usuario;

  const { data: pets = [], refetch: refetchPets, isRefetching: atualizandoPets } = useAnimais();
  const { data: vacinas = [], refetch: refetchVacinas, isRefetching: atualizandoVacinas } = useVacinas();

  const [iot, SetIot] = useState(null);
  const [iotOnline, SetIotOnline] = useState(false);
  const [atualizandoIot, SetAtualizandoIot] = useState(false);

  async function buscarIoT() {
    try {
      const res = await fetch(`${IOT_API_BASE}/api/latest/rex`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.sensors) throw new Error();
      SetIot(data); SetIotOnline(true);
    } catch {
      SetIotOnline(false); SetIot(null);
    }
  }

  async function aoAtualizar() {
    SetAtualizandoIot(true);
    await Promise.all([refetchPets(), refetchVacinas(), buscarIoT()]);
    SetAtualizandoIot(false);
  }

  const vacinasOrdenadas = [...vacinas]
    .filter((v) => v.dias !== null && v.dias !== undefined)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 3);

  function corDias(dias) {
    if (dias <= 7) return t.danger;
    if (dias <= 30) return t.warning;
    return t.success;
  }

  function textoDias(dias) {
    if (dias < 0) return `Venceu há ${Math.abs(dias)}d`;
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    return `${dias}d`;
  }

  const primeiroNome = usuario?.nome?.split(" ")[0] || "";
  const s = iot?.sensors;
  const horaAtual = new Date().getHours();
  const saudacao = horaAtual < 12 ? "Bom dia" : horaAtual < 18 ? "Boa tarde" : "Boa noite";
  const atualizando = atualizandoPets || atualizandoVacinas || atualizandoIot;

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[t.primary]} />}
    >

      <View style={[header.wrap, { backgroundColor: t.surfaceCard, borderBottomColor: t.border }]}>
        <View>
          <Text style={[header.saudacao, { color: t.muted }]}>{saudacao},</Text>
          <Text style={[header.nome, { color: t.text }]}>{primeiroNome || "Tutor"}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}
          style={[header.avatar, { backgroundColor: t.primaryBg, borderColor: t.primary + "40" }]}>
          <Text style={[header.avatarLetra, { color: t.primary }]}>
            {primeiroNome ? primeiroNome.charAt(0).toUpperCase() : "?"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20 }}>

        <View style={[strip.wrap, { backgroundColor: t.surfaceCard, borderColor: t.border }]}>
          {[
            { val: pets.length, label: "Pets", cor: t.primary, icone: "paw", lib: "fa5" },
            { val: vacinas.length, label: "Vacinas", cor: t.success, icone: "vaccines", lib: "material" },
            { val: iot ? Math.round(iot.health_score) : "—", label: "Saúde", cor: t.warning, icone: "favorite", lib: "material" },
          ].map((item, i, arr) => (
            <View key={item.label} style={[strip.item, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: t.border }]}>
              {item.lib === "fa5"
                ? <FontAwesome5 name={item.icone} size={14} color={item.cor} />
                : <MaterialIcons name={item.icone} size={16} color={item.cor} />}
              <Text style={[strip.val, { color: t.text }]}>{item.val}</Text>
              <Text style={[strip.label, { color: t.muted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[sec.titulo, { color: t.text, marginTop: 24 }]}>Acesso rápido</Text>
        <View style={atalhos.grid}>
          {[
            { icone: "vaccines", lib: "material", cor: "#fff", bg: t.primary, label: "Vacinas", sub: `${vacinas.length} registros`, tela: "Vacinas", destaque: true },
            { icone: "stethoscope", lib: "fa5", cor: "#fff", bg: t.success, label: "Consultas", sub: "Agendar", tela: "Consultas", destaque: true },
            { icone: "sensors", lib: "material", cor: t.warning, bg: t.warningBg, label: "Monitor", sub: iotOnline ? "Online" : "Offline", tela: "Monitoramento", destaque: false },
            { icone: "paw", lib: "fa5", cor: t.primary, bg: t.primaryBg, label: "Perfil", sub: `${pets.length} pets`, tela: "Perfil", destaque: false },
          ].map((a) => (
            <TouchableOpacity key={a.label} activeOpacity={0.8}
              style={[
                atalhos.card,
                { backgroundColor: a.bg, borderColor: a.destaque ? "transparent" : t.border, borderWidth: 1 },
                a.destaque && { shadowColor: a.bg, shadowOpacity: 0.45, shadowRadius: 10, elevation: 6 },
              ]}
              onPress={() => navigation.navigate(a.tela)}>
              <View style={[atalhos.iconeWrap, { backgroundColor: a.destaque ? "rgba(255,255,255,0.2)" : t.bg }]}>
                {a.lib === "fa5"
                  ? <FontAwesome5 name={a.icone} size={18} color={a.cor} />
                  : <MaterialIcons name={a.icone} size={20} color={a.cor} />}
              </View>
              <Text style={[atalhos.label, { color: a.destaque ? "#fff" : t.text }]}>{a.label}</Text>
              <Text style={[atalhos.sub, { color: a.destaque ? "rgba(255,255,255,0.75)" : t.muted }]}>{a.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={sec.header}>
          <Text style={[sec.titulo, { color: t.text }]}>Monitoramento IoT</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Monitoramento")}>
            <Text style={[sec.link, { color: t.primary }]}>Ver mais</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.85}
          style={[iot_card.wrap, { backgroundColor: t.surfaceCard, borderColor: t.border }]}
          onPress={() => navigation.navigate("Monitoramento")}>

          <View style={iot_card.top}>
            <View style={iot_card.petRow}>
              <View style={[iot_card.petIcone, { backgroundColor: t.primaryBg }]}>
                <FontAwesome5 name="paw" size={13} color={t.primary} />
              </View>
              <Text style={[iot_card.petNome, { color: t.text }]}>Rex</Text>
            </View>
            <View style={[iot_card.badge, { backgroundColor: iotOnline ? t.successBg : t.warningBg }]}>
              <View style={[iot_card.dot, { backgroundColor: iotOnline ? t.success : t.warning }]} />
              <Text style={[iot_card.badgeTexto, { color: iotOnline ? t.success : t.warning }]}>
                {iotOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          {s ? (
            <View style={iot_card.sensores}>
              {[
                { icone: "thermostat", cor: t.danger, val: `${s.temperature_celsius}°C`, label: "Temperatura", bg: t.dangerBg },
                { icone: "favorite", cor: t.primary, val: `${s.heart_rate_bpm}`, label: "BPM", bg: t.primaryBg },
                { icone: "directions-run", cor: t.warning, val: `${s.steps_last_minute}`, label: "Passos/min", bg: t.warningBg },
              ].map((item) => (
                <View key={item.label} style={[iot_card.sensor, { backgroundColor: item.bg }]}>
                  <MaterialIcons name={item.icone} size={16} color={item.cor} />
                  <Text style={[iot_card.sensorVal, { color: item.cor }]}>{item.val}</Text>
                  <Text style={[iot_card.sensorLabel, { color: item.cor + "AA" }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={iot_card.vazio}>
              <MaterialIcons name="wifi-off" size={20} color={t.muted2} />
              <Text style={[iot_card.vazioTexto, { color: t.muted2 }]}>
                Inicie o petlink_server.py para ver os dados
              </Text>
            </View>
          )}

          <View style={[iot_card.rodape, { borderTopColor: t.border }]}>
            <View style={iot_card.scoreRow}>
              <Text style={[iot_card.scoreLabel, { color: t.muted }]}>Score de saúde</Text>
              <Text style={[iot_card.scoreVal, { color: t.text }]}>
                {iot ? `${Math.round(iot.health_score)}/100` : "—"}
              </Text>
            </View>
            {iot && (
              <View style={[iot_card.barFundo, { backgroundColor: t.border }]}>
                <View style={[iot_card.barPreenchida, {
                  width: `${iot.health_score}%`,
                  backgroundColor: iot.health_score >= 80 ? t.success : iot.health_score >= 50 ? t.warning : t.danger,
                }]} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <View style={sec.header}>
          <Text style={[sec.titulo, { color: t.text }]}>Próximas Doses</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Vacinas")}>
            <Text style={[sec.link, { color: t.primary }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {vacinasOrdenadas.length === 0 ? (
          <TouchableOpacity style={[vac.vazio, { backgroundColor: t.surfaceCard, borderColor: t.border }]}
            onPress={() => navigation.navigate("Vacinas")}>
            <View style={[vac.vazioIcone, { backgroundColor: t.primaryBg }]}>
              <MaterialIcons name="vaccines" size={28} color={t.primary} />
            </View>
            <Text style={[vac.vazioTexto, { color: t.text2 }]}>Nenhuma vacina cadastrada</Text>
            <Text style={[vac.vazioSub, { color: t.muted }]}>Toque para adicionar</Text>
          </TouchableOpacity>
        ) : (
          vacinasOrdenadas.map((item) => {
            const pet = pets.find((p) => p.id === item.vacina.animalId);
            const cor = corDias(item.dias);
            const proxima = item.vacina.proximaDose;
            const proximaBr = proxima ? proxima.split("-").reverse().join("/") : "—";
            return (
              <View key={item.vacina.id} style={[vac.card, { backgroundColor: t.surfaceCard, borderColor: t.border, borderLeftColor: cor }]}>
                <View style={[vac.icone, { backgroundColor: cor + "18" }]}>
                  <MaterialIcons
                    name={item.dias <= 0 ? "error" : item.dias <= 7 ? "warning" : item.dias <= 30 ? "schedule" : "check-circle"}
                    size={20} color={cor} />
                </View>
                <View style={vac.info}>
                  <Text style={[vac.nome, { color: t.text }]}>{item.vacina.nome}</Text>
                  <View style={vac.row}>
                    <FontAwesome5 name="paw" size={9} color={t.muted} />
                    <Text style={[vac.detalhe, { color: t.muted }]}>{pet?.nome || "Pet"}  ·  {proximaBr}</Text>
                  </View>
                </View>
                <View style={[vac.badge, { backgroundColor: cor + "18" }]}>
                  <Text style={[vac.badgeTexto, { color: cor }]}>{textoDias(item.dias)}</Text>
                </View>
              </View>
            );
          })
        )}

        {pets.length > 0 && (
          <>
            <View style={sec.header}>
              <Text style={[sec.titulo, { color: t.text }]}>Meus Pets</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
                <Text style={[sec.link, { color: t.primary }]}>Gerenciar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
              {pets.map((pet) => (
                <TouchableOpacity key={pet.id} activeOpacity={0.8}
                  style={[petCard.wrap, { backgroundColor: t.surfaceCard, borderColor: t.border }]}
                  onPress={() => navigation.navigate("Perfil")}>
                  <View style={[petCard.icone, { backgroundColor: t.primaryBg }]}>
                    <Text style={{ fontSize: 26 }}>{emojiEspecie(pet.especie)}</Text>
                  </View>
                  <Text style={[petCard.nome, { color: t.text }]}>{pet.nome}</Text>
                  {pet.raca ? <Text style={[petCard.raca, { color: t.muted }]}>{pet.raca}</Text> : null}
                  <View style={petCard.tags}>
                    <View style={[petCard.tag, { backgroundColor: t.bg2 }]}>
                      <Text style={[petCard.tagTexto, { color: t.text2 }]}>{pet.idade || "—"}</Text>
                    </View>
                    <View style={[petCard.tag, { backgroundColor: t.bg2 }]}>
                      <Text style={[petCard.tagTexto, { color: t.text2 }]}>{pet.peso ?? "—"}kg</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

      </View>
    </ScrollView>
  );
}

const header = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18, borderBottomWidth: 1, marginBottom: 20 },
  saudacao: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  nome: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 2 },
  avatarLetra: { fontSize: 20, fontWeight: "800" },
});

const strip = StyleSheet.create({
  wrap: { flexDirection: "row", borderRadius: 16, borderWidth: 1, marginBottom: 4, overflow: "hidden" },
  item: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 3 },
  val: { fontSize: 20, fontWeight: "800" },
  label: { fontSize: 11, fontWeight: "500" },
});

const sec = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 14 },
  titulo: { fontSize: 17, fontWeight: "700" },
  link: { fontSize: 13, fontWeight: "600" },
});

const atalhos = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47%", borderRadius: 18, padding: 16, gap: 6, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  iconeWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  label: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 12, fontWeight: "500" },
});

const iot_card = StyleSheet.create({
  wrap: { borderRadius: 20, padding: 18, borderWidth: 1, marginBottom: 4 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  petRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  petIcone: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  petNome: { fontSize: 15, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeTexto: { fontSize: 11, fontWeight: "700" },
  sensores: { flexDirection: "row", gap: 8, marginBottom: 16 },
  sensor: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center", gap: 4 },
  sensorVal: { fontSize: 18, fontWeight: "800" },
  sensorLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  vazio: { alignItems: "center", paddingVertical: 20, gap: 8, marginBottom: 16 },
  vazioTexto: { fontSize: 13, textAlign: "center" },
  rodape: { borderTopWidth: 1, paddingTop: 14, gap: 8 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scoreLabel: { fontSize: 12, fontWeight: "500" },
  scoreVal: { fontSize: 13, fontWeight: "700" },
  barFundo: { height: 6, borderRadius: 3, overflow: "hidden" },
  barPreenchida: { height: 6, borderRadius: 3 },
});

const vac = StyleSheet.create({
  vazio: { alignItems: "center", paddingVertical: 28, borderRadius: 18, gap: 10, borderWidth: 1, marginBottom: 4 },
  vazioIcone: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  vazioTexto: { fontSize: 15, fontWeight: "700" },
  vazioSub: { fontSize: 13 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderLeftWidth: 4 },
  icone: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 12 },
  info: { flex: 1 },
  nome: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  detalhe: { fontSize: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeTexto: { fontSize: 11, fontWeight: "800" },
});

const petCard = StyleSheet.create({
  wrap: { width: 140, borderRadius: 18, padding: 16, alignItems: "center", gap: 6, borderWidth: 1 },
  icone: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  nome: { fontSize: 15, fontWeight: "700" },
  raca: { fontSize: 11, fontWeight: "500" },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagTexto: { fontSize: 10, fontWeight: "600" },
});