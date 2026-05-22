import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import {Text,View,StyleSheet,ScrollView,TouchableOpacity,RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const API_BASE = "http://localhost:8080";

export default function Home({ navigation }) {
  const [dados, SetDados]       = useState(null);
  const [pets, SetPets]         = useState([]);
  const [vacinas, SetVacinas]   = useState([]);
  const [iot, SetIot]           = useState(null);
  const [iotOnline, SetIotOnline] = useState(false);
  const [atualizando, SetAtualizando] = useState(false);

  useEffect(() => {
    carregarTudo();
  }, []);

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
      const res = await fetch(`${API_BASE}/api/latest/rex`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.sensors) throw new Error();
      SetIot(data);
      SetIotOnline(true);
    } catch {
      SetIotOnline(false);
      SetIot(null);
    }
  }

  async function aoAtualizar() {
    SetAtualizando(true);
    await carregarTudo();
    SetAtualizando(false);
  }

  // Calcula dias até a próxima dose de uma vacina
  function diasAteVencimento(proxDose) {
    if (!proxDose || proxDose.length < 10) return null;
    const partes = proxDose.split("/");
    if (partes.length !== 3) return null;
    const data = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
    if (isNaN(data)) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diff = Math.round((data - hoje) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Vacinas ordenadas por vencimento mais próximo
  const vacinasOrdenadas = [...vacinas]
    .map((v) => ({ ...v, dias: diasAteVencimento(v.proxDose) }))
    .filter((v) => v.dias !== null)
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 4);

  function corDias(dias) {
    if (dias < 0)  return "#e74c3c";
    if (dias <= 7)  return "#e74c3c";
    if (dias <= 30) return "#f39c12";
    return "#27ae60";
  }

  function textoDias(dias) {
    if (dias < 0)  return `Venceu há ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? "s" : ""}`;
    if (dias === 0) return "Vence hoje";
    if (dias === 1) return "Vence amanhã";
    return `Em ${dias} dias`;
  }

  function iconeDias(dias) {
    if (dias < 0)  return "error";
    if (dias <= 7)  return "warning";
    if (dias <= 30) return "schedule";
    return "check-circle";
  }

  const primeiroNome = dados?.nome?.split(" ")[0] || "";

  const s = iot?.sensors;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={aoAtualizar}
          colors={["#4A90E2"]}
        />
      }
    >

      {/* ── Saudação ── */}
      <View style={styles.saudacao}>
        <View>
          <Text style={styles.saudacaoTexto}>
            Olá, {primeiroNome || "bem-vindo"}! 👋
          </Text>
          <Text style={styles.saudacaoSub}>
            {pets.length === 0
              ? "Cadastre seu primeiro pet no Perfil"
              : `Você tem ${pets.length} pet${pets.length !== 1 ? "s" : ""} cadastrado${pets.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
        <View style={styles.avatarPequeno}>
          <Text style={styles.avatarLetra}>
            {primeiroNome ? primeiroNome.charAt(0).toUpperCase() : "?"}
          </Text>
        </View>
      </View>

      {/* ── Atalhos rápidos ── */}
      <View style={styles.atalhos}>
        <TouchableOpacity
          style={styles.atalho}
          onPress={() => navigation.navigate("Vacinas")}
        >
          <View style={[styles.atalhoIcone, { backgroundColor: "#eaf3fb" }]}>
            <MaterialIcons name="vaccines" size={24} color="#4A90E2" />
          </View>
          <Text style={styles.atalhoTexto}>Vacinas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.atalho}
          onPress={() => navigation.navigate("Consultas")}
        >
          <View style={[styles.atalhoIcone, { backgroundColor: "#eafaf1" }]}>
            <MaterialIcons name="local-hospital" size={24} color="#27ae60" />
          </View>
          <Text style={styles.atalhoTexto}>Consultas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.atalho}
          onPress={() => navigation.navigate("IoT")}
        >
          <View style={[styles.atalhoIcone, { backgroundColor: "#fef9e7" }]}>
            <MaterialIcons name="sensors" size={24} color="#f39c12" />
          </View>
          <Text style={styles.atalhoTexto}>Monitor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.atalho}
          onPress={() => navigation.navigate("Perfil")}
        >
          <View style={[styles.atalhoIcone, { backgroundColor: "#fdecea" }]}>
            <MaterialIcons name="emoji-emotions" size={24} color="#e74c3c" />
          </View>
          <Text style={styles.atalhoTexto}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* ── Card IoT ── */}
      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>Monitor IoT</Text>
        <TouchableOpacity onPress={() => navigation.navigate("IoT")}>
          <Text style={styles.secaoLink}>Ver mais</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cardIoT}
        onPress={() => navigation.navigate("IoT")}
        activeOpacity={0.8}
      >
        <View style={styles.cardIoTHeader}>
          <View style={styles.cardIoTPet}>
            <FontAwesome5 name="paw" size={16} color="#4A90E2" />
            <Text style={styles.cardIoTPetNome}>Rex</Text>
          </View>
          <View style={[styles.badgeStatus, iotOnline ? styles.badgeOnline : styles.badgeOffline]}>
            <MaterialIcons
              name={iotOnline ? "wifi" : "wifi-off"}
              size={12}
              color={iotOnline ? "#27ae60" : "#f39c12"}
            />
            <Text style={[styles.badgeStatusTexto, { color: iotOnline ? "#27ae60" : "#f39c12" }]}>
              {iotOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {s ? (
          <View style={styles.cardIoTSensores}>
            <View style={styles.cardIoTSensor}>
              <MaterialIcons name="thermostat" size={18} color="#e74c3c" />
              <Text style={styles.cardIoTValor}>{s.temperature_celsius}°C</Text>
              <Text style={styles.cardIoTLabel}>Temp.</Text>
            </View>
            <View style={styles.cardIoTDivisor} />
            <View style={styles.cardIoTSensor}>
              <MaterialIcons name="favorite" size={18} color="#4A90E2" />
              <Text style={styles.cardIoTValor}>{s.heart_rate_bpm} bpm</Text>
              <Text style={styles.cardIoTLabel}>Cardíaca</Text>
            </View>
            <View style={styles.cardIoTDivisor} />
            <View style={styles.cardIoTSensor}>
              <MaterialIcons name="directions-run" size={18} color="#f39c12" />
              <Text style={styles.cardIoTValor}>{s.steps_last_minute}/min</Text>
              <Text style={styles.cardIoTLabel}>Atividade</Text>
            </View>
          </View>
        ) : (
          <View style={styles.cardIoTVazio}>
            <MaterialIcons name="wifi-off" size={22} color="#ccc" />
            <Text style={styles.cardIoTVazioTexto}>
              Inicie o petlink_server.py para ver os dados
            </Text>
          </View>
        )}

        <View style={styles.cardIoTRodape}>
          <Text style={styles.cardIoTRodapeTexto}>
            Score de saúde: {iot ? Math.round(iot.health_score) : "—"}/100
          </Text>
          <MaterialIcons name="chevron-right" size={18} color="#888" />
        </View>
      </TouchableOpacity>

      {/* ── Próximas vacinas ── */}
      <View style={styles.secaoHeader}>
        <Text style={styles.secaoTitulo}>Próximas Doses</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Vacinas")}>
          <Text style={styles.secaoLink}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      {vacinasOrdenadas.length === 0 ? (
        <TouchableOpacity
          style={styles.cardVazio}
          onPress={() => navigation.navigate("Vacinas")}
        >
          <FontAwesome5 name="paw" size={28} color="#ccc" />
          <Text style={styles.cardVazioTexto}>Nenhuma vacina cadastrada</Text>
          <Text style={styles.cardVazioSub}>Toque para adicionar</Text>
        </TouchableOpacity>
      ) : (
        vacinasOrdenadas.map((vacina) => (
          <View key={vacina.id} style={styles.card}>
            <View style={[styles.cardIcone, { backgroundColor: corDias(vacina.dias) + "18" }]}>
              <MaterialIcons
                name={iconeDias(vacina.dias)}
                size={22}
                color={corDias(vacina.dias)}
              />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNome}>{vacina.nomeVacina}</Text>
              <Text style={styles.cardDetalhe}>
                🐾 {vacina.nomePet}  ·  Próx. dose: {vacina.proxDose}
              </Text>
            </View>
            <View style={[styles.badgeDias, { backgroundColor: corDias(vacina.dias) + "18" }]}>
              <Text style={[styles.badgeDiasTexto, { color: corDias(vacina.dias) }]}>
                {textoDias(vacina.dias)}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* ── Resumo dos pets ── */}
      {pets.length > 0 && (
        <>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Meus Pets</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              <Text style={styles.secaoLink}>Gerenciar</Text>
            </TouchableOpacity>
          </View>

          {pets.map((pet) => (
            <View key={pet.id} style={styles.card}>
              <View style={[styles.cardIcone, { backgroundColor: "#eaf3fb" }]}>
                <FontAwesome5 name="paw" size={20} color="#4A90E2" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{pet.nome}</Text>
                <Text style={styles.cardDetalhe}>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
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
    color: "#333",
  },
  saudacaoSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  avatarPequeno: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4A90E2",
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
    color: "#555",
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
    color: "#333",
  },
  secaoLink: {
    fontSize: 13,
    color: "#4A90E2",
    fontWeight: "500",
  },
  cardIoT: {
    backgroundColor: "#f2f2f2",
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
    color: "#333",
  },
  badgeStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeOnline: {
    backgroundColor: "#eafaf1",
  },
  badgeOffline: {
    backgroundColor: "#fef9e7",
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
  cardIoTSensor: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  cardIoTValor: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  cardIoTLabel: {
    fontSize: 11,
    color: "#888",
  },
  cardIoTDivisor: {
    width: 1,
    height: 40,
    backgroundColor: "#ddd",
  },
  cardIoTVazio: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
    marginBottom: 14,
  },
  cardIoTVazioTexto: {
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
  },
  cardIoTRodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
  cardIoTRodapeTexto: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
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
    color: "#333",
    marginBottom: 3,
  },
  cardDetalhe: {
    fontSize: 13,
    color: "#555",
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
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    marginBottom: 28,
    gap: 6,
  },
  cardVazioTexto: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "bold",
  },
  cardVazioSub: {
    color: "#ccc",
    fontSize: 13,
  },
});