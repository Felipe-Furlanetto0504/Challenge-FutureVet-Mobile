import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme";

export default function Login({ navigation }) {
  const { t } = useTheme();
  const [email, SetEmail] = useState("");
  const [senha, SetSenha] = useState("");
  const [mostrarSenha, SetMostrarSenha] = useState(false);

  async function logar() {
    if (!email || !senha) { Alert.alert("Erro", "Preencha todos os campos"); return; }
    const dados = await AsyncStorage.getItem("INFORMACOES");
    if (!dados) { Alert.alert("Erro", "Nenhum cadastro encontrado"); return; }
    const obj = JSON.parse(dados);
    if (obj.email === email && obj.senha === senha) {
      await AsyncStorage.setItem("LOGADO", "true");
      navigation.reset({ index: 0, routes: [{ name: "App" }] });
    } else {
      Alert.alert("Erro", "Email ou senha incorretos");
    }
  }

  const s = styles(t);
  return (
    <View style={s.container}>

      {/* Logo */}
      <View style={s.logoWrap}>
        <View style={s.logoCircle}>
          <FontAwesome5 name="paw" size={36} color={t.primary} />
        </View>
        <Text style={s.logoNome}>FutureVet</Text>
        <Text style={s.logoSub}>Saúde inteligente para seu pet</Text>
      </View>

      {/* Card */}
      <View style={s.card}>
        <Text style={s.titulo}>Entrar na conta</Text>

        <View style={s.campo}>
          <Text style={s.label}>Email</Text>
          <View style={s.inputWrap}>
            <MaterialIcons name="email" size={18} color={t.muted} style={s.inputIcone} />
            <TextInput
              value={email}
              onChangeText={SetEmail}
              style={s.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu@email.com"
              placeholderTextColor={t.placeholder}
            />
          </View>
        </View>

        <View style={s.campo}>
          <Text style={s.label}>Senha</Text>
          <View style={s.inputWrap}>
            <MaterialIcons name="lock-outline" size={18} color={t.muted} style={s.inputIcone} />
            <TextInput
              value={senha}
              onChangeText={SetSenha}
              style={s.input}
              secureTextEntry={!mostrarSenha}
              placeholder="••••••••"
              placeholderTextColor={t.placeholder}
            />
            <TouchableOpacity onPress={() => SetMostrarSenha(!mostrarSenha)} style={s.olho}>
              <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={t.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.botao} onPress={logar} activeOpacity={0.85}>
          <Text style={s.botaoTexto}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 36,
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
  campo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: t.text2,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
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
