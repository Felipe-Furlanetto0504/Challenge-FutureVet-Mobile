import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from '@expo/vector-icons';
import Home from "../screens/Home";
import Vacinas from "../screens/vacinas";
import Perfil from "../screens/Perfil";
import Consultas from "../screens/Consultas";
import Sobre from "../screens/Sobre";
import IoT from "../screens/IoT";
 
const Tab = createBottomTabNavigator();
 
export default function TabRoutes() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Início"
        component={Home}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />, tabBarLabel: "Início" }}
      />
      <Tab.Screen
        name="Vacinas"
        component={Vacinas}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="vaccines" size={size} color={color} />, tabBarLabel: "Vacinas" }}
      />
      <Tab.Screen
        name="IoT"
        component={IoT}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="sensors" size={size} color={color} />, tabBarLabel: "IoT" }}
      />
      <Tab.Screen
        name="Consultas"
        component={Consultas}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="local-hospital" size={size} color={color} />, tabBarLabel: "Consultas" }}
      />
      <Tab.Screen
        name="Sobre"
        component={Sobre}
        options={{ tabBarIcon: ({ color, size }) => <AntDesign name="book" size={size} color={color} />, tabBarLabel: "Sobre" }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="emoji-emotions" size={size} color={color} />, tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}