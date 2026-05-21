import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import {Feather} from '@expo/vector-icons'
import Home from "../screens/Home";
import Cadastro from "../screens/Cadastro";
import Login from "../screens/Login";
import Vacinas from "../screens/vacinas";
import Perfil from "../screens/Perfil";
import Consultas from "../screens/Consultas";
import Sobre from "../screens/Sobre";

const Tab = createBottomTabNavigator()

export default function TabRoutes(){
    return(
        <Tab.Navigator screenOptions={{headerShown:false}}>
            <Tab.Screen name = "cadastro" component={Cadastro} options={{tabBarIcon:({color,size})=><MaterialCommunityIcons name="door-open" size={size} color={color} />,
        tabBarLabel:"Cadastro"}}/>
            <Tab.Screen name = "login" component={Login} options={{tabBarIcon:({color,size})=><Feather name="log-in" color={color} size={size}/>,
        tabBarLabel:"Login"}}/>
            <Tab.Screen name = "home" component={Home} options={{tabBarIcon:({color,size})=><Feather name="home" color={color} size={size}/>,
        tabBarLabel:"Início"}}/>
            <Tab.Screen name = "vacinas" component={Vacinas} options={{tabBarIcon:({color,size})=><MaterialIcons name="vaccines" size={size} color={color} />,
        tabBarLabel:"Vacinas"}}/>
            <Tab.Screen name = "consultas" component={Consultas} options={{tabBarIcon:({color,size})=><MaterialIcons name="local-hospital" size={size} color={color} />,
        tabBarLabel:"Consultas"}}/>
            <Tab.Screen name = "sobre" component={Sobre} options={{tabBarIcon:({color,size})=><AntDesign name="book" size={size} color={color} />,
        tabBarLabel:"Sobre"}}/>
            <Tab.Screen name = "perfil" component={Perfil} options={{tabBarIcon:({color,size})=><MaterialIcons name="emoji-emotions" size={size} color={color} />,
        tabBarLabel:"Perfil"}}/>
        </Tab.Navigator>
    );
}