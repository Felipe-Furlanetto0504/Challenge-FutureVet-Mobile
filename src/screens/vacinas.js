import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useAnimais } from "../hooks/useAnimais";
import { useVacinas, useCriarVacina, useAtualizarVacina, useExcluirVacina } from "../hooks/useVacinas";

function paraIso(dataBr) {
  if (!dataBr || dataBr.length !== 10) return null;
  const [d, m, a] = dataBr.split("/");
  return `${a}-${m}-${d}`;
}

function paraBr(dataIso) {
  if (!dataIso) return "";
  const [a, m, d] = dataIso.split("-");
  return `${d}/${m}/${a}`;
}

function emojiEspecie(especie) {
  return { CAO: "🐕", GATO: "🐈", COELHO: "🐇", OUTRO: "🐾" }[especie] || "🐾";
}

export default function Vacinas() {
  const { t } = useTheme();
  const { data: itens = [], isLoading, refetch, isRefetching } = useVacinas();
  const { data: pets = [] } = useAnimais();
  const criar = useCriarVacina();
  const atualizar = useAtualizarVacina();
  const excluir = useExcluirVacina();

  const [modalVisivel, SetModalVisivel] = useState(false);
  const [editandoId, SetEditandoId] = useState(null);
  const [animalId, SetAnimalId] = useState(null);
  const [nomeVacina, SetNomeVacina] = useState("");
  const [data, SetData] = useState("");
  const [proxDose, SetProxDose] = useState("");
  const [local, SetLocal] = useState("");

  function abrirNova() {
    SetEditandoId(null);
    SetAnimalId(pets[0]?.id ?? null);
    SetNomeVacina(""); SetData(""); SetProxDose(""); SetLocal("");
    SetModalVisivel(true);
  }

  function abrirEdicao(item) {
    SetEditandoId(item.vacina.id);
    SetAnimalId(item.vacina.animalId);
    SetNomeVacina(item.vacina.nome);
    SetData(paraBr(item.vacina.data));
    SetProxDose(paraBr(item.vacina.proximaDose));
    SetLocal(item.vacina.local || "");
    SetModalVisivel(true);
  }

  function salvar() {
    if (!animalId) { Alert.alert("Erro", "Cadastre um pet no Perfil antes de adicionar vacinas."); return; }
    if (!nomeVacina || !data) { Alert.alert("Erro", "Preencha ao menos a vacina e a data de aplicação."); return; }

    const dataIso = paraIso(data);
    if (!dataIso) { Alert.alert("Erro", "Data de aplicação inválida."); return; }
    const proximaIso = proxDose ? paraIso(proxDose) : null;
    if (proxDose && !proximaIso) { Alert.alert("Erro", "Próxima dose inválida."); return; }

    const form = { animalId, nome: nomeVacina.trim(), data: dataIso, proximaDose: proximaIso, local: local.trim() || null };

    const onError = (erro) => Alert.alert("Erro", erro.message || "Não foi possível salvar a vacina.");
    const onSuccess = () => SetModalVisivel(false);

    if (editandoId) {
      atualizar.mutate({ id: editandoId, form }, { onSuccess, onError });
    } else {
      criar.mutate(form, { onSuccess, onError });
    }
  }

  function excluirVacina(id) {
    Alert.alert("Excluir", "Deseja excluir esta vacina?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: () => excluir.mutate(id, { onError: (erro) => Alert.alert("Erro", erro.message || "Não foi possível excluir.") }),
      },
    ]);
  }

  function corSituacao(situacao) {
    if (situacao === "ATRASADA") return t.danger;
    if (situacao === "PROXIMA") return t.warning;
    if (situacao === "EM_DIA") return t.success;
    return t.muted;
  }

  function renderVacina({ item }) {
    const pet = pets.find((p) => p.id === item.vacina.animalId);
    return (
      <TouchableOpacity style={styles(t).card} onPress={() => abrirEdicao(item)} activeOpacity={0.8}>
        <View style={styles(t).cardIcone}>
          <FontAwesome5 name="paw" size={24} color={t.primary} />
        </View>
        <View style={styles(t).cardInfo}>
          <Text style={styles(t).cardPet}>{emojiEspecie(pet?.especie)} {pet?.nome || "Pet"}</Text>
          <Text style={styles(t).cardNome}>{item.vacina.nome}</Text>
          <Text style={styles(t).cardDetalhe}>📅 Aplicação: {paraBr(item.vacina.data)}</Text>
          {item.vacina.proximaDose && (
            <Text style={[styles(t).cardDetalhe, { color: corSituacao(item.situacao), fontWeight: "bold" }]}>
              💉 Próxima dose: {paraBr(item.vacina.proximaDose)} ({item.descricao})
            </Text>
          )}
          {item.vacina.local ? <Text style={styles(t).cardDetalhe}>📍 Local: {item.vacina.local}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => excluirVacina(item.vacina.id)} style={styles(t).cardExcluir}>
          <MaterialIcons name="delete-outline" size={24} color={t.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles(t).container}>
      <Text style={styles(t).titulo}>Vacinas</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={t.primary} style={{ marginTop: 40 }} />
      ) : itens.length === 0 ? (
        <View style={styles(t).vazio}>
          <FontAwesome5 name="paw" size={60} color={t.muted} />
          <Text style={styles(t).vazioTexto}>Nenhuma vacina cadastrada</Text>
          <Text style={styles(t).vazioSubTexto}>Toque no + para adicionar</Text>
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => String(item.vacina.id)}
          renderItem={renderVacina}
          contentContainerStyle={{ paddingBottom: 100 }}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      <TouchableOpacity style={styles(t).botaoAdicionar} onPress={abrirNova}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles(t).modalFundo}>
          <View style={styles(t).modalContainer}>
            <Text style={styles(t).modalTitulo}>{editandoId ? "Editar Vacina" : "Nova Vacina"}</Text>

            <Text style={styles(t).label}>Pet</Text>
            {pets.length === 0 ? (
              <Text style={{ color: t.danger, marginBottom: 8 }}>
                Nenhum pet cadastrado — vá em Perfil e adicione um pet primeiro.
              </Text>
            ) : (
              <View style={styles(t).petGrid}>
                {pets.map((p) => (
                  <TouchableOpacity key={p.id}
                    style={[styles(t).petChip, animalId === p.id && styles(t).petChipAtivo]}
                    onPress={() => SetAnimalId(p.id)}>
                    <Text style={[styles(t).petChipTexto, animalId === p.id && styles(t).petChipTextoAtivo]}>
                      {emojiEspecie(p.especie)} {p.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

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

            <Text style={styles(t).label}>Próxima Dose (opcional)</Text>
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

            <TouchableOpacity
              style={styles(t).botaoSalvar}
              onPress={salvar}
              disabled={criar.isPending || atualizar.isPending}
            >
              {(criar.isPending || atualizar.isPending)
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles(t).botaoTexto}>Salvar</Text>}
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
  container: { flex: 1, backgroundColor: t.bg, paddingHorizontal: 20, paddingTop: 20 },
  titulo: { fontSize: 28, fontWeight: "bold", marginBottom: 20, color: t.text },
  vazio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  vazioTexto: { color: t.muted2, fontSize: 16, marginTop: 10, fontWeight: "bold" },
  vazioSubTexto: { color: t.muted, fontSize: 14 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: t.surfaceCard, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardIcone: { marginRight: 12 },
  cardInfo: { flex: 1 },
  cardPet: { fontSize: 13, color: t.primary, fontWeight: "bold", marginBottom: 2 },
  cardNome: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: t.text },
  cardDetalhe: { fontSize: 13, color: t.text2, marginTop: 2 },
  cardExcluir: { padding: 4 },
  botaoAdicionar: {
    position: "absolute", bottom: 24, right: 24, backgroundColor: t.primary,
    width: 58, height: 58, borderRadius: 29, justifyContent: "center", alignItems: "center",
    elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4,
  },
  modalFundo: { flex: 1, backgroundColor: t.modalFundo, justifyContent: "flex-end" },
  modalContainer: { backgroundColor: t.modalBg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: t.text },
  label: { alignSelf: "flex-start", marginTop: 10, marginBottom: 4, color: t.text },
  input: { width: "100%", backgroundColor: t.inputBg, padding: 10, borderRadius: 8, color: t.text },
  petGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  petChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, backgroundColor: t.inputBg, borderColor: t.inputBg },
  petChipAtivo: { backgroundColor: t.primaryBg, borderColor: t.primary },
  petChipTexto: { fontSize: 13, fontWeight: "500", color: t.muted },
  petChipTextoAtivo: { color: t.primary, fontWeight: "bold" },
  localContainer: { flexDirection: "row", alignItems: "center", backgroundColor: t.inputBg, borderRadius: 8, width: "100%" },
  localIcone: { paddingHorizontal: 10 },
  localInput: { flex: 1, padding: 10, color: t.text },
  botaoSalvar: { marginTop: 20, backgroundColor: t.primary, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoCancelar: { marginTop: 10, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoCancelarTexto: { color: t.danger, fontWeight: "bold", fontSize: 16 },
});