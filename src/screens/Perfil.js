import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Text, View, StyleSheet, TouchableOpacity, Alert,
  ScrollView, Modal, TextInput, Switch,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../theme";

const ESPECIES = [
  { valor: "dog",    label: "🐕 Cão"    },
  { valor: "cat",    label: "🐈 Gato"   },
  { valor: "rabbit", label: "🐇 Coelho" },
  { valor: "other",  label: "🐾 Outro"  },
];

export default function Perfil({ navigation }) {
  const { t, dark, toggleTheme } = useTheme();

  const [dados, SetDados]               = useState(null);
  const [pets, SetPets]                 = useState([]);
  const [vacinas, SetVacinas]           = useState([]);

  const [modalPet, SetModalPet]         = useState(false);
  const [nomePet, SetNomePet]           = useState("");
  const [idadePet, SetIdadePet]         = useState("");
  const [tamanhoPet, SetTamanhoPet]     = useState("");
  const [pesoPet, SetPesoPet]           = useState("");
  const [especiePet, SetEspeciePet]     = useState("dog");
  const [racaPet, SetRacaPet]           = useState("");

  const [modalEditar, SetModalEditar]   = useState(false);
  const [editNome, SetEditNome]         = useState("");
  const [editEmail, SetEditEmail]       = useState("");
  const [editTelefone, SetEditTelefone] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    const dadosSalvos = await AsyncStorage.getItem("INFORMACOES");
    if (dadosSalvos) SetDados(JSON.parse(dadosSalvos));
    const petsSalvos = await AsyncStorage.getItem("PETS");
    if (petsSalvos) SetPets(JSON.parse(petsSalvos));
    const vacinasSalvas = await AsyncStorage.getItem("VACINAS");
    if (vacinasSalvas) SetVacinas(JSON.parse(vacinasSalvas));
  }

  async function sair() {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair", style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("LOGADO");
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  }

  function abrirModalEditar() {
    SetEditNome(dados.nome);
    SetEditEmail(dados.email);
    SetEditTelefone(dados.telefone || "");
    SetModalEditar(true);
  }

  async function salvarEdicao() {
    if (!editNome || !editEmail) {
      Alert.alert("Erro", "Nome e email são obrigatórios");
      return;
    }
    const novosDados = { ...dados, nome: editNome, email: editEmail, telefone: editTelefone };
    await AsyncStorage.setItem("INFORMACOES", JSON.stringify(novosDados));
    SetDados(novosDados);
    SetModalEditar(false);
  }

  async function salvarPet() {
    if (!nomePet || !idadePet || !tamanhoPet || !pesoPet) {
      Alert.alert("Erro", "Preencha todos os campos do pet");
      return;
    }
    const novoPet = {
      id: Date.now().toString(),
      nome: nomePet, idade: idadePet,
      tamanho: tamanhoPet, peso: pesoPet,
      especie: especiePet, raca: racaPet,
    };
    const novaLista = [...pets, novoPet];
    SetPets(novaLista);
    await AsyncStorage.setItem("PETS", JSON.stringify(novaLista));
    SetNomePet(""); SetIdadePet(""); SetTamanhoPet("");
    SetPesoPet(""); SetEspeciePet("dog"); SetRacaPet("");
    SetModalPet(false);
  }

  async function excluirPet(id) {
    Alert.alert("Excluir", "Deseja excluir este pet?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: async () => {
          const novaLista = pets.filter((p) => p.id !== id);
          SetPets(novaLista);
          await AsyncStorage.setItem("PETS", JSON.stringify(novaLista));
        },
      },
    ]);
  }

  function resumoVacinas(nomeDoPet) {
    const dosPet = vacinas.filter(
      (v) => v.nomePet?.toLowerCase() === nomeDoPet.toLowerCase()
    );
    if (dosPet.length === 0) return { total: 0, proxima: null, diasMin: null };
    let diasMin = null, proxima = null;
    dosPet.forEach((v) => {
      if (!v.proxDose || v.proxDose.length < 10) return;
      const p = v.proxDose.split("/");
      if (p.length !== 3) return;
      const data = new Date(`${p[2]}-${p[1]}-${p[0]}`);
      if (isNaN(data)) return;
      const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
      const diff = Math.round((data - hoje) / 86400000);
      if (diasMin === null || diff < diasMin) { diasMin = diff; proxima = v.nomeVacina; }
    });
    return { total: dosPet.length, proxima, diasMin };
  }

  function corDias(dias) {
    if (dias === null) return t.muted;
    if (dias <= 7)     return t.danger;
    if (dias <= 30)    return t.warning;
    return t.success;
  }

  function textoDias(dias) {
    if (dias === null)       return "";
    if (dias < 0)            return `Venceu há ${Math.abs(dias)}d`;
    if (dias === 0)          return "Vence hoje";
    if (dias === 1)          return "Vence amanhã";
    return `Em ${dias} dias`;
  }

  function emojiEspecie(especie) {
    return { dog: "🐕", cat: "🐈", rabbit: "🐇", other: "🐾" }[especie] || "🐾";
  }

  if (!dados) return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: t.muted, fontSize: 16 }}>Carregando...</Text>
    </View>
  );

  return (
    <ScrollView
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.titulo, { color: t.text }]}>Seu Perfil</Text>

      <View style={[styles.avatar, { backgroundColor: t.primary }]}>
        <Text style={styles.avatarLetra}>
          {dados.nome.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.nome, { color: t.text }]}>{dados.nome}</Text>

      <View style={[styles.card, { backgroundColor: t.surfaceCard }]}>
        <View style={styles.cardHeaderLinha}>
          <Text style={[styles.secaoTitulo, { color: t.text }]}>Dados pessoais</Text>
          <TouchableOpacity style={[styles.botaoEditar, { borderColor: t.primary }]} onPress={abrirModalEditar}>
            <MaterialIcons name="edit" size={16} color={t.primary} />
            <Text style={[styles.botaoEditarTexto, { color: t.primary }]}>Editar</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.divisor, { backgroundColor: t.divisor }]} />
        {[
          { label: "Email",    valor: dados.email },
          { label: "CPF",      valor: dados.cpf },
          { label: "Telefone", valor: dados.telefone || "—" },
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
        <View style={styles.cardHeaderLinha}>
          <Text style={[styles.secaoTitulo, { color: t.text }]}>Aparência</Text>
        </View>
        <View style={[styles.divisor, { backgroundColor: t.divisor }]} />
        <View style={styles.temaLinha}>
          <View style={styles.temaEsquerda}>
            <View style={[styles.temaIcone, { backgroundColor: dark ? t.bg3 : t.primaryBg }]}>
              <MaterialIcons
                name={dark ? "dark-mode" : "light-mode"}
                size={22}
                color={dark ? "#f39c12" : t.primary}
              />
            </View>
            <View>
              <Text style={[styles.temaTitulo, { color: t.text }]}>
                {dark ? "Modo Escuro" : "Modo Claro"}
              </Text>
              <Text style={[styles.temaSubtitulo, { color: t.muted }]}>
                {dark ? "Interface com fundo escuro" : "Interface com fundo claro"}
              </Text>
            </View>
          </View>
          <Switch
            value={dark}
            onValueChange={toggleTheme}
            trackColor={{ false: t.border, true: t.primaryBg }}
            thumbColor={dark ? t.primary : t.muted2}
          />
        </View>
      </View>

      <View style={[styles.secaoHeader, { width: "100%" }]}>
        <Text style={[styles.secaoTitulo, { color: t.text }]}>Meus Pets</Text>
        <TouchableOpacity
          style={[styles.botaoAdicionarPet, { backgroundColor: t.primary }]}
          onPress={() => SetModalPet(true)}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.botaoAdicionarPetTexto}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.petVazio}>
          <FontAwesome5 name="paw" size={30} color={t.muted2} />
          <Text style={[styles.petVazioTexto, { color: t.muted2 }]}>Nenhum pet cadastrado</Text>
        </View>
      ) : (
        pets.map((pet) => {
          const rv = resumoVacinas(pet.nome);
          return (
            <View key={pet.id} style={[styles.petCard, { backgroundColor: t.surfaceCard }]}>
              <View style={styles.petIcone}>
                <Text style={{ fontSize: 28 }}>{emojiEspecie(pet.especie)}</Text>
              </View>
              <View style={styles.petInfo}>
                <Text style={[styles.petNome, { color: t.text }]}>{pet.nome}</Text>
                {pet.raca ? <Text style={[styles.petDetalhe, { color: t.text2 }]}>{pet.raca}</Text> : null}
                <Text style={[styles.petDetalhe, { color: t.text2 }]}>
                  Idade: {pet.idade}  ·  Peso: {pet.peso}  ·  Tam.: {pet.tamanho}
                </Text>
                <View style={styles.petVacinaRow}>
                  <MaterialIcons name="vaccines" size={13} color={t.primary} />
                  {rv.total === 0 ? (
                    <Text style={[styles.petVacinaTexto, { color: t.muted }]}>Sem vacinas cadastradas</Text>
                  ) : rv.proxima ? (
                    <Text style={[styles.petVacinaTexto, { color: t.muted }]}>
                      {rv.total} vacina{rv.total !== 1 ? "s" : ""}  ·  {rv.proxima}:{" "}
                      <Text style={{ color: corDias(rv.diasMin), fontWeight: "bold" }}>
                        {textoDias(rv.diasMin)}
                      </Text>
                    </Text>
                  ) : (
                    <Text style={[styles.petVacinaTexto, { color: t.muted }]}>
                      {rv.total} vacina{rv.total !== 1 ? "s" : ""} cadastrada{rv.total !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => excluirPet(pet.id)}>
                <MaterialIcons name="delete-outline" size={24} color={t.danger} />
              </TouchableOpacity>
            </View>
          );
        })
      )}

      <TouchableOpacity style={[styles.botaoSair, { borderColor: t.danger }]} onPress={sair}>
        <MaterialIcons name="logout" size={20} color={t.danger} />
        <Text style={[styles.botaoSairTexto, { color: t.danger }]}>Sair da conta</Text>
      </TouchableOpacity>

      <Modal visible={modalPet} animationType="slide" transparent>
        <View style={[styles.modalFundo, { backgroundColor: t.modalFundo }]}>
          <ScrollView contentContainerStyle={[styles.modalContainer, { backgroundColor: t.modalBg }]}>
            <Text style={[styles.modalTitulo, { color: t.text }]}>Novo Pet</Text>

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

            <Text style={[styles.inputLabel, { color: t.text }]}>Tamanho</Text>
            <TextInput value={tamanhoPet} onChangeText={SetTamanhoPet}
              style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
              placeholder="Ex: Pequeno, Médio, Grande..." placeholderTextColor={t.placeholder} />

            <Text style={[styles.inputLabel, { color: t.text }]}>Peso</Text>
            <TextInput value={pesoPet} onChangeText={SetPesoPet}
              style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
              placeholder="Ex: 5kg, 10kg..." placeholderTextColor={t.placeholder} keyboardType="numeric" />

            <TouchableOpacity style={[styles.botaoSalvar, { backgroundColor: t.primary }]} onPress={salvarPet}>
              <Text style={styles.botaoSalvarTexto}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => SetModalPet(false)}>
              <Text style={[styles.botaoCancelarTexto, { color: t.danger }]}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={modalEditar} animationType="slide" transparent>
        <View style={[styles.modalFundo, { backgroundColor: t.modalFundo }]}>
          <View style={[styles.modalContainer, { backgroundColor: t.modalBg }]}>
            <Text style={[styles.modalTitulo, { color: t.text }]}>Editar Dados</Text>

            <Text style={[styles.inputLabel, { color: t.text }]}>Nome</Text>
            <TextInput value={editNome} onChangeText={SetEditNome}
              style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
              placeholder="Seu nome completo" placeholderTextColor={t.placeholder} />

            <Text style={[styles.inputLabel, { color: t.text }]}>Email</Text>
            <TextInput value={editEmail} onChangeText={SetEditEmail}
              style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
              placeholder="seu@email.com" placeholderTextColor={t.placeholder}
              keyboardType="email-address" autoCapitalize="none" />

            <Text style={[styles.inputLabel, { color: t.text }]}>Telefone</Text>
            <TextInput value={editTelefone} onChangeText={SetEditTelefone}
              style={[styles.input, { backgroundColor: t.inputBg, color: t.text }]}
              placeholder="(11) 99999-9999" placeholderTextColor={t.placeholder} keyboardType="phone-pad" />

            <TouchableOpacity style={[styles.botaoSalvar, { backgroundColor: t.primary }]} onPress={salvarEdicao}>
              <Text style={styles.botaoSalvarTexto}>Salvar alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoCancelar} onPress={() => SetModalEditar(false)}>
              <Text style={[styles.botaoCancelarTexto, { color: t.danger }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:             { alignItems: "center", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  titulo:                { fontSize: 22, fontWeight: "700", marginBottom: 30 },
  avatar:                { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarLetra:           { fontSize: 42, fontWeight: "bold", color: "#fff" },
  nome:                  { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  card:                  { width: "100%", borderRadius: 16, padding: 16 },
  cardHeaderLinha:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10 },
  botaoEditar:           { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  botaoEditarTexto:      { fontSize: 13, fontWeight: "bold" },
  linha:                 { paddingVertical: 10 },
  label:                 { fontSize: 12, marginBottom: 2 },
  valor:                 { fontSize: 16, fontWeight: "500" },
  divisor:               { height: 1 },
  temaLinha:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10 },
  temaEsquerda:          { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  temaIcone:             { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  temaTitulo:            { fontSize: 15, fontWeight: "bold" },
  temaSubtitulo:         { fontSize: 12, marginTop: 2 },
  secaoHeader:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 12 },
  secaoTitulo:           { fontSize: 18, fontWeight: "bold" },
  botaoAdicionarPet:     { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  botaoAdicionarPetTexto:{ color: "#fff", fontWeight: "bold", fontSize: 14 },
  petVazio:              { alignItems: "center", paddingVertical: 20, gap: 8 },
  petVazioTexto:         { fontSize: 14 },
  petCard:               { flexDirection: "row", alignItems: "center", borderRadius: 12, padding: 14, marginBottom: 10, width: "100%" },
  petIcone:              { marginRight: 12, width: 36, alignItems: "center" },
  petInfo:               { flex: 1 },
  petNome:               { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  petDetalhe:            { fontSize: 13, marginTop: 2 },
  petVacinaRow:          { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  petVacinaTexto:        { fontSize: 12, flex: 1 },
  botaoSair:             { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 30, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1 },
  botaoSairTexto:        { fontWeight: "bold", fontSize: 16 },
  modalFundo:            { flex: 1, justifyContent: "flex-end" },
  modalContainer:        { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitulo:           { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  inputLabel:            { alignSelf: "flex-start", marginTop: 10, marginBottom: 4, fontSize: 14 },
  input:                 { width: "100%", padding: 10, borderRadius: 8 },
  especieGrid:           { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  especieOpcao:          { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  especieOpcaoTexto:     { fontSize: 13, fontWeight: "500" },
  botaoSalvar:           { marginTop: 20, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoSalvarTexto:      { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botaoCancelar:         { marginTop: 10, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  botaoCancelarTexto:    { fontWeight: "bold", fontSize: 16 },
});