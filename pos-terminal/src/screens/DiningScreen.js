import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { User, Utensils } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { DINING_DATA } from '../components/DiningData';
import PageFooter from '../components/PageFooter';
import ComingSoonModal from '../components/ComingSoonModal';

const { width } = Dimensions.get('window');
const COLUMN_count = 2;
const GAP = 15;
const PADDING = 20;

const DiningScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const handleRestaurantPress = (restaurant) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedRestaurant(restaurant);
        setModalVisible(true);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <BlurView intensity={80} tint="light" style={styles.infoBannerBlur}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.7)', 'rgba(249,249,249,0.5)']}
                        style={styles.infoBannerGradient}
                    >
                        <View style={styles.infoIconContainer}>
                            <Utensils size={20} color="#FF9500" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Bookings will open shortly</Text>
                            <Text style={styles.infoSubtitle}>We’re preparing something delicious for you at ETHREE.</Text>
                        </View>
                    </LinearGradient>
                </BlurView>
            </View>

            <Text style={styles.sectionTitle}>Browse Restaurants</Text>
        </View>
    );

    const renderRestaurantCard = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => handleRestaurantPress(item)}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>Menu Preview</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                {/* Custom Header */}
                <View style={styles.topHeader}>
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/LOGO.jpeg')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.headerTitle}>Dining</Text>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {user?.avatar ? (
                            <Image
                                source={{ uri: user.avatar }}
                                style={{ width: '100%', height: '100%', borderRadius: 20 }}
                            />
                        ) : (
                            <User size={20} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={DINING_DATA}
                    renderItem={renderRestaurantCard}
                    keyExtractor={(item) => item.id}
                    numColumns={COLUMN_count}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={PageFooter}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <ComingSoonModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                restaurantName={selectedRestaurant?.name}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        // borderBottomWidth: 1,
        // borderBottomColor: '#f0f0f0',
        zIndex: 10,
    },
    logoContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logo: {
        width: 75,
        height: 35,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 0.5,
    },
    profileButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F2F2F7',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        paddingHorizontal: PADDING,
        paddingTop: 20,
        paddingBottom: 10,
    },
    infoBanner: {
        marginBottom: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        backgroundColor: '#fff',
    },
    infoBannerBlur: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    infoBannerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF8E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#000',
        marginBottom: 10,
    },
    listContent: {
        paddingBottom: 100, // Space for footer/tab bar
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: PADDING,
        marginBottom: 20,
    },
    card: {
        width: (width - (PADDING * 2) - GAP) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 5, // Extra spacing handled by marginBottom in columnWrapper mostly
    },
    imageContainer: {
        height: 140, // Square-ish or 4:3
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
});

export default DiningScreen;
