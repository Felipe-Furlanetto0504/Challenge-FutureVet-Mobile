import { useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import { useLogin } from "../hooks/useAuth";
import { useDemora } from "../hooks/useDemora";

export default function Login({ navigation }) {
  const { t } = useTheme();
  const [email, SetEmail] = useState("");
  const [senha, SetSenha] = useState("");
  const [mostrarSenha, SetMostrarSenha] = useState(false);
  const login = useLogin();
  const demorou = useDemora(login.isPending);

  function logar() {
    if (!email || !senha) { Alert.alert("Erro", "Preencha todos os campos"); return; }
    login.mutate(
      { email: email.trim(), senha },
      { onError: (erro) => Alert.alert("Erro", erro.message || "Não foi possível entrar.") }
    );
  }

  const s = styles(t);
  return (
    <View style={s.container}>
      <View style={s.logoWrap}>
        <Image
          source={{ uri: "https://png.pngtree.com/png-vector/20230120/ourmid/pngtree-dog-logo-veterinary-design-clipart-vet-golden-retriever-puppy-clinic-png-image_6565449.png" }}
          style={s.logoImg}
          resizeMode="contain"
        />
        <Text style={s.logoNome}>FutureVet</Text>
        <Text style={s.logoSub}>Saúde inteligente para seu pet</Text>
      </View>

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
              editable={!login.isPending}
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
              editable={!login.isPending}
            />
            <TouchableOpacity onPress={() => SetMostrarSenha(!mostrarSenha)} style={s.olho}>
              <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={20} color={t.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.botao} onPress={logar} activeOpacity={0.85} disabled={login.isPending}>
          {login.isPending ? <ActivityIndicator color="#fff" /> : <Text style={s.botaoTexto}>Entrar</Text>}
        </TouchableOpacity>

        {demorou && (
          <Text style={s.avisoServidor}>
            Conectando ao servidor. Na primeira vez do dia isso pode levar até 1 minuto.
          </Text>
        )}

        <TouchableOpacity onPress={() => navigation.navigate("Cadastro")} style={s.linkWrap}>
          <Text style={s.linkTexto}>
            Não tem conta? <Text style={s.linkDestaque}>Criar conta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (t) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  logoWrap: { alignItems: "center", marginBottom: 36 },
  logoImg: { width: 100, height: 100, marginBottom: 14 },
  logoNome: { fontSize: 28, fontWeight: "800", color: t.text, letterSpacing: -0.5 },
  logoSub: { fontSize: 13, color: t.muted, marginTop: 4 },
  card: { width: "100%", backgroundColor: t.surfaceCard, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: t.border },
  titulo: { fontSize: 18, fontWeight: "700", color: t.text, marginBottom: 20 },
  campo: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: t.text2, marginBottom: 6 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: t.inputBg, borderRadius: 12, borderWidth: 1, borderColor: t.border },
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