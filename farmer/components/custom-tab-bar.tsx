import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { width } = Dimensions.get('window');

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
            <View className="flex-row items-center justify-around w-full px-2">
                {/* New Product Tab */}
                <TabItem
                    label="New"
                    icon={<View style={{ backgroundColor: '#13EC13' }} className="p-1 rounded-lg">
                        <Ionicons name="add" size={24} color="black" />
                    </View>}
                    active={state.index === 2} // new-product is index 2 in our layout
                    onPress={() => navigation.navigate('new-product')}
                />

                {/* History Tab */}
                <TabItem
                    label="History"
                    icon={<Ionicons name="time-outline" size={28} color={state.index === 1 ? '#13EC13' : '#666'} />}
                    active={state.index === 1}
                    onPress={() => navigation.navigate('history')}
                />

                {/* Scan (Middle Button) */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('scan')}
                    style={styles.scanButtonContainer}
                    activeOpacity={0.8}
                >
                    <View style={{ backgroundColor: '#13EC13' }} className="w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-green-500/50">
                        <MaterialCommunityIcons name="qrcode-scan" size={32} color="black" />
                    </View>
                    <Text className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-tighter">Scan</Text>
                </TouchableOpacity>

                {/* Insights Tab */}
                <TabItem
                    label="Insights"
                    icon={<View className="bg-zinc-800 p-1 rounded-lg">
                        <MaterialCommunityIcons name="chart-bar" size={24} color={state.index === 3 ? '#13EC13' : '#666'} />
                    </View>}
                    active={state.index === 3}
                    onPress={() => navigation.navigate('insights')}
                />

                {/* Profile Tab */}
                <TabItem
                    label="Settings"
                    icon={<Ionicons name="person-circle-outline" size={28} color={state.index === 4 ? '#13EC13' : '#666'} />}
                    active={state.index === 4}
                    onPress={() => navigation.navigate('profile')}
                />
            </View>
        </View>
    );
}

function TabItem({ label, icon, active, onPress }: { label: string, icon: React.ReactNode, active: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="items-center justify-center py-2"
            activeOpacity={0.7}
        >
            {icon}
            <Text
                style={{ color: active ? '#13EC13' : '#666' }}
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
