import React, { createContext, useState, useContext } from 'react';
import { notificationRef } from '../utils/notificationRef';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [bookings, setBookings] = useState([]);

    const addToCart = (ride) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === ride.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === ride.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
                );
            }
            notificationRef.current?.show(`${ride.title} added to cart!`, 'success');
            return [...prevItems, { ...ride, quantity: 1 }];
        });
    };

    const removeFromCart = (rideId) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === rideId);
            if (!existingItem) return prevItems;

            if (existingItem.quantity > 1) {
                return prevItems.map((item) =>
                    item.id === rideId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }

            notificationRef.current?.show(`${existingItem.title} removed from cart.`, 'info');
            return prevItems.filter((item) => item.id !== rideId);
        });
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const addBooking = (newBooking) => {
        setBookings((prevBookings) => [newBooking, ...prevBookings]);
    };

    const totalPrice = cartItems.reduce((total, item) => {
        // Remove non-numeric characters from price string (e.g., "$10" -> 10)
        const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        return total + price * (item.quantity || 1);
    }, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice, bookings, addBooking }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
