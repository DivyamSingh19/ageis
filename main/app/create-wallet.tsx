import { View, Text, StyleSheet } from 'react-native';

export default function CreateWalletScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Wallet</Text>
            <Text>This is a structural placeholder for the Wallet creation flow.</Text>
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
