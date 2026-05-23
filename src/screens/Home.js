import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Text, View, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";

const API_BASE = "http://localhost:8080";

export default function Home({ navigation }) {
  const { t } = useTheme();

  const [dados, SetDados]             = useState(null);
  const [pets, SetPets]               = useState([]);
  const [vacinas, SetVacinas]         = useState([]);
  const [iot, SetIot]                 = useState(null);
  const [iotOnline, SetIotOnline]     = useState(false);
  const [atualizando, SetAtualizando] = useState(false);

  useEffect(() => { carregarTudo(); }, []);

  async function carregarTudo() {
    const dadosSalvos = await AsyncStorage.getItem("INFORMACOES");
    if (dadosSalvos) SetDados(JSON.parse(dadosSalvos));
    const petsSalvos = await AsyncStorage.getItem("PETS");
    if (petsSalvos) SetPets(JSON.parse(petsSalvos));
    const vacinasSalvas = await AsyncStorage.getItem("VACINAS");
    if (vacinasSalvas) SetVacinas(JSON.parse(vacinasSalvas));
    await buscarIoT();
  }

  async function buscarIoT() {
    try {
      const res = await fetch(`${API_BASE}/api/latest/rex`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.sensors) throw new Error();
      SetIot(data); SetIotOnline(true);
    } catch { SetIotOnline(false); SetIot(null); }
  }

  async function aoAtualizar() {
    SetAtualizando(true);
    await carregarTudo();
    SetAtualizando(false);
  }

  function diasAteVencimento(proxDose) {
    if (!proxDose || proxDose.length < 10) return null;
    const p = proxDose.split("/");
    if (p.length !== 3) return null;
    const data = new Date(`${p[2]}-${p[1]}-${p[0]}`);
    if (isNaN(data)) return null;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return Math.round((data - hoje) / 86400000);
  }

  const vacinasOrdenadas = [...vacinas]
    .map((v) => ({ ...v, dias: diasAteVencimento(v.proxDose) }))
    .filter((v) => v.dias !== null)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 4);

  function corDias(dias) {
    if (dias <= 7)  return t.danger;
    if (dias <= 30) return t.warning;
    return t.success;
  }

  function textoDias(dias) {
    if (dias < 0)   return `Venceu há ${Math.abs(dias)}d`;
    if (dias === 0) return "Vence hoje";
    if (dias === 1) return "Vence amanhã";
    return `Em ${dias} dias`;
  }

  const primeiroNome = dados?.nome?.split(" ")[0] || "";
  const s = iot?.sensors;

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} colors={[t.primary]} />
      }
    >
      <View style={styles.saudacao}>
        <View>
          <Text style={[styles.saudacaoTexto, { color: t.text }]}>
            Olá, {primeiroNome || "bem-vindo"}! 👋
          </Text>
          <Text style={[styles.saudacaoSub, { color: t.muted }]}>
            {pets.length === 0
              ? "Cadastre seu primeiro pet no Perfil"
              : `Você tem ${pets.length} pet${pets.length !== 1 ? "s" : ""} cadastrado${pets.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
        <View style={[styles.avatarPequeno, { backgroundColor: t.primary }]}>
          <Text style={styles.avatarLetra}>
            {primeiroNome ? primeiroNome.charAt(0).toUpperCase() : "?"}
          </Text>
        </View>
      </View>

      <View style={styles.atalhos}>
        {[
          { icone: "vaccines",       cor: t.primary,  bg: t.primaryBg,  label: "Vacinas",   tela: "Vacinas"   },
          { icone: "local-hospital", cor: t.success,  bg: t.successBg,  label: "Consultas", tela: "Consultas" },
          { icone: "sensors",        cor: t.warning,  bg: t.warningBg,  label: "Monitor",   tela: "IoT"       },
          { icone: "emoji-emotions", cor: t.danger,   bg: t.dangerBg,   label: "Perfil",    tela: "Perfil"    },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={styles.atalho} onPress={() => navigation.navigate(a.tela)}>
            <View style={[styles.atalhoIcone, { backgroundColor: a.bg }]}>
              <MaterialIcons name={a.icone} size={24} color={a.cor} />
            </View>
            <Text style={[styles.atalhoTexto, { color: t.text2 }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.secaoHeader}>
        <Text style={[styles.secaoTitulo, { color: t.text }]}>Monitor IoT</Text>
        <TouchableOpacity onPress={() => navigation.navigate("IoT")}>
          <Text style={[styles.secaoLink, { color: t.primary }]}>Ver mais</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.cardIoT, { backgroundColor: t.surfaceCard }]}
        onPress={() => navigation.navigate("IoT")}
        activeOpacity={0.8}
      >
        <View style={styles.cardIoTHeader}>
          <View style={styles.cardIoTPet}>
            <FontAwesome5 name="paw" size={16} color={t.primary} />
            <Text style={[styles.cardIoTPetNome, { color: t.text }]}>Rex</Text>
          </View>
          <View style={[styles.badgeStatus, { backgroundColor: iotOnline ? t.successBg : t.warningBg }]}>
            <MaterialIcons name={iotOnline ? "wifi" : "wifi-off"} size={12}
              color={iotOnline ? t.success : t.warning} />
            <Text style={[styles.badgeStatusTexto, { color: iotOnline ? t.success : t.warning }]}>
              {iotOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {s ? (
          <View style={styles.cardIoTSensores}>
            {[
              { icone: "thermostat",    cor: t.danger,  val: `${s.temperature_celsius}°C`, label: "Temp."    },
              { icone: "favorite",      cor: t.primary, val: `${s.heart_rate_bpm} bpm`,    label: "Cardíaca" },
              { icone: "directions-run",cor: t.warning, val: `${s.steps_last_minute}/min`, label: "Atividade"},
            ].map((item, i, arr) => (
              <View key={item.label} style={styles.cardIoTSensorWrap}>
                <View style={styles.cardIoTSensor}>
                  <MaterialIcons name={item.icone} size={18} color={item.cor} />
                  <Text style={[styles.cardIoTValor, { color: t.text }]}>{item.val}</Text>
                  <Text style={[styles.cardIoTLabel, { color: t.muted }]}>{item.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={[styles.cardIoTDivisor, { backgroundColor: t.divisor }]} />}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.cardIoTVazio}>
            <MaterialIcons name="wifi-off" size={22} color={t.muted2} />
            <Text style={[styles.cardIoTVazioTexto, { color: t.muted2 }]}>
              Inicie o petlink_server.py para ver os dados
            </Text>
          </View>
        )}

        <View style={[styles.cardIoTRodape, { borderTopColor: t.divisor }]}>
          <Text style={[styles.cardIoTRodapeTexto, { color: t.text2 }]}>
            Score de saúde: {iot ? Math.round(iot.health_score) : "—"}/100
          </Text>
          <MaterialIcons name="chevron-right" size={18} color={t.muted} />
        </View>
      </TouchableOpacity>

      <View style={styles.secaoHeader}>
        <Text style={[styles.secaoTitulo, { color: t.text }]}>Próximas Doses</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Vacinas")}>
          <Text style={[styles.secaoLink, { color: t.primary }]}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      {vacinasOrdenadas.length === 0 ? (
        <TouchableOpacity
          style={[styles.cardVazio, { backgroundColor: t.surfaceCard }]}
          onPress={() => navigation.navigate("Vacinas")}
        >
          <FontAwesome5 name="paw" size={28} color={t.muted2} />
          <Text style={[styles.cardVazioTexto, { color: t.muted2 }]}>Nenhuma vacina cadastrada</Text>
          <Text style={[styles.cardVazioSub, { color: t.muted2 }]}>Toque para adicionar</Text>
        </TouchableOpacity>
      ) : (
        vacinasOrdenadas.map((vacina) => (
          <View key={vacina.id} style={[styles.card, { backgroundColor: t.surfaceCard }]}>
            <View style={[styles.cardIcone, { backgroundColor: corDias(vacina.dias) + "20" }]}>
              <MaterialIcons
                name={vacina.dias <= 0 ? "error" : vacina.dias <= 7 ? "warning" : vacina.dias <= 30 ? "schedule" : "check-circle"}
                size={22} color={corDias(vacina.dias)} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardNome, { color: t.text }]}>{vacina.nomeVacina}</Text>
              <Text style={[styles.cardDetalhe, { color: t.text2 }]}>
                🐾 {vacina.nomePet}  ·  Próx. dose: {vacina.proxDose}
              </Text>
            </View>
            <View style={[styles.badgeDias, { backgroundColor: corDias(vacina.dias) + "20" }]}>
              <Text style={[styles.badgeDiasTexto, { color: corDias(vacina.dias) }]}>
                {textoDias(vacina.dias)}
              </Text>
            </View>
          </View>
        ))
      )}

      {pets.length > 0 && (
        <>
          <View style={styles.secaoHeader}>
            <Text style={[styles.secaoTitulo, { color: t.text }]}>Meus Pets</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              <Text style={[styles.secaoLink, { color: t.primary }]}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
          {pets.map((pet) => (
            <View key={pet.id} style={[styles.card, { backgroundColor: t.surfaceCard }]}>
              <View style={[styles.cardIcone, { backgroundColor: t.primaryBg }]}>
                <FontAwesome5 name="paw" size={20} color={t.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardNome, { color: t.text }]}>{pet.nome}</Text>
                <Text style={[styles.cardDetalhe, { color: t.text2 }]}>
                  Idade: {pet.idade}  ·  Peso: {pet.peso}  ·  Tamanho: {pet.tamanho}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  saudacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  saudacaoTexto: {
    fontSize: 22,
    fontWeight: "bold",
  },
  saudacaoSub: {
    fontSize: 13,
    marginTop: 4,
  },
  avatarPequeno: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetra: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  atalhos: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  atalho: {
    alignItems: "center",
    gap: 6,
  },
  atalhoIcone: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  atalhoTexto: {
    fontSize: 11,
    fontWeight: "500",
  },
  secaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
  },
  secaoLink: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardIoT: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  cardIoTHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardIoTPet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  cardIoTPetNome: {
    fontSize: 15,
    fontWeight: "bold",
  },
  badgeStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeStatusTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },
  cardIoTSensores: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  cardIoTSensorWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  cardIoTSensor: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  cardIoTValor: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cardIoTLabel: {
    fontSize: 11,
  },
  cardIoTDivisor: {
    width: 1,
    height: 40,
  },
  cardIoTVazio: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
    marginBottom: 14,
  },
  cardIoTVazioTexto: {
    fontSize: 13,
    textAlign: "center",
  },
  cardIoTRodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  cardIoTRodapeTexto: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  },
  badgeDias: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeDiasTexto: {
    fontSize: 11,
    fontWeight: "bold",
  },
  cardVazio: {
    alignItems: "center",
    paddingVertical: 28,
    borderRadius: 12,
    marginBottom: 28,
    gap: 6,
  },
  cardVazioTexto: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cardVazioSub: {
    fontSize: 13,
  },
});