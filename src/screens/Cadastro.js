import { useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useRegistro } from "../hooks/useAuth";
import { useDemora } from "../hooks/useDemora";

export default function Cadastro({ navigation }) {
  const { t } = useTheme();
  const [nome, SetNome] = useState("");
  const [email, SetEmail] = useState("");
  const [senha, SetSenha] = useState("");
  const [confirmacao, SetConfirmacao] = useState("");
  const [cpf, SetCpf] = useState("");
  const [telefone, SetTelefone] = useState("");
  const [mostrarSenha, SetMostrarSenha] = useState(false);
  const registro = useRegistro();
  const demorou = useDemora(registro.isPending);

  function salvar() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpfLimpo = cpf.replace(/\D/g, "");
    const telefoneLimpo = telefone.replace(/\D/g, "");

    if (!nome || !email || !senha || !confirmacao || !cpf || !telefone) {
      Alert.alert("Erro", "Preencha todos os campos."); return;
    }
    if (nome.trim().length < 3) { Alert.alert("Erro", "O nome deve ter pelo menos 3 caracteres."); return; }
    if (!emailRegex.test(email)) { Alert.alert("Erro", "Digite um e-mail válido."); return; }
    if (senha.length < 8) { Alert.alert("Erro", "A senha deve ter pelo menos 8 caracteres."); return; }
    if (senha !== confirmacao) { Alert.alert("Erro", "As senhas não conferem."); return; }
    if (cpfLimpo.length !== 11) { Alert.alert("Erro", "Digite um CPF válido."); return; }
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) { Alert.alert("Erro", "Digite um telefone válido."); return; }

    registro.mutate(
      { nome: nome.trim(), email: email.trim(), senha, confirmacao, cpf, telefone },
      {
        onSuccess: () => {
          Alert.alert("Sucesso", "Cadastro realizado! Faça login para continuar.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
        },
        onError: (erro) => Alert.alert("Erro", erro.message || "Não foi possível criar a conta."),
      }
    );
  }

  const s = styles(t);
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.container}>
      <View style={s.logoWrap}>
        <Image
          source={{ uri: "https://png.pngtree.com/png-vector/20230120/ourmid/pngtree-dog-logo-veterinary-design-clipart-vet-golden-retriever-puppy-clinic-png-image_6565449.png" }}
          style={s.logoImg}
          resizeMode="contain"
        />
        <Text style={s.logoNome}>FutureVet</Text>
        <Text style={s.logoSub}>Crie sua conta para começar</Text>
      </View>

      <View style={s.card}>
        <Text style={s.titulo}>Criar conta</Text>

        <Campo label="Nome completo" t={t}>
          <MaterialIcons name="person-outline" size={18} color={t.muted} style={s.inputIcone} />
          <TextInput value={nome} onChangeText={SetNome} style={s.input}
            placeholder="Como devemos te chamar?" placeholderTextColor={t.placeholder} />
        </Campo>

        <Campo label="Email" t={t}>
          <MaterialIcons name="email" size={18} color={t.muted} style={s.inputIcone} />
          <TextInput value={email} onChangeText={SetEmail} style={s.input}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="seu@email.com" placeholderTextColor={t.placeholder} />
        </Campo>

        <Campo label="Senha" t={t}>
          <MaterialIcons name="lock-outline" size={18} color={t.muted} style={s.inputIcone} />
          <TextInput value={senha} onChangeText={SetSenha} style={s.input}
            secureTextEntry={!mostrarSenha} placeholder="Mínimo 8 caracteres" placeholderTextColor={t.placeholder} />
          <TouchableOpacity onPress={() => SetMostrarSenha(!mostrarSenha)} style={s.olho}>
            <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={t.muted} />
          </TouchableOpacity>
        </Campo>

        <Campo label="Confirmar senha" t={t}>
          <MaterialIcons name="lock-outline" size={18} color={t.muted} style={s.inputIcone} />
          <TextInput value={confirmacao} onChangeText={SetConfirmacao} style={s.input}
            secureTextEntry={!mostrarSenha} placeholder="Repita a senha" placeholderTextColor={t.placeholder} />
        </Campo>

        <Campo label="CPF" t={t}>
          <MaterialIcons name="badge" size={18} color={t.muted} style={s.inputIcone} />
          <MaskedTextInput mask="999.999.999-99" value={cpf} onChangeText={SetCpf}
            style={s.input} keyboardType="numeric"
            placeholder="000.000.000-00" placeholderTextColor={t.placeholder} />
        </Campo>

        <Campo label="Telefone" t={t}>
          <MaterialIcons name="phone" size={18} color={t.muted} style={s.inputIcone} />
          <MaskedTextInput mask="(99) 99999-9999" value={telefone} onChangeText={SetTelefone}
            style={s.input} keyboardType="numeric"
            placeholder="(00) 00000-0000" placeholderTextColor={t.placeholder} />
        </Campo>

        <TouchableOpacity style={s.botao} onPress={salvar} activeOpacity={0.85} disabled={registro.isPending}>
          {registro.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTexto}>Criar conta</Text>}
        </TouchableOpacity>

        {demorou && (
          <Text style={s.avisoServidor}>
            Conectando ao servidor. Na primeira vez do dia isso pode levar até 1 minuto.
          </Text>
        )}

        <TouchableOpacity onPress={() => navigation.goBack()} style={s.linkWrap}>
          <Text style={s.linkTexto}>
            Já tem conta? <Text style={s.linkDestaque}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Campo({ label, t, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: t.text2, marginBottom: 6 }}>{label}</Text>
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: t.inputBg, borderRadius: 12,
        borderWidth: 1, borderColor: t.border,
      }}>
        {children}
      </View>
    </View>
  );
}

const styles = (t) => StyleSheet.create({
  container: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 48 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  logoImg: { width: 100, height: 100, marginBottom: 14 },
  logoNome: { fontSize: 28, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  logoSub: { fontSize: 13, color: t.muted, marginTop: 4 },
  card: { width: "100%", backgroundColor: t.surfaceCard, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: t.border },
  titulo: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 20 },
  inputIcone: { paddingLeft: 12 },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 15, color: t.text },
  olho: { paddingHorizontal: 12 },
  botao: { marginTop: 8, backgroundColor: t.primary, paddingVertical: 15, borderRadius: 14, alignItems: "center" },
  botaoTexto: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },
  avisoServidor: { marginTop: 12, textAlign: "center", fontSize: 13, color: t.muted, lineHeight: 18 },
  linkWrap: { marginTop: 16, alignItems: "center" },
  linkTexto: { color: t.muted, fontSize: 13 },
  linkDestaque: { color: t.primary, fontWeight: "700" },
});