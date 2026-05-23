import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {Text,View,StyleSheet,TextInput,TouchableOpacity,FlatList,Alert,Modal,ScrollView,} from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function Consultas() {
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
      nomePet,
      nomeConsulta,
      data,
      hora,
      local,
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
      <View style={styles.card}>
        <View style={styles.cardData}>
          <Text style={styles.cardDia}>{dia}</Text>
          <Text style={styles.cardMes}>/{mes}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardNomeConsulta}>{item.nomeConsulta}</Text>

          <View style={styles.cardPetContainer}>
            <FontAwesome5 name="paw" size={11} color="#4A90E2" />
            <Text style={styles.cardPet}>{item.nomePet}</Text>
          </View>

          <View style={styles.cardLinha}>
            <MaterialIcons name="access-time" size={13} color="#888" />
            <Text style={styles.cardDetalhe}> {item.hora}</Text>
          </View>

          <View style={styles.cardLinha}>
            <MaterialIcons name="location-on" size={13} color="#888" />
            <Text style={styles.cardDetalhe}> {item.local}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => excluirConsulta(item.id)} style={styles.cardExcluir}>
          <MaterialIcons name="delete-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Consultas</Text>

      {consultas.length === 0 ? (
        <View style={styles.vazio}>
          <MaterialIcons name="local-hospital" size={60} color="#ccc" />
          <Text style={styles.vazioTexto}>Nenhuma consulta agendada</Text>
        </View>
      ) : (
        <FlatList
          data={consultas}
          keyExtractor={(item) => item.id}
          renderItem={renderConsulta}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      
      <TouchableOpacity style={styles.botaoAdicionar} onPress={() => SetModalVisivel(true)}>
        <MaterialIcons name="add" size={22} color="#fff" />
        <Text style={styles.botaoAdicionarTexto}>Nova Consulta</Text>
      </TouchableOpacity>

      
      <Modal visible={modalVisivel} animationType="fade" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>

            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Nova Consulta</Text>
              <TouchableOpacity onPress={() => SetModalVisivel(false)}>
                <MaterialIcons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nome do Pet</Text>
              <TextInput
                value={nomePet}
                onChangeText={SetNomePet}
                style={styles.input}
                placeholder="Ex: Rex, Mia, Bolinha..."
              />

              <Text style={styles.label}>Tipo de Consulta</Text>
              <TextInput
                value={nomeConsulta}
                onChangeText={SetNomeConsulta}
                style={styles.input}
                placeholder="Ex: Retorno, Check-up, Cirurgia..."
              />

              <Text style={styles.label}>Data</Text>
              <MaskedTextInput
                mask="99/99/9999"
                value={data}
                onChangeText={(text) => SetData(text)}
                style={styles.input}
                keyboardType="numeric"
                placeholder="DD/MM/AAAA"
              />

              <Text style={styles.label}>Hora</Text>
              <MaskedTextInput
                mask="99:99"
                value={hora}
                onChangeText={(text) => SetHora(text)}
                style={styles.input}
                keyboardType="numeric"
                placeholder="HH:MM"
              />

              <Text style={styles.label}>Local</Text>
              <View style={styles.localContainer}>
                <MaterialIcons name="location-on" size={22} color="#888" style={styles.localIcone} />
                <TextInput
                  value={local}
                  onChangeText={SetLocal}
                  style={styles.localInput}
                  placeholder="Ex: Clínica VetCare, Pet Shop..."
                />
              </View>

              <View style={styles.modalBotoes}>
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => SetModalVisivel(false)}>
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botaoSalvar} onPress={salvarConsulta}>
                  <Text style={styles.botaoSalvarTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  vazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  vazioTexto: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#4A90E2",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardData: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2FF",
    borderRadius: 10,
    width: 52,
    height: 52,
    marginRight: 14,
  },
  cardDia: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A90E2",
    lineHeight: 22,
  },
  cardMes: {
    fontSize: 13,
    color: "#4A90E2",
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardNomeConsulta: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  cardPetContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardPet: {
    fontSize: 13,
    color: "#4A90E2",
    fontWeight: "600",
  },
  cardLinha: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetalhe: {
    fontSize: 12,
    color: "#888",
  },
  cardExcluir: {
    padding: 4,
  },

  
  botaoAdicionar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",   
    alignItems: "center",       
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: "#fff",
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
    color: "#333",
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
  },
  localContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    width: "100%",
  },
  localIcone: {
    paddingHorizontal: 10,
  },
  localInput: {
    flex: 1,
    padding: 10,
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
    borderColor: "#e74c3c",
  },
  botaoCancelarTexto: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 15,
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: "#4A90E2",
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