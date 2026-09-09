import { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, FlatList, Alert, Modal, ScrollView, ActivityIndicator } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useSessao } from "../hooks/useAuth";
import { useAnimais } from "../hooks/useAnimais";
import {
  useConsultas, useAgendarConsulta, useReagendarConsulta,
  useConfirmarConsulta, useCancelarConsulta, useConcluirConsulta,
} from "../hooks/useConsultas";

function paraIso(dataBr) {
  if (!dataBr || dataBr.length !== 10) return null;
  const [d, m, a] = dataBr.split("/");
  return `${a}-${m}-${d}`;
}

function paraBr(dataIso) {
  if (!dataIso) return "";
  const [a, m, d] = dataIso.split("-");
  return { dia: d, mes: m, completa: `${d}/${m}/${a}` };
}

function emojiEspecie(especie) {
  return { CAO: "🐕", GATO: "🐈", COELHO: "🐇", OUTRO: "🐾" }[especie] || "🐾";
}

export default function Consultas() {
  const { t } = useTheme();
  const { data: sessao } = useSessao();
  const isAdmin = sessao?.usuario?.role === "ADMIN";

  const { data: consultas = [], isLoading, refetch, isRefetching } = useConsultas();
  const { data: pets = [] } = useAnimais();

  const agendar = useAgendarConsulta();
  const reagendar = useReagendarConsulta();
  const confirmar = useConfirmarConsulta();
  const cancelar = useCancelarConsulta();
  const concluir = useConcluirConsulta();

  const [modalVisivel, SetModalVisivel] = useState(false);
  const [editandoId, SetEditandoId] = useState(null);
  const [animalId, SetAnimalId] = useState(null);
  const [tipo, SetTipo] = useState("");
  const [data, SetData] = useState("");
  const [hora, SetHora] = useState("");
  const [local, SetLocal] = useState("");
  const [observacao, SetObservacao] = useState("");

  const [modalMotivo, SetModalMotivo] = useState(null);
  const [textoMotivo, SetTextoMotivo] = useState("");

  function abrirNova() {
    SetEditandoId(null);
    SetAnimalId(pets[0]?.id ?? null);
    SetTipo(""); SetData(""); SetHora(""); SetLocal(""); SetObservacao("");
    SetModalVisivel(true);
  }

  function abrirEdicao(item) {
    const d = item.data.split("-");
    SetEditandoId(item.id);
    SetAnimalId(item.animalId);
    SetTipo(item.tipo);
    SetData(`${d[2]}/${d[1]}/${d[0]}`);
    SetHora(item.hora ? item.hora.slice(0, 5) : "");
    SetLocal(item.local || "");
    SetObservacao(item.observacao || "");
    SetModalVisivel(true);
  }

  function salvar() {
    if (!animalId) { Alert.alert("Erro", "Cadastre um pet no Perfil antes de agendar."); return; }
    if (!tipo || !data || !hora || !local) { Alert.alert("Erro", "Preencha tipo, data, hora e local."); return; }

    const dataIso = paraIso(data);
    if (!dataIso) { Alert.alert("Erro", "Data inválida."); return; }
    if (hora.length !== 5) { Alert.alert("Erro", "Hora inválida."); return; }

    const form = { animalId, tipo: tipo.trim(), data: dataIso, hora, local: local.trim(), observacao: observacao.trim() || null };
    const onError = (erro) => Alert.alert("Erro", erro.message || "Não foi possível salvar a consulta.");
    const onSuccess = () => SetModalVisivel(false);

    if (editandoId) {
      reagendar.mutate({ id: editandoId, form }, { onSuccess, onError });
    } else {
      agendar.mutate(form, { onSuccess, onError });
    }
  }

  function confirmarConsulta(id) {
    confirmar.mutate(id, { onError: (erro) => Alert.alert("Erro", erro.message || "Não foi possível confirmar.") });
  }

  function abrirMotivo(acao, id) {
    SetModalMotivo({ acao, id });
    SetTextoMotivo("");
  }

  function enviarMotivo() {
    if (!textoMotivo.trim()) {
      Alert.alert("Erro", modalMotivo.acao === "cancelar" ? "Informe o motivo do cancelamento." : "Informe um resumo do atendimento.");
      return;
    }
    const onError = (erro) => Alert.alert("Erro", erro.message || "Não foi possível concluir a ação.");
    const onSuccess = () => SetModalMotivo(null);

    if (modalMotivo.acao === "cancelar") {
      cancelar.mutate({ id: modalMotivo.id, motivo: textoMotivo.trim() }, { onSuccess, onError });
    } else {
      concluir.mutate({ id: modalMotivo.id, observacao: textoMotivo.trim() }, { onSuccess, onError });
    }
  }

  function renderConsulta({ item }) {
    const pet = pets.find((p) => p.id === item.animalId);
    const d = paraBr(item.data);
    const ativa = item.status === "AGENDADA" || item.status === "CONFIRMADA";

    return (
      <View style={styles(t).card}>
        <View style={styles(t).cardData}>
          <Text style={styles(t).cardDia}>{d.dia}</Text>
          <Text style={styles(t).cardMes}>/{d.mes}</Text>
        </View>

        <View style={styles(t).cardInfo}>
          <Text style={styles(t).cardNomeConsulta}>{item.tipo}</Text>

          <View style={styles(t).cardPetContainer}>
            <FontAwesome5 name="paw" size={11} color={t.primary} />
            <Text style={styles(t).cardPet}>{emojiEspecie(pet?.especie)} {pet?.nome || "Pet"}</Text>
          </View>

          <View style={styles(t).cardLinha}>
            <MaterialIcons name="access-time" size={13} color={t.muted} />
            <Text style={styles(t).cardDetalhe}> {item.hora ? item.hora.slice(0, 5) : "—"}</Text>
          </View>

          <View style={styles(t).cardLinha}>
            <MaterialIcons name="location-on" size={13} color={t.muted} />
            <Text style={styles(t).cardDetalhe}> {item.local}</Text>
          </View>

          {item.observacao ? <Text style={styles(t).cardObs}>📝 {item.observacao}</Text> : null}

          <View style={styles(t).acoes}>
            {ativa && (
              <TouchableOpacity style={styles(t).acaoBotao} onPress={() => abrirEdicao(item)}>
                <MaterialIcons name="edit" size={16} color={t.primary} />
                <Text style={[styles(t).acaoTexto, { color: t.primary }]}>Reagendar</Text>
              </TouchableOpacity>
            )}
            {ativa && (
              <TouchableOpacity style={styles(t).acaoBotao} onPress={() => abrirMotivo("cancelar", item.id)}>
                <MaterialIcons name="event-busy" size={16} color={t.danger} />
                <Text style={[styles(t).acaoTexto, { color: t.danger }]}>Cancelar</Text>
              </TouchableOpacity>
            )}
            {isAdmin && item.status === "AGENDADA" && (
              <TouchableOpacity style={styles(t).acaoBotao} onPress={() => confirmarConsulta(item.id)}>
                <MaterialIcons name="check-circle-outline" size={16} color={t.success} />
                <Text style={[styles(t).acaoTexto, { color: t.success }]}>Confirmar</Text>
              </TouchableOpacity>
            )}
            {isAdmin && item.status === "CONFIRMADA" && (
              <TouchableOpacity style={styles(t).acaoBotao} onPress={() => abrirMotivo("concluir", item.id)}>
                <MaterialIcons name="task-alt" size={16} color={t.primary} />
                <Text style={[styles(t).acaoTexto, { color: t.primary }]}>Concluir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles(t).container}>
      <Text style={styles(t).titulo}>Consultas</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={t.primary} style={{ marginTop: 40 }} />
      ) : consultas.length === 0 ? (
        <View style={styles(t).vazio}>
          <MaterialIcons name="local-hospital" size={60} color={t.muted} />
          <Text style={styles(t).vazioTexto}>Nenhuma consulta agendada</Text>
          <Text style={styles(t).vazioSubTexto}>Toque no botão abaixo para agendar</Text>
        </View>
      ) : (
        <FlatList
          data={consultas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderConsulta}
          contentContainerStyle={{ paddingBottom: 100 }}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}

      <TouchableOpacity style={styles(t).botaoAdicionar} onPress={abrirNova}>
        <MaterialIcons name="add" size={22} color="#fff" />
        <Text style={styles(t).botaoAdicionarTexto}>Nova Consulta</Text>
      </TouchableOpacity>

      <Modal visible={modalVisivel} animationType="fade" transparent>
        <View style={styles(t).modalFundo}>
          <View style={styles(t).modalContainer}>
            <View style={styles(t).modalHeader}>
              <Text style={styles(t).modalTitulo}>{editandoId ? "Reagendar Consulta" : "Nova Consulta"}</Text>
              <TouchableOpacity onPress={() => SetModalVisivel(false)}>
                <MaterialIcons name="close" size={24} color={t.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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

              <Text style={styles(t).label}>Tipo de Consulta</Text>
              <TextInput
                value={tipo}
                onChangeText={SetTipo}
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

              <Text style={styles(t).label}>Observação (opcional)</Text>
              <TextInput
                value={observacao}
                onChangeText={SetObservacao}
                style={styles(t).input}
                placeholder="Algo que a clínica deva saber..."
                placeholderTextColor={t.muted}
                multiline
              />

              <View style={styles(t).modalBotoes}>
                <TouchableOpacity style={styles(t).botaoCancelar} onPress={() => SetModalVisivel(false)}>
                  <Text style={styles(t).botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles(t).botaoSalvar}
                  onPress={salvar}
                  disabled={agendar.isPending || reagendar.isPending}
                >
                  {(agendar.isPending || reagendar.isPending)
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles(t).botaoSalvarTexto}>Salvar</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={!!modalMotivo} animationType="fade" transparent>
        <View style={styles(t).modalFundo}>
          <View style={styles(t).modalContainer}>
            <View style={styles(t).modalHeader}>
              <Text style={styles(t).modalTitulo}>
                {modalMotivo?.acao === "cancelar" ? "Motivo do cancelamento" : "Resumo do atendimento"}
              </Text>
              <TouchableOpacity onPress={() => SetModalMotivo(null)}>
                <MaterialIcons name="close" size={24} color={t.muted} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={textoMotivo}
              onChangeText={SetTextoMotivo}
              style={[styles(t).input, { minHeight: 80, textAlignVertical: "top" }]}
              placeholder={modalMotivo?.acao === "cancelar" ? "Por que a consulta está sendo cancelada?" : "O que foi feito no atendimento?"}
              placeholderTextColor={t.muted}
              multiline
            />
            <View style={styles(t).modalBotoes}>
              <TouchableOpacity style={styles(t).botaoCancelar} onPress={() => SetModalMotivo(null)}>
                <Text style={styles(t).botaoCancelarTexto}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(t).botaoSalvar}
                onPress={enviarMotivo}
                disabled={cancelar.isPending || concluir.isPending}
              >
                {(cancelar.isPending || concluir.isPending)
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles(t).botaoSalvarTexto}>Confirmar</Text>}
              </TouchableOpacity>
            </View>
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
  card: {
    flexDirection: "row", backgroundColor: t.surfaceCard, borderRadius: 14, padding: 14, marginBottom: 12,
    borderLeftWidth: 5, borderLeftColor: t.primary, elevation: 2, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardData: {
    alignItems: "center", justifyContent: "center", backgroundColor: t.primaryBg,
    borderRadius: 10, width: 52, height: 52, marginRight: 14,
  },
  cardDia: { fontSize: 20, fontWeight: "bold", color: t.primary, lineHeight: 22 },
  cardMes: { fontSize: 13, color: t.primary },
  cardInfo: { flex: 1, gap: 3 },
  cardNomeConsulta: { fontSize: 15, fontWeight: "bold", color: t.text },
  cardPetContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardPet: { fontSize: 13, color: t.primary, fontWeight: "600" },
  cardLinha: { flexDirection: "row", alignItems: "center" },
  cardDetalhe: { fontSize: 12, color: t.muted },
  cardObs: { fontSize: 12, color: t.text2, marginTop: 4, fontStyle: "italic" },
  acoes: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 8 },
  acaoBotao: { flexDirection: "row", alignItems: "center", gap: 4 },
  acaoTexto: { fontSize: 12, fontWeight: "bold" },
  botaoAdicionar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: t.primary,
    paddingVertical: 14, borderRadius: 12, gap: 8, marginBottom: 16,
  },
  botaoAdicionarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalFundo: { flex: 1, backgroundColor: t.modalFundo, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  modalContainer: { backgroundColor: t.modalBg, borderRadius: 20, padding: 24, width: "100%", maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitulo: { fontSize: 20, fontWeight: "bold", color: t.text },
  label: { marginTop: 10, marginBottom: 4, color: t.text },
  input: { width: "100%", backgroundColor: t.inputBg, padding: 10, borderRadius: 8, color: t.text },
  petGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  petChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, backgroundColor: t.inputBg, borderColor: t.inputBg },
  petChipAtivo: { backgroundColor: t.primaryBg, borderColor: t.primary },
  petChipTexto: { fontSize: 13, fontWeight: "500", color: t.muted },
  petChipTextoAtivo: { color: t.primary, fontWeight: "bold" },
  localContainer: { flexDirection: "row", alignItems: "center", backgroundColor: t.inputBg, borderRadius: 8, width: "100%" },
  localIcone: { paddingHorizontal: 10 },
  localInput: { flex: 1, padding: 10, color: t.text },
  modalBotoes: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 10 },
  botaoCancelar: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: t.danger },
  botaoCancelarTexto: { color: t.danger, fontWeight: "bold", fontSize: 15 },
  botaoSalvar: { flex: 1, backgroundColor: t.primary, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoSalvarTexto: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});