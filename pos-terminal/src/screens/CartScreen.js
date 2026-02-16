import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Trash2, ShoppingBag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const CartScreen = () => {
    const { cartItems, removeFromCart, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [selectedPayment, setSelectedPayment] = React.useState(null);

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={item.imageSource} style={styles.itemImage} resizeMode="cover" />
            <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
                <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                    <Text style={styles.itemQuantity}>x {item.quantity}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Trash2 color="#ff4444" size={20} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#000" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detailed Cart</Text>
                <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
                    <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ShoppingBag color="#ddd" size={100} />
                    <Text style={styles.emptyTitle}>Your cart is empty</Text>
                    <Text style={styles.emptySubtitle}>Looks like limited items here.</Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => navigation.navigate('MainTabs')}
                    >
                        <Text style={styles.browseButtonText}>Browse Rides</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListFooterComponent={() => (
                            <View style={styles.paymentSection}>
                                <Text style={styles.paymentTitle}>Select Payment Method</Text>
                                <View style={styles.paymentOptions}>
                                    {['UPI', 'Credit/Debit Card', 'Net Banking'].map((method) => (
                                        <TouchableOpacity
                                            key={method}
                                            style={[
                                                styles.paymentOption,
                                                selectedPayment === method && styles.selectedPayment
                                            ]}
                                            onPress={() => setSelectedPayment(method)}
                                        >
                                            <View style={[
                                                styles.radio,
                                                selectedPayment === method && styles.radioSelected
                                            ]} />
                                            <Text style={[
                                                styles.paymentText,
                                                selectedPayment === method && styles.selectedPaymentText
                                            ]}>{method}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    />
                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <View>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.methodLabel}>{selectedPayment || 'Select a method'}</Text>
                            </View>
                            <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutButton, !selectedPayment && styles.disabledButton]}
                            onPress={() => {
                                if (!user) {
                                    navigation.navigate('Login');
                                    return;
                                }

                                if (!selectedPayment) return;

                                // Mock data for Easebuzz
                                const txnid = `TXN${Date.now()}`;
                                const orderData = {
                                    amount: totalPrice.toFixed(2),
                                    firstname: user.name || "Customer",
                                    email: user.email || "customer@example.com",
                                    phone: user.phone || "9999999999",
                                    productinfo: "Cart Checkout",
                                    txnid: txnid,
                                };

                                navigation.navigate('Payment', orderData);
                            }}
                            disabled={!selectedPayment && !!user}
                        >
                            <Text style={styles.checkoutButtonText}>
                                {!user ? 'Login to Checkout' : (selectedPayment ? `Pay ₹${totalPrice.toFixed(2)}` : 'Select Payment Method')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
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
        backgroundColor: '#fff',
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
    clearButton: {
        padding: 8,
    },
    clearText: {
        color: '#ff4444',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    itemUnit: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    itemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    removeButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
    browseButton: {
        backgroundColor: '#FEC105',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 30,
    },
    browseButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    checkoutButton: {
        backgroundColor: '#000',
        borderRadius: 12,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    paymentOptions: {
        gap: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    selectedPayment: {
        backgroundColor: '#fff',
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        marginRight: 12,
    },
    radioSelected: {
        borderColor: '#000',
        backgroundColor: '#000',
        borderWidth: 5,
    },
    paymentText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    selectedPaymentText: {
        color: '#000',
        fontWeight: '700',
    },
    methodLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

export default CartScreen;
