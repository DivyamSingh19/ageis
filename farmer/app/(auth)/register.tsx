import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        // TODO: Wire up to your registration logic / API.
    };

    return (
        <View className="flex-1 bg-black">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View className="flex-1 justify-center px-6 py-10">
                        {/* Subtle glow background */}
                        <View className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-emerald-500/20 blur-2xl" />

                        {/* Logo + heading */}
                        <View className="items-center mb-10">
                            <View className="w-10 h-10 mb-4 items-center justify-center rounded-full border border-emerald-400">
                                <Text className="text-2xl font-semibold text-emerald-400">a</Text>
                            </View>
                            <Text className="text-3xl font-semibold text-emerald-400">Sign Up</Text>
                        </View>

                        {/* Card */}
                        <View className="bg-neutral-900/90 rounded-3xl p-6 border border-neutral-800">
                            {/* Name */}
                            <View className="mb-4">
                                <Text className="text-neutral-400 text-xs mb-1">Name</Text>
                                <TextInput
                                    className="h-11 px-3 rounded-xl bg-neutral-800 text-white text-sm"
                                    placeholder="eg. Jane Doe"
                                    placeholderTextColor="#6b7280"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Email */}
                            <View className="mb-4">
                                <Text className="text-neutral-400 text-xs mb-1">Email</Text>
                                <TextInput
                                    className="h-11 px-3 rounded-xl bg-neutral-800 text-white text-sm"
                                    placeholder="eg. janedoe@gmail.com"
                                    placeholderTextColor="#6b7280"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Password */}
                            <View className="mb-2">
                                <Text className="text-neutral-400 text-xs mb-1">Password</Text>
                                <TextInput
                                    className="h-11 px-3 rounded-xl bg-neutral-800 text-white text-sm"
                                    placeholder="Must be at least 8 characters"
                                    placeholderTextColor="#6b7280"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                />
                            </View>

                            <Text className="text-[10px] text-neutral-500 mb-4">
                                Must be at least 8 characters
                            </Text>

                            {/* Primary CTA */}
                            <TouchableOpacity
                                className="h-12 rounded-full bg-emerald-500 items-center justify-center mt-2 shadow-lg shadow-emerald-500/40"
                                activeOpacity={0.9}
                                onPress={handleRegister}
                            >
                                <Text className="text-black font-semibold text-sm">Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer: already have account */}
                        <View className="flex-row justify-center mt-6">
                            <Text className="text-neutral-500 text-xs">
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text className="text-emerald-400 text-xs font-semibold">
                                    Log in
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
