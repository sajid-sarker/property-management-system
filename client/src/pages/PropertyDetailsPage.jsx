import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertyService } from '../services/api';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined, FaCheck, FaPhone, FaEnvelope } from 'react-icons/fa';

const PropertyDetailsPage = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                // Fetch property by ID from backend
                const response = await propertyService.getById(id);
                setProperty(response.data);
            } catch (error) {
                console.error("Failed to fetch property", error);
                // Fallback: try to get from all properties if getById fails
                try {
                    const allResponse = await propertyService.getAll();
                    const found = allResponse.data.find(p =>
                        p._id === id || p.propertyId === id || String(p.id) === id
                    );
                    if (found) setProperty(found);
                } catch (e) {
                    console.error("Fallback also failed", e);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    if (loading) return <div style={{ background: 'var(--color-primary)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading Details...</div>;
    if (!property) return <div style={{ background: 'var(--color-primary)', height: '100vh', padding: '5rem', color: 'white' }}>Property not found</div>;

    // Handle database field structures
    const imageUrl = property.image || (property.images && property.images[0]) || 'https://via.placeholder.com/800x600?text=No+Image';
    const locationText = property.location || (property.address && `${property.address.street || ''}, ${property.address.city || ''}`) || 'Location N/A';
    const priceText = property.price || property.rentPrice || 'Price N/A';
    const typeText = property.type || (property.isForSale ? 'For Sale' : 'For Rent');

    return (
        <div style={{ background: 'var(--color-primary)', minHeight: '100vh', color: 'var(--color-text-main)' }}>

            {/* Navbar (Simplified) */}
            <nav className="navbar scrolled" style={{ position: 'sticky' }}>
                <div className="container nav-content">
                    <Link to="/" className="logo">Luxe<span className="text-accent">Estate</span></Link>
                    <Link to="/properties" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Back to Listings</Link>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

                {/* Image Gallery (Hero) */}
                <div style={{ height: '60vh', borderRadius: '12px', overflow: 'hidden', marginBottom: '3rem', position: 'relative' }}>
                    <img src={imageUrl} alt={property.title || 'Property'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{property.title || 'Untitled Property'}</h1>
                                <p style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
                                    <FaMapMarkerAlt className="text-accent" /> {locationText}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{priceText}</div>
                                <div style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{typeText}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
                    {/* Main Content */}
                    <div>
                        <div style={{ display: 'flex', gap: '2rem', padding: '2rem', background: 'var(--color-primary-light)', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                <FaBed size={24} className="text-accent" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{property.beds} Bedrooms</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                <FaBath size={24} className="text-accent" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{property.baths} Bathrooms</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <FaRulerCombined size={24} className="text-accent" style={{ marginBottom: '0.5rem' }} />
                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{property.sqft}</div>
                            </div>
                        </div>

                        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Description</h2>
                        <p style={{ lineHeight: '1.8', color: 'var(--color-text-light)', marginBottom: '3rem' }}>
                            Experience the epitome of luxury living in this stunning residence located in the heart of {property.location}.
                            Meticulously designed with premium finishes and state-of-the-art amenities, this home offers an unparalleled blend of sophistication and comfort.
                            Features include floor-to-ceiling windows, a gourmet chef's kitchen, and expansive outdoor living spaces perfect for entertaining.
                        </p>

                        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Amenities</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {['Smart Home System', 'Infinity Pool', 'Private Gym', 'Wine Cellar', '24/7 Security', 'Home Theater', 'Spa & Sauna', 'Rooftop Terrace'].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-light)' }}>
                                    <FaCheck className="text-accent" size={12} /> {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bidding Section (Req: Buyers) */}
                    <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--color-primary-light)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Place a Bid</h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ display: 'block', color: 'var(--color-text-light)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Offer Price</label>
                                <input type="text" placeholder="$0.00" style={inputStyle} />
                            </div>
                            <button className="btn btn-primary">Submit Offer</button>
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                            * Current highest offer is <span style={{ color: 'var(--color-accent)' }}>$24,000,000</span>
                        </p>
                    </div>

                    {/* Reviews Section (Req: Renters) */}
                    <div style={{ marginTop: '4rem' }}>
                        <h2 style={{ marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>Client Reviews</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {[
                                { user: 'Michael R.', rating: 5, comment: 'Absolutely stunning property. The views are breathtaking and the location is perfect.' },
                                { user: 'Elena V.', rating: 4, comment: 'Great amenities, especially the rooftop terrace. Parking was a bit tight though.' }
                            ].map((review, i) => (
                                <div key={i} style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{review.user}</div>
                                        <div style={{ color: 'var(--color-accent)' }}>{'★'.repeat(review.rating)}</div>
                                    </div>
                                    <p style={{ color: 'var(--color-text-light)' }}>"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Inquiry Form */}
                <div>
                    <div style={{ background: 'var(--color-primary-light)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)', position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>Interested?</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Agent" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--color-accent)' }} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Sarah Jenkins</div>
                                <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Luxury Estate Agent</div>
                            </div>
                        </div>

                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" placeholder="Your Name" style={inputStyle} />
                            <input type="email" placeholder="Your Email" style={inputStyle} />
                            <input type="tel" placeholder="Your Phone" style={inputStyle} />
                            <textarea placeholder="I'm interested in this property..." rows="4" style={inputStyle}></textarea>
                            <button className="btn btn-primary" style={{ width: '100%' }}>Schedule Viewing</button>
                        </form>

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-light)' }}>
                                <FaPhone className="text-accent" /> +1 (555) 123-4567
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-light)' }}>
                                <FaEnvelope className="text-accent" /> s.jenkins@luxeestate.com
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'white',
    outline: 'none',
    fontFamily: 'var(--font-body)'
};

export default PropertyDetailsPage;
