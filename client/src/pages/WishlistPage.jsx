import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wishlistService } from '../services/api';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import NotesEditor from '../components/NotesEditor';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await wishlistService.getAll();
                // Handle both response structures
                const data = response.data?.data || response.data || [];
                setWishlist(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (propertyId) => {
        try {
            await wishlistService.remove(propertyId);
            setWishlist(wishlist.filter(item => {
                const itemPropertyId = item.property?._id || item.property;
                return itemPropertyId !== propertyId;
            }));
        } catch (error) {
            console.error("Failed to remove item", error);
            alert("Failed to remove from wishlist");
        }
    };

    const handleNotesUpdate = async (propertyId, notes) => {
        try {
            await wishlistService.updateNotes(propertyId, notes);
        } catch (error) {
            console.error("Failed to update notes", error);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-primary)' }}>
            <Sidebar />
            <div style={{ flex: 1, padding: '3rem', color: 'white' }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Your <span className="text-accent">Wishlist</span></h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading wishlist...</div>
                ) : wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>
                        <p style={{ marginBottom: '1rem' }}>Your wishlist is empty.</p>
                        <Link to="/search" className="btn btn-primary">Browse Properties</Link>
                    </div>
                ) : (
                    <motion.div
                        layout
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}
                    >
                        <AnimatePresence>
                            {wishlist.map((item) => {
                                // Handle both populated and unpopulated property references
                                const prop = item.property || item;
                                const propertyId = prop._id || prop;
                                const notes = item.notes || '';

                                return (
                                    <div key={propertyId} style={{ position: 'relative' }}>
                                        <PropertyCard data={prop} />
                                        {/* Enhanced Personal Notes Feature */}
                                        <NotesEditor
                                            propertyId={propertyId}
                                            initialNotes={notes}
                                            onUpdate={handleNotesUpdate}
                                        />
                                        <button
                                            onClick={() => removeFromWishlist(propertyId)}
                                            style={{
                                                position: 'absolute', top: '1rem', left: '1rem',
                                                background: 'rgba(0,0,0,0.6)', color: 'var(--color-error)',
                                                border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                zIndex: 10
                                            }}
                                            title="Remove from Wishlist"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Property Card component
const PropertyCard = ({ data }) => {
    // Handle missing data gracefully
    if (!data || typeof data !== 'object') {
        return null;
    }

    const imageUrl = data.image || (data.images && data.images[0]) || 'https://via.placeholder.com/400x250?text=No+Image';
    const title = data.title || 'Untitled Property';
    const price = data.listingType === 'sell'
        ? `$${(data.currentPrice || data.startingPrice || data.price)?.toLocaleString() || 'N/A'}`
        : `$${data.price?.toLocaleString() || 'N/A'}/mo`;
    const location = data.location || (data.address && `${data.address.city || ''}`) || 'Location N/A';
    const type = data.type || data.listingType || 'Property';
    const propertyId = data._id || data.propertyId || data.id;

    return (
        <motion.div
            layout
            whileHover={{ y: -10 }}
            style={{ background: 'var(--color-primary-light)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'block' }}
        >
            <Link to={`/properties/${propertyId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                    <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'rgba(212, 175, 55, 0.9)',
                        color: 'var(--color-primary)',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem', textTransform: 'uppercase'
                    }}>
                        {type}
                    </div>
                </div>
                <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>{title}</h3>
                        <div style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.9rem' }}>{price}</div>
                    </div>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FaMapMarkerAlt className="text-accent" size={12} /> {location}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-text-main)', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaBed size={12} /> {data.beds || 0}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaBath size={12} /> {data.baths || 0}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FaRulerCombined size={12} /> {data.sqft || 'N/A'}</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default WishlistPage;
