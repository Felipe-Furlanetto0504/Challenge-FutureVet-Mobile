import { Text, View, StyleSheet } from "react-native"; 

export default function Consultas(){
    return(
        <View style={styles.container}>
            <Text>consultas</Text>
        </View>
    );
}

const styles = StyleSheet.create({


    container:{
        flex:1,
        backgroundColor: '#fff',
        alignItems:'center',
        justifyContent:'center',
    },
});