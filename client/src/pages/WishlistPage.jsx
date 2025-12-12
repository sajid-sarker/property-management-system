import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wishlistService } from '../services/api'; // Ensure this is exported in api.js
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await wishlistService.getAll();
                setWishlist(response.data);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (id) => {
        try {
            await wishlistService.remove(id);
            setWishlist(wishlist.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    // Navbar reusable component
    const Navbar = () => (
        <nav className="navbar scrolled">
            <div className="container nav-content">
                <Link to="/" className="logo">Luxe<span className="text-accent">Estate</span></Link>
                <div className="nav-links hidden-mobile">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/properties" className="nav-link">Residences</Link>
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </div>
            </div>
        </nav>
    );

    return (
        <div style={{ background: 'var(--color-primary)', minHeight: '100vh', color: 'white' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Your <span className="text-accent">Wishlist</span></h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading wishlist...</div>
                ) : wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Your wishlist is empty.</div>
                ) : (
                    <motion.div
                        layout
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}
                    >
                        <AnimatePresence>
                            {wishlist.map((prop) => (
                                <div key={prop.id} style={{ position: 'relative' }}>
                                    <PropertyCard data={prop} />
                                    {/* Personal Notes Feature (Req 2, Feat 4) */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <textarea
                                            placeholder="Add personal notes..."
                                            style={{
                                                width: '100%',
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '4px',
                                                color: 'var(--color-text-light)',
                                                padding: '0.5rem',
                                                fontSize: '0.85rem',
                                                fontFamily: 'var(--font-body)',
                                                resize: 'vertical',
                                                minHeight: '60px'
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromWishlist(prop.id)}
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
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Reusing PropertyCard simplified
const PropertyCard = ({ data }) => (
    <motion.div
        layout
        whileHover={{ y: -10 }}
        style={{ background: 'var(--color-primary-light)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'block' }}
    >
        <Link to={`/properties/${data.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: '250px', overflow: 'hidden', position: 'relative' }}>
                <img src={data.image} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'rgba(212, 175, 55, 0.9)',
                    color: 'var(--color-primary)',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.8rem', textTransform: 'uppercase'
                }}>
                    {data.type}
                </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>{data.title}</h3>
                    <div style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{data.price}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaMapMarkerAlt className="text-accent" /> {data.location}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBed /> {data.beds}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBath /> {data.baths}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaRulerCombined /> {data.sqft}</span>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default WishlistPage;
