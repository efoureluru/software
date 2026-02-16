import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Platform-agnostic Auth helpers
const getAuth = () => {
    if (Platform.OS === 'web') {
        return require('../config/firebase').auth;
    } else {
        return require('@react-native-firebase/auth').default();
    }
};

const getAuthModule = () => {
    if (Platform.OS === 'web') {
        return require('firebase/auth');
    } else {
        return require('@react-native-firebase/auth').default;
    }
};

// Conditionally import other native modules
let GoogleSignin;
if (Platform.OS !== 'web') {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
}

let AppleAuthentication;
if (Platform.OS !== 'web') {
    AppleAuthentication = require('expo-apple-authentication');
}

const AuthContext = createContext();
const BACKEND_URL = 'http://localhost:5001/api'; // Update for production

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState(null);

    // Initialize Google Sign-In
    useEffect(() => {
        if (Platform.OS !== 'web') {
            GoogleSignin.configure({
                webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
            });
        }
    }, []);

    // Listen for Firebase auth state changes
    useEffect(() => {
        const auth = getAuth();
        let unsubscribe;
        if (Platform.OS === 'web') {
            const { onAuthStateChanged } = getAuthModule();
            unsubscribe = onAuthStateChanged(auth, onAuthStateChangedCallback);
        } else {
            unsubscribe = auth.onAuthStateChanged(onAuthStateChangedCallback);
        }
        return unsubscribe;
    }, []);

    const onAuthStateChangedCallback = async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
            const idToken = await fbUser.getIdToken();
            await loginToBackend(idToken);
        } else {
            setUser(null);
            setIsLoading(false);
        }
    };

    const loginToBackend = async (idToken) => {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                await AsyncStorage.setItem('token', data.token);

                // If it's a new user or name is generic, we might want to redirect to Register
                // This could be handled here or in the screen where login is triggered
                return data;
            }
        } catch (error) {
            console.error('Backend Login Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        if (Platform.OS === 'web') {
            console.warn('Google Sign-In not supported on web yet');
            return;
        }
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            const auth = authModule();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            const userCredential = await auth.signInWithCredential(googleCredential);
            const idTokenResult = await userCredential.user.getIdToken();
            return await loginToBackend(idTokenResult);
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            setIsLoading(false);
        }
    };

    const loginWithApple = async () => {
        if (Platform.OS === 'web') {
            console.warn('Apple Sign-In not supported on web yet');
            return;
        }
        setIsLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const auth = authModule();
            const appleCredential = auth.AppleAuthProvider.credential(credential.identityToken);
            const userCredential = await auth.signInWithCredential(appleCredential);
            const idTokenResult = await userCredential.user.getIdToken();
            return await loginToBackend(idTokenResult);
        } catch (error) {
            console.error('Apple Sign-In Error:', error);
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const auth = getAuth();
            if (Platform.OS === 'web') {
                const { signOut } = getAuthModule();
                await signOut(auth);
            } else {
                await auth.signOut();
                await GoogleSignin.signOut();
            }
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
            setUser(null);
        } catch (e) {
            console.log('Logout Error', e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${BACKEND_URL}/users/me`, {
                method: 'PUT', // Assuming there's a PUT route for profile
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                setUser(result.user);
                await AsyncStorage.setItem('user', JSON.stringify(result.user));
            }
        } catch (e) {
            console.error('Update Profile Error', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginWithApple, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
