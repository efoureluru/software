import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ArrowRight } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute();
    const { loginWithGoogle, loginWithApple, isLoading } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [otp, setOtp] = useState('');
    const [confirm, setConfirm] = useState(null);

    const handleSendOtp = async () => {
        if (phoneNumber.length === 10) {
            try {
                const confirmation = await auth().signInWithPhoneNumber(`+91${phoneNumber}`);
                setConfirm(confirmation);
                setStep(2);
            } catch (error) {
                console.error('Phone Auth Error', error);
                alert("Failed to send OTP. Please try again.");
            }
        } else {
            alert("Please enter a valid 10-digit mobile number");
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length === 6) {
            try {
                await confirm.confirm(otp);
                // AuthContext listener will handle the backend login, 
                // but we need to check if we should redirect to Register
                // Since onAuthStateChanged is async, we might need a small delay or check here
                setTimeout(() => {
                    // This is a bit simplified; better to handle in onAuthStateChanged or a global listener
                    navigation.replace('MainTabs');
                }, 1000);
            } catch (error) {
                alert("Invalid OTP");
            }
        } else {
            alert("Please enter a valid 6-digit OTP");
        }
    };

    const handleGoogleLogin = async () => {
        const result = await loginWithGoogle();
        handleLoginResult(result);
    };

    const handleAppleLogin = async () => {
        const result = await loginWithApple();
        handleLoginResult(result);
    };

    const handleLoginResult = (result) => {
        if (result && result.isNewUser) {
            navigation.replace('Register');
        } else {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.replace('MainTabs');
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.content}
                >
                    {/* Header */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color="#000" size={28} />
                    </TouchableOpacity>

                    <View style={styles.mainSection}>
                        <Image source={require('../../assets/LOGO.jpeg')} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.title}>
                            {step === 1 ? "Welcome to ETHREE" : "Verify Details"}
                        </Text>
                        <Text style={styles.subtitle}>
                            {step === 1
                                ? "Enter your mobile number to continue"
                                : `Enter the 4-digit code sent to +91 ${phoneNumber}\n(Demo OTP: 1234)`
                            }
                        </Text>

                        {step === 1 ? (
                            <View style={styles.inputContainer}>
                                <Text style={styles.prefix}>+91</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter Mobile Number"
                                    placeholderTextColor="#999"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    autoFocus
                                />
                            </View>
                        ) : (
                            <View style={styles.otpContainer}>
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="• • • •"
                                    placeholderTextColor="#ccc"
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    value={otp}
                                    onChangeText={setOtp}
                                    autoFocus
                                    textAlign="center"
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                ((step === 1 && phoneNumber.length !== 10) || (step === 2 && otp.length !== 6)) && styles.disabledButton
                            ]}
                            onPress={step === 1 ? handleSendOtp : handleVerifyOtp}
                            disabled={isLoading || (step === 1 && phoneNumber.length !== 10) || (step === 2 && otp.length !== 6)}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>
                                        {step === 1 ? "Get OTP" : "Verify & Login"}
                                    </Text>
                                    <ArrowRight color="#fff" size={20} style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {step === 1 && (
                            <>
                                <View style={styles.divider}>
                                    <View style={styles.line} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.line} />
                                </View>

                                <TouchableOpacity
                                    style={styles.googleButton}
                                    onPress={handleGoogleLogin}
                                    disabled={isLoading}
                                >
                                    <Image
                                        source={{ uri: 'https://authjs.dev/img/providers/google.svg' }}
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                                </TouchableOpacity>

                                {Platform.OS === 'ios' && (
                                    <View style={styles.appleButtonContainer}>
                                        <AppleAuthentication.AppleAuthenticationButton
                                            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                                            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                            cornerRadius={16}
                                            style={styles.appleButton}
                                            onPress={handleAppleLogin}
                                        />
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    <Text style={styles.termsText}>
                        By continuing, you agree to our Terms of Service & Privacy Policy.
                    </Text>

                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    mainSection: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 100,
    },
    logo: {
        width: 140,
        height: 70,
        marginBottom: 32,
        alignSelf: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 12,
        marginBottom: 32,
    },
    prefix: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        letterSpacing: 1,
    },
    otpContainer: {
        marginBottom: 32,
    },
    otpInput: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        letterSpacing: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 12,
    },
    button: {
        backgroundColor: '#000',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resendLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
    },
    termsText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#eee',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    appleButtonContainer: {
        marginTop: 12,
        height: 56,
        width: '100%',
    },
    appleButton: {
        flex: 1,
    },
});

export default LoginScreen;
