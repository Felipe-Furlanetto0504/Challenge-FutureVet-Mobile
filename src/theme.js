import { createContext, useContext, useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LIGHT = {
  bg:           "#ffffff",
  bg2:          "#f2f2f2",
  bg3:          "#e8e8e8",
  surface:      "#f2f2f2",
  surfaceCard:  "#f2f2f2",
  border:       "#dddddd",
  text:         "#333333",
  text2:        "#555555",
  muted:        "#888888",
  muted2:       "#aaaaaa",
  placeholder:  "#bbbbbb",
  primary:      "#4A90E2",
  primaryBg:    "#eaf3fb",
  danger:       "#e74c3c",
  dangerBg:     "#fdecea",
  warning:      "#f39c12",
  warningBg:    "#fef9e7",
  success:      "#27ae60",
  successBg:    "#eafaf1",
  modalFundo:   "rgba(0,0,0,0.5)",
  modalBg:      "#ffffff",
  divisor:      "#dddddd",
  avatarBg:     "#4A90E2",
  inputBg:      "#f2f2f2",
  btnOutlineText: "#4A90E2",
};

const DARK = {
  bg:           "#0d0d0d",
  bg2:          "#161616",
  bg3:          "#1e1e1e",
  surface:      "#1a1a1a",
  surfaceCard:  "#1e1e1e",
  border:       "#2a2a2a",
  text:         "#f0f0f0",
  text2:        "#cccccc",
  muted:        "#888888",
  muted2:       "#555555",
  placeholder:  "#444444",
  primary:      "#4A90E2",
  primaryBg:    "rgba(74,144,226,0.15)",
  danger:       "#e74c3c",
  dangerBg:     "rgba(231,76,60,0.15)",
  warning:      "#f39c12",
  warningBg:    "rgba(243,156,18,0.15)",
  success:      "#27ae60",
  successBg:    "rgba(39,174,96,0.15)",
  modalFundo:   "rgba(0,0,0,0.8)",
  modalBg:      "#1a1a1a",
  divisor:      "#2a2a2a",
  avatarBg:     "#1a4a7a",
  inputBg:      "#252525",
  btnOutlineText: "#4A90E2",
};

export const ThemeContext = createContext({
  t: LIGHT,
  dark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [dark, SetDark] = useState(false);

  useEffect(() => {
    async function carregarTema() {
      const salvo = await AsyncStorage.getItem("TEMA");
      if (salvo === "dark") SetDark(true);
    }
    carregarTema();
  }, []);

  async function toggleTheme() {
    const novo = !dark;
    SetDark(novo);
    await AsyncStorage.setItem("TEMA", novo ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ t: dark ? DARK : LIGHT, dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function Chip({ label, ativo, onPress }) {
  const { t } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: ativo ? t.primary : t.border,
        backgroundColor: ativo ? t.primaryBg : "transparent",
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "500", color: ativo ? t.primary : t.text }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Button({ label, variant = "primary", onPress, icon, style }) {
  const { t } = useContext(ThemeContext);
  const bg =
    variant === "danger"  ? t.dangerBg :
    variant === "outline" ? "transparent" :
    t.primary;
  const borderColor =
    variant === "danger"  ? t.danger :
    t.primary;
  const textColor =
    variant === "danger"  ? t.danger :
    variant === "outline" ? t.primary :
    "#fff";
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor,
        backgroundColor: bg,
      }, style]}
    >
      {icon}
      <Text style={{ fontWeight: "bold", fontSize: 15, color: textColor }}>{label}</Text>
    </TouchableOpacity>
  );
}
