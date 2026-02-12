import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CryptoJS from 'crypto-js';

// IMPORTANT: Replace these with your actual Easebuzz credentials
const MERCHANT_KEY = "PLEASE_REPLACE_WITH_MERCHANT_KEY";
const SALT = "PLEASE_REPLACE_WITH_SALT";
const ENV = "test"; // Use "prod" for production

const PaymentGatewayScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const webViewRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [paymentUrl, setPaymentUrl] = useState(null);

    const { amount, firstname, email, phone, productinfo, txnid } = route.params || {};

    useEffect(() => {
        generatePaymentUrl();
    }, []);

    const generatePaymentUrl = () => {
        // Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt
        const hashString = `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${SALT}`;
        const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);

        const baseUrl = ENV === "test" ? "https://testpay.easebuzz.in/payment/initiate" : "https://pay.easebuzz.in/payment/initiate";

        // Create form data for the POST request
        const formData = {
            key: MERCHANT_KEY,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
            phone,
            surl: "https://success.url", // Placeholder success URL
            furl: "https://failure.url", // Placeholder failure URL
            hash,
        };

        // Construct HTML to auto-submit the form to Easebuzz
        const formHtml = `
            <html>
                <body onload="document.forms[0].submit()">
                    <form method="post" action="${baseUrl}">
                        ${Object.keys(formData).map(key => `<input type="hidden" name="${key}" value="${formData[key]}" />`).join('')}
                    </form>
                </body>
            </html>
        `;

        setPaymentUrl({ html: formHtml });
    };

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;

        if (url.includes("success.url")) {
            // Payment Success
            alert("Payment Successful!");
            navigation.navigate("MainTabs");
        } else if (url.includes("failure.url")) {
            // Payment Failed
            alert("Payment Failed. Please try again.");
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#000" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Easebuzz Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.webviewContainer}>
                {paymentUrl && (
                    <WebView
                        ref={webViewRef}
                        source={paymentUrl}
                        onNavigationStateChange={handleNavigationStateChange}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                    />
                )}
                {loading && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#FEC105" />
                        <Text style={styles.loaderText}>Initializing Payment...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    webviewContainer: {
        flex: 1,
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

export default PaymentGatewayScreen;
