import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {Text,View,TextInput,TouchableOpacity,FlatList,Alert,Modal,ScrollView,
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";

export default function Consultas() {
  const { t } = useTheme();
  const [consultas, SetConsultas] = useState([]);
  const [modalVisivel, SetModalVisivel] = useState(false);
  const [nomePet, SetNomePet] = useState("");
  const [nomeConsulta, SetNomeConsulta] = useState("");
  const [data, SetData] = useState("");
  const [hora, SetHora] = useState("");
  const [local, SetLocal] = useState("");

  useEffect(() => {
    carregarConsultas();
  }, []);

  async function carregarConsultas() {
    const dados = await AsyncStorage.getItem("CONSULTAS");
    if (dados) SetConsultas(JSON.parse(dados));
  }

  async function salvarConsulta() {
    if (!nomePet || !nomeConsulta || !data || !hora || !local) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    const novaConsulta = {
      id: Date.now().toString(),
      nomePet,nomeConsulta,data,hora,local,
    };

    const novaLista = [...consultas, novaConsulta];
    SetConsultas(novaLista);
    await AsyncStorage.setItem("CONSULTAS", JSON.stringify(novaLista));

    SetNomePet("");
    SetNomeConsulta("");
    SetData("");
    SetHora("");
    SetLocal("");
    SetModalVisivel(false);
  }

  async function excluirConsulta(id) {
    Alert.alert("Excluir", "Deseja excluir esta consulta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const novaLista = consultas.filter((c) => c.id !== id);
          SetConsultas(novaLista);
          await AsyncStorage.setItem("CONSULTAS", JSON.stringify(novaLista));
        },
      },
    ]);
  }

  function renderConsulta({ item }) {
    const partes = item.data.split("/");
    const dia = partes[0] || "--";
    const mes = partes[1] || "--";

    return (
      <View style={styles(t).card}>
        <View style={styles(t).cardData}>
          <Text style={styles(t).cardDia}>{dia}</Text>
          <Text style={styles(t).cardMes}>/{mes}</Text>
        </View>

        <View style={styles(t).cardInfo}>
          <Text style={styles(t).cardNomeConsulta}>{item.nomeConsulta}</Text>

          <View style={styles(t).cardPetContainer}>
            <FontAwesome5 name="paw" size={11} color={t.primary} />
            <Text style={styles(t).cardPet}>{item.nomePet}</Text>
          </View>

          <View style={styles(t).cardLinha}>
            <MaterialIcons name="access-time" size={13} color={t.muted} />
            <Text style={styles(t).cardDetalhe}> {item.hora}</Text>
          </View>

          <View style={styles(t).cardLinha}>
            <MaterialIcons name="location-on" size={13} color={t.muted} />
            <Text style={styles(t).cardDetalhe}> {item.local}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => excluirConsulta(item.id)} style={styles(t).cardExcluir}>
          <MaterialIcons name="delete-outline" size={24} color={t.danger} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles(t).container}>
      <Text style={styles(t).titulo}>Consultas</Text>

      {consultas.length === 0 ? (
        <View style={styles(t).vazio}>
          <MaterialIcons name="local-hospital" size={60} color={t.muted} />
          <Text style={styles(t).vazioTexto}>Nenhuma consulta agendada</Text>
          <Text style={styles(t).vazioSubTexto}>Toque no + para adicionar</Text>
        </View>
      ) : (
        <FlatList
          data={consultas}
          keyExtractor={(item) => item.id}
          renderItem={renderConsulta}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles(t).botaoAdicionar} onPress={() => SetModalVisivel(true)}>
        <MaterialIcons name="add" size={22} color="#fff" />
        <Text style={styles(t).botaoAdicionarTexto}>Nova Consulta</Text>
      </TouchableOpacity>

      <Modal visible={modalVisivel} animationType="fade" transparent>
        <View style={styles(t).modalFundo}>
          <View style={styles(t).modalContainer}>
            <View style={styles(t).modalHeader}>
              <Text style={styles(t).modalTitulo}>Nova Consulta</Text>
              <TouchableOpacity onPress={() => SetModalVisivel(false)}>
                <MaterialIcons name="close" size={24} color={t.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles(t).label}>Nome do Pet</Text>
              <TextInput
                value={nomePet}
                onChangeText={SetNomePet}
                style={styles(t).input}
                placeholder="Ex: Rex, Mia, Bolinha..."
                placeholderTextColor={t.muted}
              />

              <Text style={styles(t).label}>Tipo de Consulta</Text>
              <TextInput
                value={nomeConsulta}
                onChangeText={SetNomeConsulta}
                style={styles(t).input}
                placeholder="Ex: Retorno, Check-up, Cirurgia..."
                placeholderTextColor={t.muted}
              />

              <Text style={styles(t).label}>Data</Text>
              <MaskedTextInput
                mask="99/99/9999"
                value={data}
                onChangeText={(text) => SetData(text)}
                style={styles(t).input}
                keyboardType="numeric"
                placeholder="DD/MM/AAAA"
                placeholderTextColor={t.muted}
              />

              <Text style={styles(t).label}>Hora</Text>
              <MaskedTextInput
                mask="99:99"
                value={hora}
                onChangeText={(text) => SetHora(text)}
                style={styles(t).input}
                keyboardType="numeric"
                placeholder="HH:MM"
                placeholderTextColor={t.muted}
              />

              <Text style={styles(t).label}>Local</Text>
              <View style={styles(t).localContainer}>
                <MaterialIcons name="location-on" size={22} color={t.muted} style={styles(t).localIcone} />
                <TextInput
                  value={local}
                  onChangeText={SetLocal}
                  style={styles(t).localInput}
                  placeholder="Ex: Clínica VetCare, Pet Shop..."
                  placeholderTextColor={t.muted}
                />
              </View>

              <View style={styles(t).modalBotoes}>
                <TouchableOpacity style={styles(t).botaoCancelar} onPress={() => SetModalVisivel(false)}>
                  <Text style={styles(t).botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles(t).botaoSalvar} onPress={salvarConsulta}>
                  <Text style={styles(t).botaoSalvarTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = (t) => ({
  container: {
    flex: 1,
    backgroundColor: t.bg,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: t.text,
  },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  vazioTexto: {
    color: t.muted2,
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  vazioSubTexto: {
    color: t.muted,
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.surfaceCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: t.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardData: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.primaryBg,
    borderRadius: 10,
    width: 52,
    height: 52,
    marginRight: 14,
  },
  cardDia: {
    fontSize: 20,
    fontWeight: "bold",
    color: t.primary,
    lineHeight: 22,
  },
  cardMes: {
    fontSize: 13,
    color: t.primary,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardNomeConsulta: {
    fontSize: 15,
    fontWeight: "bold",
    color: t.text,
  },
  cardPetContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardPet: {
    fontSize: 13,
    color: t.primary,
    fontWeight: "600",
  },
  cardLinha: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetalhe: {
    fontSize: 12,
    color: t.muted,
  },
  cardExcluir: {
    padding: 4,
  },
  botaoAdicionar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  botaoAdicionarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: t.modalFundo,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: t.modalBg,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: t.text,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    color: t.text,
  },
  input: {
    width: "100%",
    backgroundColor: t.inputBg,
    padding: 10,
    borderRadius: 8,
    color: t.text,
  },
  localContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.inputBg,
    borderRadius: 8,
    width: "100%",
  },
  localIcone: {
    paddingHorizontal: 10,
  },
  localInput: {
    flex: 1,
    padding: 10,
    color: t.text,
  },
  modalBotoes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: t.danger,
  },
  botaoCancelarTexto: {
    color: t.danger,
    fontWeight: "bold",
    fontSize: 15,
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: t.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoSalvarTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});