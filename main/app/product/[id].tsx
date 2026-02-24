import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: `Product ${id}` }} />
            <Text style={styles.title}>Product Details</Text>
            <Text>Product ID: {id}</Text>
            <Text>This is a structural placeholder for the Product Details page.</Text>
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
