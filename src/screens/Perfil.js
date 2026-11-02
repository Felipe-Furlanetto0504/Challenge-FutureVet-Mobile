import { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, Switch, ActivityIndicator } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useSessao, useLogout } from "../hooks/useAuth";
import { useAnimais, useCriarAnimal, useAtualizarAnimal, useExcluirAnimal } from "../hooks/useAnimais";
import { useVacinas } from "../hooks/useVacinas";
import { emojiEspecie } from "../utils/especie";

const ESPECIES = [
  { valor: "CAO", label: "🐕 Cão" },
  { valor: "GATO", label: "🐈 Gato" },
  { valor: "COELHO", label: "🐇 Coelho" },
  { valor: "OUTRO", label: "🐾 Outro" },
];

const PORTES = [
  { valor: "PEQUENO", label: "Pequeno" },
  { valor: "MEDIO", label: "Médio" },
  { valor: "GRANDE", label: "Grande" },
];

export default function Perfil() {
  const { t, dark, toggleTheme } = useTheme();
  const { data: sessao } = useSessao();
  const usuario = sessao?.usuario;

  const { data: pets = [], isLoading: carregandoPets } = useAnimais();
  const { data: vacinas = [] } = useVacinas();
  const criarAnimal = useCriarAnimal();
  const atualizarAnimal = useAtualizarAnimal();
  const excluirAnimal = useExcluirAnimal();
  const logout = useLogout();

  const [modalPet, SetModalPet] = useState(false);
  const [editandoPetId, SetEditandoPetId] = useState(null);
  const [nomePet, SetNomePet] = useState("");
  const [idadePet, SetIdadePet] = useState("");
  const [portePet, SetPortePet] = useState("PEQUENO");
  const [pesoPet, SetPesoPet] = useState("");
  const [especiePet, SetEspeciePet] = useState("CAO");
  const [racaPet, SetRacaPet] = useState("");

  function sair() {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout.mutate() },
    ]);
  }

  function abrirModalPet() {
    SetEditandoPetId(null);
    SetNomePet(""); SetIdadePet(""); SetPortePet("PEQUENO");
    SetPesoPet(""); SetEspeciePet("CAO"); SetRacaPet("");
    SetModalPet(true);
  }

  function abrirEdicaoPet(pet) {
    SetEditandoPetId(pet.id);
    SetNomePet(pet.nome || "");
    SetIdadePet(pet.idade || "");
    SetPortePet(pet.porte || "PEQUENO");
    SetPesoPet(pet.peso != null ? String(pet.peso) : "");
    SetEspeciePet(pet.especie || "CAO");
    SetRacaPet(pet.raca || "");
    SetModalPet(true);
  }

  function salvarPet() {
    if (!nomePet || !idadePet || !pesoPet) {
      Alert.alert("Erro", "Preencha nome, idade e peso do pet."); return;
    }
    const pesoNumero = parseFloat(pesoPet.replace(",", "."));
    if (isNaN(pesoNumero) || pesoNumero <= 0 || pesoNumero > 999.99) {
      Alert.alert("Erro", "Digite um peso válido (até 999,99 kg)."); return;
    }
    const form = {
      nome: nomePet.trim(),
      especie: especiePet,
      raca: racaPet.trim() || null,
      idade: idadePet.trim(),
      porte: portePet,
      peso: pesoNumero,
    };
    const callbacks = {
      onSuccess: () => SetModalPet(false),
      onError: (erro) => Alert.alert("Erro", erro.message || "Não foi possível salvar o pet."),
    };

    if (editandoPetId) {
      atualizarAnimal.mutate({ id: editandoPetId, form }, callbacks);
    } else {
      criarAnimal.mutate(form, callbacks);
    }
  }

  function excluirPet(id) {
    Alert.alert("Excluir", "Deseja excluir este pet?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: () => excluirAnimal.mutate(id, {
          onError: (erro) => Alert.alert("Erro", erro.message || "Não foi possível excluir o pet."),
        }),
      },
    ]);
  }

  function resumoVacinas(animalId) {
    const doPet = vacinas.filter((v) => v.vacina.animalId === animalId && v.situacao !== "HISTORICO");
    if (doPet.length === 0) return { total: 0, proxima: null, dias: null, situacao: null };
    const comPrazo = doPet.filter((v) => v.dias !== null && v.dias !== undefined);
    if (comPrazo.length === 0) return { total: doPet.length, proxima: null, dias: null, situacao: null };
    const maisUrgente = comPrazo.reduce((a, b) => (a.dias < b.dias ? a : b));
    return { total: doPet.length, proxima: maisUrgente.vacina.nome, dias: maisUrgente.dias, situacao: maisUrgente.situacao };
  }

  function corSituacao(situacao) {
    if (situacao === "ATRASADA") return t.danger;
    if (situacao === "PROXIMA") return t.warning;
    if (situacao === "EM_DIA") return t.success;
    return t.muted;
  }

  function textoDias(dias) {
    if (dias === null || dias === undefined) return "";
    if (dias < 0) return `Venceu há ${Math.abs(dias)}d`;
    if (dias === 0) return "Vence hoje";
    if (dias === 1) return "Vence amanhã";
    return `Em ${dias} dias`;
  }

  if (!usuario) return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={t.primary} />
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={styles.container}>
      <Text style={[styles.titulo, { color: t.text }]}>Seu Perfil</Text>

      <View style={[styles.avatar, { backgroundColor: t.primary }]}>
        <Text style={styles.avatarLetra}>{usuario.nome.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={[styles.nome, { color: t.text }]}>{usuario.nome}</Text>

      <View style={[styles.card, { backgroundColor: t.surfaceCard }]}>
        <Text style={[styles.secaoTitulo, { color: t.text }]}>Dados pessoais</Text>
        <View style={[styles.divisor, { backgroundColor: t.divisor }]} />
        {[
          { label: "Email", valor: usuario.email },
          { label: "Perfil", valor: usuario.role === "ADMIN" ? "Clínica" : "Tutor" },
        ].map((item, i, arr) => (
          <View key={item.label}>
            <View style={styles.linha}>
              <Text style={[styles.label, { color: t.muted }]}>{item.label}</Text>
              <Text style={[styles.valor, { color: t.text }]}>{item.valor}</Text>
            </View>
            {i < arr.length - 1 && <View style={[styles.divisor, { backgroundColor: t.divisor }]} />}
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: t.surfaceCard, marginTop: 16 }]}>
        <Text style={[styles.secaoTitulo, { color: t.text }]}>Aparência</Text>
        <View style={[styles.divisor, { backgroundColor: t.divisor }]} />
        <View style={styles.temaLinha}>
          <View style={styles.temaEsquerda}>
            <View style={[styles.temaIcone, { backgroundColor: dark ? t.bg3 : t.primaryBg }]}>
              <MaterialIcons name={dark ? "dark-mode" : "light-mode"} size={22} color={dark ? "#f39c12" : t.primary} />
            </View>
            <View>
              <Text style={[styles.temaTitulo, { color: t.text }]}>{dark ? "Modo Escuro" : "Modo Claro"}</Text>
              <Text style={[styles.temaSubtitulo, { color: t.muted }]}>
                {dark ? "Interface com fundo escuro" : "Interface com fundo claro"}
              </Text>
            </View>
          </View>
          <Switch value={dark} onValueChange={toggleTheme}
            trackColor={{ false: t.border, true: t.primaryBg }}
            thumbColor={dark ? t.primary : t.muted2} />
        </View>
      </View>

      <View style={[styles.secaoHeader, { width: "100%" }]}>
        <Text style={[styles.secaoTitulo, { color: t.text }]}>Meus Pets</Text>
        <TouchableOpacity style={[styles.botaoAdicionarPet, { backgroundColor: t.primary }]} onPress={abrirModalPet}>
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.botaoAdicionarPetTexto}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {carregandoPets ? (
        <ActivityIndicator size="large" color={t.primary} style={{ marginVertical: 20 }} />
      ) : pets.length === 0 ? (
        <View style={styles.petVazio}>
          <FontAwesome5 name="paw" size={30} color={t.muted2} />
          <Text style={[styles.petVazioTexto, { color: t.muted2 }]}>Nenhum pet cadastrado</Text>
        </View>
      ) : (
        pets.map((pet) => {
          const rv = resumoVacinas(pet.id);
          return (
            <View key={pet.id} style={[styles.petCard, { backgroundColor: t.surfaceCard }]}>
              <View style={styles.petIcone}>
                <Text style={{ fontSize: 28 }}>{emojiEspecie(pet.especie)}</Text>
              </View>
              <View style={styles.petInfo}>
                <Text style={[styles.petNome, { color: t.text }]}>{pet.nome}</Text>
                {pet.raca ? <Text style={[styles.petDetalhe, { color: t.text2 }]}>{pet.raca}</Text> : null}
                <Text style={[styles.petDetalhe, { color: t.text2 }]}>
                  Idade: {pet.idade || "—"}  ·  Peso: {pet.peso ?? "—"}kg  ·  Porte: {pet.porte || "—"}
                </Text>
                <View style={styles.petVacinaRow}>
                  <MaterialIcons name="vaccines" size={13} color={t.primary} />
                  {rv.total === 0 ? (
                    <Text style={[styles.petVacinaTexto, { color: t.muted }]}>Sem vacinas cadastradas</Text>
                  ) : rv.proxima ? (
                    <Text style={[styles.petVacinaTexto, { color: t.muted }]}>
                      {rv.total} vacina{rv.total !== 1 ? "s" : ""}  ·  {rv.proxima}:{" "}
                      <Text style={{ color: corSituacao(rv.situacao), fontWeight: "bold" }}>{textoDias(rv.dias)}</Text>
                    </Text>
                  ) : (
                    <Text style={[styles.petVacinaTexto, { color: t.muted }]}>
                      {rv.total} vacina{rv.total !== 1 ? "s" : ""} cadastrada{rv.total !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ gap: 14 }}>
                <TouchableOpacity onPress={() => abrirEdicaoPet(pet)} accessibilityLabel={`Editar ${pet.nome}`}>
                  <MaterialIcons name="edit" size={22} color={t.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => excluirPet(pet.id)} accessibilityLabel={`Excluir ${pet.nome}`}>
                  <MaterialIcons name="delete-outline" size={24} color={t.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <TouchableOpacity style={[styles.botaoSair, { borderColor: t.danger }]} onPress={sair} disabled={logout.isPending}>
        {logout.isPending ? <ActivityIndicator color={t.danger} /> : (
          <>
            <MaterialIcons name="logout" size={20} color={t.danger} />
            <Text style={[styles.botaoSairTexto, { color: t.danger }]}>Sair da conta</Text>
          </>
        )}
      </TouchableOpacity>

        <Modal visible={modalPet} animationType="slide" transparent>
        <View style={[styles.modalFundo, { backgroundColor: t.modalFundo }]}>
          <View style={[styles.modalCaixa, { backgroundColor: t.modalBg }]}>
            <ScrollView contentContainerStyle={styles.modalConteudo}>
              <Text style={[styles.modalTitulo, { color: t.text }]}>{editandoPetId ? "Editar Pet" : "Novo Pet"}</Text>

              <Text style={[styles.inputLabel, { color: t.text }]}>Nome do Pet</Text>
              <TextInput value={nomePet} onChangeText={SetNomePet}
                style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
                placeholder="Ex: Rex, Mia, Bolinha..." placeholderTextColor={t.placeholder} />

              <Text style={[styles.inputLabel, { color: t.text }]}>Espécie</Text>
              <View style={styles.especieGrid}>
                {ESPECIES.map((e) => (
                  <TouchableOpacity key={e.valor}
                    style={[styles.especieOpcao, { backgroundColor: t.inputBg, borderColor: t.inputBg },
                      especiePet === e.valor && { backgroundColor: t.primaryBg, borderColor: t.primary }]}
                    onPress={() => SetEspeciePet(e.valor)}>
                    <Text style={[styles.especieOpcaoTexto, { color: t.muted },
                      especiePet === e.valor && { color: t.primary, fontWeight: "bold" }]}>
                      {e.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: t.text }]}>Raça (opcional)</Text>
              <TextInput value={racaPet} onChangeText={SetRacaPet}
                style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
                placeholder="Ex: Labrador, Siamês, SRD..." placeholderTextColor={t.placeholder} />

              <Text style={[styles.inputLabel, { color: t.text }]}>Idade</Text>
              <TextInput value={idadePet} onChangeText={SetIdadePet}
                style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
                placeholder="Ex: 2 anos, 6 meses..." placeholderTextColor={t.placeholder} />

              <Text style={[styles.inputLabel, { color: t.text }]}>Porte</Text>
              <View style={styles.especieGrid}>
                {PORTES.map((p) => (
                  <TouchableOpacity key={p.valor}
                    style={[styles.especieOpcao, { backgroundColor: t.inputBg, borderColor: t.inputBg },
                      portePet === p.valor && { backgroundColor: t.primaryBg, borderColor: t.primary }]}
                    onPress={() => SetPortePet(p.valor)}>
                    <Text style={[styles.especieOpcaoTexto, { color: t.muted },
                      portePet === p.valor && { color: t.primary, fontWeight: "bold" }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: t.text }]}>Peso (kg)</Text>
              <TextInput value={pesoPet} onChangeText={SetPesoPet}
                style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
                placeholder="Ex: 5.5" placeholderTextColor={t.placeholder} keyboardType="numeric" />

              <TouchableOpacity style={[styles.botaoSalvar, { backgroundColor: t.primary }]} onPress={salvarPet} disabled={criarAnimal.isPending || atualizarAnimal.isPending}>
                {(criarAnimal.isPending || atualizarAnimal.isPending) ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSalvarTexto}>Salvar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.botaoCancelar} onPress={() => SetModalPet(false)}>
                <Text style={[styles.botaoCancelarTexto, { color: t.danger }]}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: "700", marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarLetra: { fontSize: 42, fontWeight: "bold", color: "#fff" },
  nome: { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  card: { width: "100%", borderRadius: 16, padding: 16 },
  secaoTitulo: { fontSize: 18, fontWeight: "bold", paddingBottom: 10 },
  linha: { paddingVertical: 10 },
  label: { fontSize: 12, marginBottom: 2 },
  valor: { fontSize: 16, fontWeight: "500" },
  divisor: { height: 1 },
  temaLinha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10 },
  temaEsquerda: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  temaIcone: { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  temaTitulo: { fontSize: 15, fontWeight: "bold" },
  temaSubtitulo: { fontSize: 12, marginTop: 2 },
  secaoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 12 },
  botaoAdicionarPet: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  botaoAdicionarPetTexto: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  petVazio: { alignItems: "center", paddingVertical: 20, gap: 8 },
  petVazioTexto: { fontSize: 14 },
  petCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 10, width: "100%" },
  petIcone: { marginRight: 12, width: 36, alignItems: "center" },
  petInfo: { flex: 1 },
  petNome: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  petDetalhe: { fontSize: 13, marginTop: 2 },
  petVacinaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  petVacinaTexto: { fontSize: 12, flex: 1 },
  botaoSair: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 30, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1 },
  botaoSairTexto: { fontWeight: "bold", fontSize: 16 },
  modalFundo: { flex: 1, justifyContent: "flex-end" },
  modalCaixa: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalConteudo: { padding: 24 },
  inputLabel: { alignSelf: "flex-start", marginTop: 10, marginBottom: 4, fontSize: 14 },
  input: { width: "100%", padding: 10, borderRadius: 8 },
  especieGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  especieOpcao: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  especieOpcaoTexto: { fontSize: 13, fontWeight: "500" },
  botaoSalvar: { marginTop: 20, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoSalvarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoCancelar: { marginTop: 10, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoCancelarTexto: { fontWeight: "bold", fontSize: 16 },
});