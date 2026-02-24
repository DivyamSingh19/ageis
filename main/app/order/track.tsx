import { View, Text, StyleSheet } from 'react-native';

export default function OrderTrackScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Track Order</Text>
            <Text>This is a structural placeholder for the Order Tracking page.</Text>
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
