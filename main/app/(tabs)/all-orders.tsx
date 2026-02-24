import { View, Text, StyleSheet } from 'react-native';

export default function AllOrdersScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>All Orders</Text>
            <Text>This is a structural placeholder for the All Orders page.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
