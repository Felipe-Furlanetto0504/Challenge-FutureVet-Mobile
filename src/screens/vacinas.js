import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";

export default function Vacinas() {
  const { t } = useTheme();
  const [vacinas, SetVacinas] = useState([]);
  const [modalVisivel, SetModalVisivel] = useState(false);
  const [nomePet, SetNomePet] = useState("");
  const [nomeVacina, SetNomeVacina] = useState("");
  const [data, SetData] = useState("");
  const [proxDose, SetProxDose] = useState("");
  const [local, SetLocal] = useState("");

  useEffect(() => {
    carregarVacinas();
  }, []);

  async function carregarVacinas() {
    const dados = await AsyncStorage.getItem("VACINAS");
    if (dados) SetVacinas(JSON.parse(dados));
  }

  async function salvarVacina() {
    if (!nomePet || !nomeVacina || !data || !proxDose || !local) {
      Alert.alert("Erro", "Preencha o nome do pet, a vacina, a data, próxima dose e local");
      return;
    }

    const novaVacina = {
      id: Date.now().toString(),
      nomePet,
      nomeVacina,
      data,
      proxDose,
      local,
    };

    const novaLista = [...vacinas, novaVacina];
    SetVacinas(novaLista);
    await AsyncStorage.setItem("VACINAS", JSON.stringify(novaLista));

    SetNomePet("");
    SetNomeVacina("");
    SetData("");
    SetProxDose("");
    SetLocal("");
    SetModalVisivel(false);
  }

  async function excluirVacina(id) {
    Alert.alert("Excluir", "Deseja excluir esta vacina?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const novaLista = vacinas.filter((v) => v.id !== id);
          SetVacinas(novaLista);
          await AsyncStorage.setItem("VACINAS", JSON.stringify(novaLista));
        },
      },
    ]);
  }

  function renderVacina({ item }) {
    return (
      <View style={styles(t).card}>
        <View style={styles(t).cardIcone}>
          <FontAwesome5 name="paw" size={24} color={t.primary} />
        </View>
        <View style={styles(t).cardInfo}>
          <Text style={styles(t).cardPet}>🐾 {item.nomePet}</Text>
          <Text style={styles(t).cardNome}>{item.nomeVacina}</Text>
          <Text style={styles(t).cardDetalhe}>📅 Aplicação: {item.data}</Text>
          <Text style={styles(t).cardDetalhe}>💉 Próxima dose: {item.proxDose}</Text>
          <Text style={styles(t).cardDetalhe}>📍 Local: {item.local}</Text>
        </View>
        <TouchableOpacity onPress={() => excluirVacina(item.id)} style={styles(t).cardExcluir}>
          <MaterialIcons name="delete-outline" size={24} color={t.danger} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles(t).container}>
      <Text style={styles(t).titulo}>Vacinas</Text>

      {vacinas.length === 0 ? (
        <View style={styles(t).vazio}>
          <FontAwesome5 name="paw" size={60} color={t.muted} />
          <Text style={styles(t).vazioTexto}>Nenhuma vacina cadastrada</Text>
          <Text style={styles(t).vazioSubTexto}>Toque no + para adicionar</Text>
        </View>
      ) : (
        <FlatList
          data={vacinas}
          keyExtractor={(item) => item.id}
          renderItem={renderVacina}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles(t).botaoAdicionar} onPress={() => SetModalVisivel(true)}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles(t).modalFundo}>
          <View style={styles(t).modalContainer}>
            <Text style={styles(t).modalTitulo}>Nova Vacina</Text>

            <Text style={styles(t).label}>Nome do Pet</Text>
            <TextInput
              value={nomePet}
              onChangeText={SetNomePet}
              style={styles(t).input}
              placeholder="Ex: Rex, Mia, Bolinha..."
              placeholderTextColor={t.muted}
            />

            <Text style={styles(t).label}>Nome da Vacina</Text>
            <TextInput
              value={nomeVacina}
              onChangeText={SetNomeVacina}
              style={styles(t).input}
              placeholder="Ex: Antirrábica, V8, Giárdia..."
              placeholderTextColor={t.muted}
            />

            <Text style={styles(t).label}>Data de Aplicação</Text>
            <MaskedTextInput
              mask="99/99/9999"
              value={data}
              onChangeText={(text) => SetData(text)}
              style={styles(t).input}
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
              placeholderTextColor={t.muted}
            />

            <Text style={styles(t).label}>Próxima Dose</Text>
            <MaskedTextInput
              mask="99/99/9999"
              value={proxDose}
              onChangeText={(text) => SetProxDose(text)}
              style={styles(t).input}
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
              placeholderTextColor={t.muted}
            />

            <Text style={styles(t).label}>Local de Aplicação</Text>
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

            <TouchableOpacity style={styles(t).botaoSalvar} onPress={salvarVacina}>
              <Text style={styles(t).botaoTexto}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles(t).botaoCancelar} onPress={() => SetModalVisivel(false)}>
              <Text style={styles(t).botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
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
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardIcone: {
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardPet: {
    fontSize: 13,
    color: t.primary,
    fontWeight: "bold",
    marginBottom: 2,
  },
  cardNome: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: t.text,
  },
  cardDetalhe: {
    fontSize: 13,
    color: t.text2,
    marginTop: 2,
  },
  cardExcluir: {
    padding: 4,
  },
  botaoAdicionar: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: t.primary,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: t.modalFundo,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: t.modalBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: t.text,
  },
  label: {
    alignSelf: "flex-start",
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
  botaoSalvar: {
    marginTop: 20,
    backgroundColor: t.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoCancelar: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoCancelarTexto: {
    color: t.danger,
    fontWeight: "bold",
    fontSize: 16,
  },
});