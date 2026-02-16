import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    TextInput,
} from 'react-native';
import { Search, Plus, MapPin, User, Mic, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { RIDE_DATA } from '../components/RideData';
import { MotiView } from 'moti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import RideActionButton from '../components/RideActionButton';
import PageFooter from '../components/PageFooter';

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
// Switch to 2 columns to fit the new action buttons
const COLUMN_COUNT = 3;
const CARD_WIDTH = (width - (PADDING * 2) - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;
const HEADER_HEIGHT = 350;

const HomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const scrollY = useSharedValue(0);

    const filteredRides = RIDE_DATA.filter((ride) =>
        ride.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const headerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [100, 200],
            [0, 1],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [0, 100],
            [20, 0],
            Extrapolation.CLAMP
        );
        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    // Image scaling animation
    const heroMediaStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY.value,
            [-300, 0],
            [1.5, 1],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            scrollY.value,
            [-300, 0],
            [-50, 0],
            Extrapolation.CLAMP
        );
        return {
            transform: [
                { scale },
                { translateY }
            ]
        };
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Sticky Collapsible Header */}
            <Animated.View style={[styles.stickyHeader, headerStyle, { paddingTop: insets.top, height: insets.top + 60 }]}>
                <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.stickyHeaderContent}>
                    <Text style={styles.stickyHeaderTitle}>ETHREE</Text>
                </View>
            </Animated.View>

            {/* Float Absolute Header Elements */}
            <View style={[styles.topControls, { top: insets.top }]}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/LOGO.jpeg')} style={styles.logo} resizeMode="contain" />
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                    {user?.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={{ width: '100%', height: '100%', borderRadius: 20 }}
                        />
                    ) : (
                        <User size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Immersive Hero Section */}
                <View style={styles.heroContainer}>
                    <Animated.Image
                        source={require('../../assets/e3.jpeg')}
                        style={[styles.heroImage, heroMediaStyle]}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                        style={styles.heroGradient}
                    >
                        <Text style={styles.appTitle}>ETHREE</Text>
                        <Text style={styles.appTagline}>Eat • Enjoy • Entertain</Text>
                    </LinearGradient>
                </View>

                <View style={styles.contentContainer}>
                    {/* Floating Search Bar */}
                    <View style={styles.searchContainer}>
                        <BlurView intensity={100} tint="light" style={styles.searchBlur}>
                            <Search color="#8E8E93" size={18} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search rides..."
                                placeholderTextColor="#8E8E93"
                                value={searchQuery}
                                onChangeText={(text) => {
                                    if (text.length > 0 && searchQuery.length === 0) {
                                        Haptics.selectionAsync();
                                    }
                                    setSearchQuery(text);
                                }}
                            />
                            <Mic color="#8E8E93" size={18} />
                        </BlurView>
                    </View>



                    {/* Section Header */}
                    <Text style={styles.sectionTitle}>Available Rides</Text>

                    {/* 3-Column Grid */}
                    <View style={[styles.grid, { gap: GAP }]}>
                        {filteredRides.map((ride, index) => (
                            <MotiView
                                key={ride.id}
                                from={{ opacity: 0, translateY: 20 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ delay: index * 50 }}
                            >
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        addToCart(ride);
                                    }}
                                    onLongPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    }}
                                    delayLongPress={200}
                                >
                                    <View style={styles.cardImageContainer}>
                                        <Image
                                            source={ride.imageSource}
                                            style={styles.cardImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.durationBadge}>
                                            <Text style={styles.durationText}>{ride.time || '12m'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>{ride.title}</Text>

                                        <View style={styles.cardFooter}>
                                            <Text style={styles.price}>{ride.price || '₹100'}</Text>
                                        </View>

                                        <View style={styles.actionRow}>
                                            <RideActionButton ride={ride} />
                                            <TouchableOpacity
                                                style={styles.bookNowButton}
                                                onPress={() => {
                                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                    addToCart(ride);
                                                    navigation.navigate('Cart');
                                                }}
                                            >
                                                <Zap size={14} color="#000" fill="#000" />
                                                <Text style={styles.bookNowText}>BOOK</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </MotiView>
                        ))}
                    </View>

                    <PageFooter />
                </View>
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyHeaderContent: {
        position: 'absolute',
        bottom: 15,
    },
    stickyHeaderTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    topControls: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 102,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
    },
    logoContainer: {
        backgroundColor: 'transparent',
    },
    logo: {
        width: 75,
        height: 35,
        backgroundColor: 'transparent',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroContainer: {
        height: HEADER_HEIGHT,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        justifyContent: 'flex-end',
        padding: 24,
        paddingBottom: 60,
    },
    appTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
    },
    appTagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        letterSpacing: 1,
    },
    contentContainer: {
        backgroundColor: '#000',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -30,
        paddingTop: 30,
        paddingBottom: 20,
        minHeight: 800,
    },
    searchContainer: {
        paddingHorizontal: PADDING,
        marginBottom: 20,
        marginTop: -55,
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: PADDING,
        marginBottom: 24,
    },
    quickActionButton: {
        alignItems: 'center',
        width: (width - (PADDING * 2)) / 4,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    actionImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    searchBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.9)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        marginRight: 8,
        fontSize: 14,
        color: '#000',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: PADDING,
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: PADDING,
    },
    card: {
        width: CARD_WIDTH,
        marginBottom: 16,
    },
    cardImageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        backgroundColor: '#222',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    durationBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '700',
    },
    cardContent: {
        paddingHorizontal: 2,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    price: {
        color: '#FEC105',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
        gap: 4,
    },
    bookNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEC105',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 6,
        gap: 2,
    },
    bookNowText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default HomeScreen;
