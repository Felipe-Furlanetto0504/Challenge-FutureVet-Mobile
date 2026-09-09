import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE = "https://challenge-sprint3-java.onrender.com";

const TOKEN_KEY = "@futurevet/token";
const USUARIO_KEY = "@futurevet/usuario";

async function montarHeaders(comAuth) {
  const headers = { "Content-Type": "application/json" };
  if (comAuth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch(caminho, { method = "GET", body, comAuth = true } = {}) {
  const headers = await montarHeaders(comAuth);
  const res = await fetch(`${API_BASE}${caminho}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  const texto = await res.text();
  if (texto) {
    try { data = JSON.parse(texto); } catch { data = texto; }
  }

  if (!res.ok) {
    const mensagem = (data && (data.mensagem || data.message)) || `Erro ${res.status}`;
    const erro = new Error(mensagem);
    erro.status = res.status;
    erro.detalhes = data && data.detalhes;
    throw erro;
  }

  return data;
}

export async function salvarSessao(token, usuario) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export async function limparSessao() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
}

export async function lerSessao() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const usuarioRaw = await AsyncStorage.getItem(USUARIO_KEY);
  return {
    token,
    usuario: usuarioRaw ? JSON.parse(usuarioRaw) : null,
  };
}