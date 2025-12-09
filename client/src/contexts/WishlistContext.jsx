import React, { createContext, useContext, useState } from 'react';
import { wishlistService } from '../services/api';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    const addToWishlist = async (property) => {
        try {
            await wishlistService.add(property.id);
            setWishlist(prev => [...prev, property]);
        } catch (error) {
            console.error("Failed to add to wishlist", error);
        }
    };

    const removeFromWishlist = async (propertyId) => {
        try {
            await wishlistService.remove(propertyId);
            setWishlist(prev => prev.filter(p => p.id !== propertyId));
        } catch (error) {
            console.error("Failed to remove from wishlist", error);
        }
    };

    // Fetch wishlist on mount
    React.useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await wishlistService.getAll();
                setWishlist(response.data);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        // Returing dummy object if used outside provider to prevent crash in dev
        return { wishlist: [], addToWishlist: () => { }, removeFromWishlist: () => { } };
    }
    return context;
};

export default WishlistContext;
