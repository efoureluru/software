import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useCart } from '../context/CartContext';
import * as RootNavigation from '../utils/navigationRef';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const CartFloatingBar = ({ currentRoute }) => {
    const { cartItems, totalPrice } = useCart();

    const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

    // Hide if cart is empty or on specific screens
    const hiddenRoutes = ['Cart', 'Profile', 'PaymentGateway', 'RideHistory', 'RestaurantDetail', 'Visit', 'Events', 'Dining'];
    if (itemCount === 0 || hiddenRoutes.includes(currentRoute)) return null;

    return (
        <AnimatePresence>
            <MotiView
                from={{ translateY: 100, opacity: 0, scale: 0.95 }}
                animate={{ translateY: 0, opacity: 1, scale: 1 }}
                exit={{ translateY: 100, opacity: 0, scale: 0.95 }}
                transition={{
                    type: 'spring',
                    damping: 18,
                    stiffness: 120,
                }}
                style={styles.container}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => RootNavigation.navigate('Cart')}
                    style={styles.touchable}
                >
                    <BlurView intensity={40} tint="systemThickMaterialDark" style={styles.blurContainer}>
                        <View style={styles.contentContainer}>
                            <View style={styles.leftInfo}>
                                <View style={styles.iconContainer}>
                                    <ShoppingBag color="#fff" size={20} />
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{itemCount}</Text>
                                    </View>
                                </View>
                                <View style={styles.textContainer}>
                                    <View style={styles.titleRow}>
                                        <Text style={styles.itemCountText}>{itemCount === 1 ? '1 Item' : `${itemCount} Items`}</Text>
                                        <View style={styles.divider} />
                                        <Text style={styles.totalPriceText}>₹{totalPrice}</Text>
                                    </View>
                                    <Text style={styles.subText}>Extra charges may apply</Text>
                                </View>
                            </View>

                            <View style={styles.rightAction}>
                                <Text style={styles.viewCartText}>View Cart</Text>
                                <ChevronRight color="rgba(255,255,255,0.8)" size={18} />
                            </View>
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </MotiView>
        </AnimatePresence>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 110, // Positioned above the floating tab bar
        left: 16,
        right: 16,
        zIndex: 1000,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    touchable: {
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)', // Subtle glass border
        backgroundColor: 'rgba(20, 20, 20, 0.4)', // Dark tint base
    },
    blurContainer: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 28, // Matches touchable
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#32D74B', // iOS Green for success/active state
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1C1C1E', // Match dark bg
        paddingHorizontal: 3,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#000',
    },
    textContainer: {
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    itemCountText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 8,
    },
    totalPriceText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    subText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: '400',
    },
    rightAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    viewCartText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginRight: 2,
    },
});

export default CartFloatingBar;
