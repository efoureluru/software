import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Copy } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const OFFERS = [
    { id: '1', code: 'ETHREE10', title: '10% OFF via App', description: 'Get 10% instant discount on all food & ride bookings.', color: ['#FF9500', '#FF2D55'] },
    { id: '2', code: 'NEWUSER', title: 'Welcome Bonus', description: 'Flat ₹50 cashback on your first booking of ₹200 or more.', color: ['#5856D6', '#007AFF'] },
    { id: '3', code: 'PARTY20', title: 'Group Booking Special', description: '20% OFF on booking 5 or more tickets for any event.', color: ['#34C759', '#30B0C7'] },
];

const OffersScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <LinearGradient
                colors={item.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.cardContent}>
                    <Text style={styles.offerTitle}>{item.title}</Text>
                    <Text style={styles.offerDesc}>{item.description}</Text>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>CODE:</Text>
                        <Text style={styles.codeText}>{item.code}</Text>
                        <Copy size={14} color="#000" style={{ marginLeft: 8 }} />
                    </View>
                </View>
                <View style={styles.circleCutoutLeft} />
                <View style={styles.circleCutoutRight} />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#000" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Offers & Rewards</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={OFFERS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    gradient: {
        borderRadius: 16,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    cardContent: {
        zIndex: 1,
    },
    offerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    offerDesc: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 20,
        lineHeight: 20,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    codeLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: 'bold',
        marginRight: 6,
    },
    codeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 1,
    },
    circleCutoutLeft: {
        position: 'absolute',
        left: -15,
        top: '50%',
        marginTop: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#fff',
    },
    circleCutoutRight: {
        position: 'absolute',
        right: -15,
        top: '50%',
        marginTop: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#fff',
    },
});

export default OffersScreen;
