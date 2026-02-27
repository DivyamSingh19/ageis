import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { width } = Dimensions.get('window');

    const ACCENT_COLOR = '#EDC001';

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
            <View className="flex-row items-center justify-around w-full px-2">
                {/* Marketplace Tab */}
                <TabItem
                    label="Market"
                    icon={<View style={{ backgroundColor: ACCENT_COLOR }} className="p-1 rounded-lg">
                        <MaterialCommunityIcons name="storefront" size={24} color="black" />
                    </View>}
                    active={state.index === 1} // index in layout
                    onPress={() => navigation.navigate('index')}
                    accentColor={ACCENT_COLOR}
                />

                {/* Nav Tab */}
                <TabItem
                    label="Nav"
                    icon={<Ionicons name="map-outline" size={28} color={state.index === 0 ? ACCENT_COLOR : '#666'} />}
                    active={state.index === 0}
                    onPress={() => navigation.navigate('navigation')}
                    accentColor={ACCENT_COLOR}
                />

                {/* Verify (Middle Button) */}
                <TouchableOpacity
                    onPress={() => router.push('/verify-nfc')}
                    style={styles.scanButtonContainer}
                    activeOpacity={0.8}
                >
                    <View style={{ backgroundColor: ACCENT_COLOR }} className="w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-yellow-500/50">
                        <MaterialCommunityIcons name="nfc-search-variant" size={32} color="black" />
                    </View>
                    <Text className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-tighter">Verify</Text>
                </TouchableOpacity>

                {/* Orders Tab */}
                <TabItem
                    label="Orders"
                    icon={<View className="bg-zinc-800 p-1 rounded-lg">
                        <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={state.index === 2 ? ACCENT_COLOR : '#666'} />
                    </View>}
                    active={state.index === 2}
                    onPress={() => navigation.navigate('all-orders')}
                    accentColor={ACCENT_COLOR}
                />

                {/* Profile Tab */}
                <TabItem
                    label="Profile"
                    icon={<Ionicons name="person-circle-outline" size={28} color={state.index === 3 ? ACCENT_COLOR : '#666'} />}
                    active={state.index === 3}
                    onPress={() => navigation.navigate('profile')}
                    accentColor={ACCENT_COLOR}
                />
            </View>
        </View>
    );
}

function TabItem({ label, icon, active, onPress, accentColor }: { label: string, icon: React.ReactNode, active: boolean, onPress: () => void, accentColor: string }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="items-center justify-center py-2"
            activeOpacity={0.7}
        >
            {icon}
            <Text
                style={{ color: active ? accentColor : '#666' }}
                className="text-[10px] mt-1 font-bold uppercase tracking-tighter"
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#050505',
        borderTopWidth: 1,
        borderTopColor: '#111',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: 100, // Fixed height to accommodate elevated button
        alignItems: 'center',
    },
    scanButtonContainer: {
        top: -30, // Elevate the middle button
        alignItems: 'center',
        justifyContent: 'center',
    },
});
