import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyService } from '../services/api';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await propertyService.getAll();
                setProperties(response.data);
            } catch (error) {
                console.error("Failed to fetch properties", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    // Navbar reusable component (simplified for internal pages)
    const Navbar = () => (
        <nav className="navbar scrolled">
            <div className="container nav-content">
                <Link to="/" className="logo">Luxe<span className="text-accent">Estate</span></Link>
                <div className="nav-links hidden-mobile">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/properties" className="nav-link text-accent">Residences</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/login"><button className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.5rem' }}>Login</button></Link>
                </div>
            </div>
        </nav>
    );

    return (
        <div style={{ background: 'var(--color-primary)', minHeight: '100vh', color: 'white' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)' }}>Exclusive <span className="text-accent">Collection</span></h1>
                        <p style={{ color: 'var(--color-text-light)' }}>Discover our handpicked selection of premium properties.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', background: 'var(--color-primary-light)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                ...filterBtnStyle,
                                background: filter === 'all' ? 'var(--color-accent)' : 'transparent',
                                color: filter === 'all' ? 'var(--color-primary)' : 'var(--color-text-light)'
                            }}
                        >All</button>
                        <button
                            onClick={() => setFilter('sale')}
                            style={{
                                ...filterBtnStyle,
                                background: filter === 'sale' ? 'var(--color-accent)' : 'transparent',
                                color: filter === 'sale' ? 'var(--color-primary)' : 'var(--color-text-light)'
                            }}
                        >For Sale</button>
                        <button
                            onClick={() => setFilter('rent')}
                            style={{
                                ...filterBtnStyle,
                                background: filter === 'rent' ? 'var(--color-accent)' : 'transparent',
                                color: filter === 'rent' ? 'var(--color-primary)' : 'var(--color-text-light)'
                            }}
                        >For Rent</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading properties...</div>
                ) : (
                    <motion.div
                        layout
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}
                    >
                        <AnimatePresence>
                            {properties.filter(p => filter === 'all' || p.type.toLowerCase().includes(filter)).map((prop) => (
                                <PropertyCard key={prop.id} data={prop} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const PropertyCard = ({ data }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -10 }}
        style={{ background: 'var(--color-primary-light)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'block' }}
    >
        <Link to={`/properties/${data.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
                <img src={data.image} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
                <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'rgba(212, 175, 55, 0.9)',
                    color: 'var(--color-primary)',
                    padding: '0.25rem 0.75rem',
                    fontWeight: 700, borderRadius: '2px',
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
                <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <FaMapMarkerAlt className="text-accent" /> {data.location}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBed className="text-accent" /> {data.beds} Beds</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaBath className="text-accent" /> {data.baths} Baths</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaRulerCombined className="text-accent" /> {data.sqft}</span>
                </div>
            </div>
        </Link>
    </motion.div>
);

const filterBtnStyle = {
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.3s ease'
};

export default Properties;
