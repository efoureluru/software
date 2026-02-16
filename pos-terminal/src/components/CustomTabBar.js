import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { Home, UtensilsCrossed, Calendar, PhoneCall, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Tab Configuration - easier to manage
const TABS = [
    { name: 'Home', icon: Home, label: 'Home' },
    { name: 'Dining', icon: UtensilsCrossed, label: 'Dining' },
    { name: 'Events', icon: Calendar, label: 'Events' },
    { name: 'Visit', icon: PhoneCall, label: 'Visit' },
    { name: 'Profile', icon: User, label: 'Profile' } // Added Profile directly to tabs for easier access if desired, or keep logic in App.js
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    // Calculate tab width based on number of routes
    const TAB_WIDTH = width / state.routes.length;

    // Shared value for the active indicator position
    const indicatorPosition = useSharedValue(0);

    useEffect(() => {
        // Update indicator position when tab changes
        indicatorPosition.value = withSpring(state.index * TAB_WIDTH, {
            damping: 15,
            stiffness: 150,
        });
    }, [state.index, TAB_WIDTH]);

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: indicatorPosition.value }],
        };
    });

    return (
        <View style={[styles.container, { bottom: 0 }]}>
            <View style={styles.outerShadow}>
                <BlurView
                    intensity={80}
                    tint="light"
                    style={[
                        styles.blurContainer,
                        {
                            height: Platform.OS === 'ios' ? 85 + (insets.bottom > 20 ? 0 : 10) : 70 + insets.bottom,
                            paddingBottom: insets.bottom
                        }
                    ]}
                >
                    {/* Active Indicator */}
                    <Animated.View style={[styles.indicatorContainer, { width: TAB_WIDTH }, indicatorStyle]}>
                        <View style={styles.indicator} />
                    </Animated.View>

                    {/* Tab Items */}
                    <View style={styles.tabsContainer}>
                        {state.routes.map((route, index) => {
                            const { options } = descriptors[route.key];
                            const isFocused = state.index === index;

                            const onPress = () => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            };

                            const onLongPress = () => {
                                navigation.emit({
                                    type: 'tabLongPress',
                                    target: route.key,
                                });
                            };

                            let IconComponent;
                            // Map route names to icons
                            if (route.name === 'Home') IconComponent = Home;
                            else if (route.name === 'Dining') IconComponent = UtensilsCrossed;
                            else if (route.name === 'Events') IconComponent = Calendar;
                            else if (route.name === 'Visit') IconComponent = PhoneCall;
                            else if (route.name === 'Profile') IconComponent = User; // Ensure Profile is handled if added to main tabs

                            if (!IconComponent) return null;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    accessibilityLabel={options.tabBarAccessibilityLabel}
                                    testID={options.tabBarTestID}
                                    onPress={onPress}
                                    onLongPress={onLongPress}
                                    style={styles.tabItem}
                                    activeOpacity={0.7}
                                >
                                    <MotiView
                                        animate={{
                                            scale: isFocused ? 1.1 : 1,
                                            translateY: isFocused ? -2 : 0
                                        }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                                        style={styles.iconContainer}
                                    >
                                        <IconComponent
                                            color={isFocused ? '#000' : '#8E8E93'}
                                            size={24}
                                            strokeWidth={isFocused ? 2.5 : 2}
                                        />
                                        {isFocused && (
                                            <MotiView
                                                from={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                style={styles.activeDot}
                                            />
                                        )}
                                    </MotiView>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </BlurView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000, // High z-index to float above content
    },
    outerShadow: {
        width: width,
    },
    blurContainer: {
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.3)',
    },
    tabsContainer: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        justifyContent: 'space-between',
    },
    indicatorContainer: {
        position: 'absolute',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    indicator: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#000',
        position: 'absolute',
        bottom: -6,
    }
});

export default CustomTabBar;
