import { View, Text, StyleSheet } from 'react-native';

export default function TransactionScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Transaction</Text>
            <Text>This is a structural placeholder for handling Web2/Web3 transactions.</Text>
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
