import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import Login from "../screens/Login";
import Cadastro from "../screens/Cadastro";
import TabRoutes from "./tab.routes";
import { useSessao } from "../hooks/useAuth";

const Stack = createNativeStackNavigator();

export default function Routes() {
  const { data: sessao, isLoading } = useSessao();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const logado = !!sessao?.token;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={logado ? "App" : "Login"} screenOptions={{ headerShown: false }}>
        {logado ? (
          <Stack.Screen name="App" component={TabRoutes} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Cadastro} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}