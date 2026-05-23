import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { Ionicons } from "@expo/vector-icons";

export default function Cadastro({ navigation }) {
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
        SetNome(obj.nome);
        SetEmail(obj.email);
        SetSenha(obj.senha);
        SetCpf(obj.cpf || "");
        SetTelefone(obj.telefone || "");
      }
    }
    carregar();
  }, []);

  async function salvar() {
    if (!nome || !email || !senha || !cpf || !telefone) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    const dados = { nome, email, senha, cpf, telefone };
    await AsyncStorage.setItem("INFORMACOES", JSON.stringify(dados));
    Alert.alert("Sucesso", "Dados salvos", [
      {
        text: "OK",
        onPress: () =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }], 
          }),
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastro</Text>

      <Text style={styles.vazioSubTexto}>Seja Bem-Vindo ao FutureVet</Text>
      
      <Text style={styles.label}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={SetNome}
        style={styles.input}
        placeholder="Digite seu nome"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={SetEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Digite seu email"
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.senhaContainer}>
        <TextInput
          value={senha}
          onChangeText={SetSenha}
          style={styles.senhaInput}
          secureTextEntry={!mostrarSenha}
          placeholder="Digite sua senha"
        />
        <TouchableOpacity onPress={() => SetMostrarSenha(!mostrarSenha)} style={styles.olho}>
          <Ionicons
            name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>CPF</Text>
      <MaskedTextInput
        mask="999.999.999-99"
        value={cpf}
        onChangeText={(text) => SetCpf(text)}
        style={styles.input}
        keyboardType="numeric"
        placeholder="000.000.000-00"
      />

      <Text style={styles.label}>Telefone</Text>
      <MaskedTextInput
        mask="(99) 99999-9999"
        value={telefone}
        onChangeText={(text) => SetTelefone(text)}
        style={styles.input}
        keyboardType="numeric"
        placeholder="(00) 00000-0000"
      />

      <TouchableOpacity style={styles.botao} onPress={salvar}>
        <Text style={styles.botaoTexto}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  label: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    width: "100%",
  },
  senhaInput: {
    flex: 1,
    padding: 10,
  },
  olho: {
    paddingHorizontal: 10,
  },
    vazioSubTexto: {
    fontSize: 14,
  },
  botao: {
    marginTop: 24,
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});