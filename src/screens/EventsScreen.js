import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
    Image,
    Modal,
    Dimensions,
    Platform,
    FlatList
} from 'react-native';
import { ChevronRight, PartyPopper, Briefcase, Music, Utensils, Heart, Baby, ArrowRight, X } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import PageFooter from '../components/PageFooter';

const { width, height } = Dimensions.get('window');

// Data for Event Types
const EVENT_TYPES = [
    {
        id: '1',
        title: 'Birthday Party',
        subtitle: 'Celebrate another year',
        icon: PartyPopper,
        image: require('../../assets/events/birthday_party.png'),
        color: '#FFEBEE',
        accent: '#E53935'
    },
    {
        id: '2',
        title: 'Corporate Meetup',
        subtitle: 'Professional gatherings',
        icon: Briefcase,
        image: require('../../assets/events/corporate_event.png'),
        color: '#E3F2FD',
        accent: '#1E88E5'
    },
    {
        id: '3',
        title: 'Live Music Night',
        subtitle: 'Vibes & Melodies',
        icon: Music,
        image: require('../../assets/events/live_music_night.png'),
        color: '#F3E5F5',
        accent: '#8E24AA'
    },
    {
        id: '4',
        title: 'Private Dining',
        subtitle: 'Exclusive culinary experience',
        icon: Utensils,
        image: require('../../assets/events/private_dining.png'),
        color: '#E0F2F1',
        accent: '#00897B'
    },
    {
        id: '5',
        title: 'Anniversary',
        subtitle: 'Milestones & Memories',
        icon: Heart,
        image: require('../../assets/events/anniversary_celebration.png'),
        color: '#FCE4EC',
        accent: '#D81B60'
    },
    {
        id: '6',
        title: 'Kids Party',
        subtitle: 'Fun & Games',
        icon: Baby,
        image: require('../../assets/events/kids_party.png'),
        color: '#FFF3E0',
        accent: '#FB8C00'
    },
];

const EventsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventPress = (event) => {
        setSelectedEvent(event);
        setModalVisible(true);
    };

    const renderEventCard = ({ item }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            activeOpacity={0.9}
            onPress={() => handleEventPress(item)}
        >
            <View style={styles.cardInner}>
                {/* Image Background Area */}
                <View style={[styles.imageContainer, { backgroundColor: item.color }]}>
                    <Image
                        source={item.image}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                    {/* Overlaying icon slightly for branding/iconography consistency if desired, or removing it. Keeping it subtle. */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' }]}>
                        <item.icon size={24} color="#fff" style={{ shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }} />
                    </View>
                </View>

                {/* Content Area */}
                <View style={styles.cardContent}>
                    <View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                    </View>
                    <View style={styles.exploreRow}>
                        <Text style={[styles.exploreText, { color: item.accent }]}>Explore</Text>
                        <ArrowRight size={14} color={item.accent} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image
                        source={require('../../assets/LOGO.jpeg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Events</Text>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                    {user?.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={{ width: '100%', height: '100%', borderRadius: 20 }}
                        />
                    ) : (
                        <View style={styles.profilePlaceholder} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Page Intro */}
            <View style={styles.introSection}>
                <Text style={styles.introTitle}>Celebrate at ETHREE</Text>
                <Text style={styles.introSubtitle}>Plan your next memorable moment with us.</Text>
            </View>

            {/* Grid */}
            <FlatList
                data={EVENT_TYPES}
                keyExtractor={(item) => item.id}
                renderItem={renderEventCard}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={PageFooter}
            />

            {/* Coming Soon Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            {selectedEvent && (
                                <selectedEvent.icon size={40} color={selectedEvent.accent} />
                            )}
                        </View>
                        <Text style={styles.modalTitle}>Coming Soon</Text>
                        <Text style={styles.modalText}>
                            We’re preparing something special for {selectedEvent?.title} at ETHREE.
                        </Text>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: '#000' }]}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('Placeholder', {
                                    title: selectedEvent?.title,
                                    description: `We'll notify you when ${selectedEvent?.title} bookings open!`
                                });
                            }}
                        >
                            <Text style={styles.modalButtonText}>Notify Me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButtonTextWrapper}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: Platform.OS === 'android' ? 10 : 0,
    },
    logo: {
        width: 75,
        height: 35,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    profileButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    introSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    introTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    introSubtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 100,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: (width - 45) / 2, // 2 columns with padding
        marginBottom: 15,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    cardInner: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    imageContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
    },
    exploreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    exploreText: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    modalButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButtonTextWrapper: {
        padding: 10,
    },
    closeButtonText: {
        color: '#999',
        fontSize: 15,
        fontWeight: '500',
    }
});

export default EventsScreen;

