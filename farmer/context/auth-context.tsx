import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    onboardingComplete: boolean;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (token: string, user: User, onboardingComplete: boolean) => Promise<void>;
    register: (token: string, user: User, onboardingComplete: boolean) => Promise<void>;
    logout: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ageis_auth_data';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        token: null,
        user: null,
        onboardingComplete: false,
        isLoading: true,
    });

    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        loadStorageData();
    }, []);

    useEffect(() => {
        if (state.isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding' || segments[0] === 'create-wallet';

        if (!state.token && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (state.token && !state.onboardingComplete) {
            // Redirect to onboarding if authenticated but not complete
            if (!inOnboarding) {
                router.replace('/onboarding');
            }
        } else if (state.token && state.onboardingComplete) {
            // Redirect to home if authenticated and onboarding complete
            if (inAuthGroup || inOnboarding) {
                router.replace('/(tabs)/navigation');
            }
        }
    }, [state.token, state.onboardingComplete, state.isLoading, segments]);

    const loadStorageData = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                setState({
                    token: parsed.token,
                    user: parsed.user,
                    onboardingComplete: parsed.onboardingComplete || false,
                    isLoading: false,
                });
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const login = async (token: string, user: User, onboardingComplete: boolean) => {
        const data = { token, user, onboardingComplete };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setState({
            token,
            user,
            onboardingComplete,
            isLoading: false,
        });
    };

    const register = async (token: string, user: User, onboardingComplete: boolean) => {
        await login(token, user, onboardingComplete);
    };

    const logout = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setState({
            token: null,
            user: null,
            onboardingComplete: false,
            isLoading: false,
        });
    };

    const completeOnboarding = async () => {
        if (!state.user || !state.token) return;

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL;
            const response = await fetch(`${API_URL}/api/farmer/auth/onboarding/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({ farmerId: state.user.id }),
            });

            if (response.ok) {
                const newState = { ...state, onboardingComplete: true };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
                setState(newState);
            } else {
                console.error('Failed to update onboarding status on server');
            }
        } catch (e) {
            console.error('Failed to complete onboarding', e);
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
