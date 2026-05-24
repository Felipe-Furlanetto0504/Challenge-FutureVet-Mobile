import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme";

export default function Cadastro({ navigation }) {
  const { t } = useTheme();
  const [nome, SetNome] = useState("");
  const [email, SetEmail] = useState("");
  const [senha, SetSenha] = useState("");
  const [cpf, SetCpf] = useState("");
  const [telefone, SetTelefone] = useState("");
  const [mostrarSenha, SetMostrarSenha] = useState(false);

  useEffect(() => {
    async function carregar() {
      const dados = await AsyncStorage.getItem("INFORMACOES");
      if (dados) {
        const obj = JSON.parse(dados);
        SetNome(obj.nome); SetEmail(obj.email); SetSenha(obj.senha);
        SetCpf(obj.cpf || ""); SetTelefone(obj.telefone || "");
      }
    }
    carregar();
  }, []);

  async function salvar() {
    if (!nome || !email || !senha || !cpf || !telefone) {
      Alert.alert("Erro", "Preencha todos os campos"); return;
    }
    const dados = { nome, email, senha, cpf, telefone };
    await AsyncStorage.setItem("INFORMACOES", JSON.stringify(dados));
    Alert.alert("Sucesso", "Cadastro realizado!", [{
      text: "Ir para Login",
      onPress: () => navigation.reset({ index: 0, routes: [{ name: "Login" }] }),
    }]);
  }

  const s = styles(t);
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.container}>

      {/* Logo */}
      <View style={s.logoWrap}>
        <Image
          source={{ uri: "https://png.pngtree.com/png-vector/20230120/ourmid/pngtree-dog-logo-veterinary-design-clipart-vet-golden-retriever-puppy-clinic-png-image_6565449.png" }}
          style={s.logoImg}
          resizeMode="contain"
        />
        <Text style={s.logoNome}>FutureVet</Text>
        <Text style={s.logoSub}>Crie sua conta para começar</Text>
      </View>

      {/* Card */}
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
            secureTextEntry={!mostrarSenha} placeholder="••••••••" placeholderTextColor={t.placeholder} />
          <TouchableOpacity onPress={() => SetMostrarSenha(!mostrarSenha)} style={s.olho}>
            <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={t.muted} />
          </TouchableOpacity>
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

        <TouchableOpacity style={s.botao} onPress={salvar} activeOpacity={0.85}>
          <Text style={s.botaoTexto}>Criar conta</Text>
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
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoImg: {
    width: 100,
    height: 100,
    marginBottom: 14,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: t.primaryBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: t.primary + "40",
  },
  logoNome: {
    fontSize: 28,
    fontWeight: "800",
    color: t.text,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 13,
    color: t.muted,
    marginTop: 4,
  },
  card: {
    width: "100%",
    backgroundColor: t.surfaceCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: t.border,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: t.text,
    marginBottom: 20,
  },
  inputIcone: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 10,
    fontSize: 15,
    color: t.text,
  },
  olho: {
    paddingHorizontal: 12,
  },
  botao: {
    marginTop: 8,
    backgroundColor: t.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
