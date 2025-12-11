import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../services/api'; // Ensure this is exported in api.js

const AddPropertyPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        type: 'For Sale',
        beds: '',
        baths: '',
        sqft: '',
        description: '',
        image: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await propertyService.create(formData);
            alert('Property listed successfully! (Mock)');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to create property", error);
            alert('Failed to create property');
        }
    };

    // Navbar reusable component
    const Navbar = () => (
        <nav className="navbar scrolled">
            <div className="container nav-content">
                <Link to="/" className="logo">Luxe<span className="text-accent">Estate</span></Link>
                <div className="nav-links hidden-mobile">
                    <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Cancel</Link>
                </div>
            </div>
        </nav>
    );

    return (
        <div style={{ background: 'var(--color-primary)', minHeight: '100vh', color: 'white' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem', textAlign: 'center' }}>List Your <span className="text-accent">Property</span></h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '3rem' }}>Join our exclusive collection of premium residences.</p>

                <form onSubmit={handleSubmit} style={{ background: 'var(--color-primary-light)', padding: '3rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Property Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} required style={inputStyle} placeholder="e.g. Midnight Villa" />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Location/Address</label>
                            <input name="location" value={formData.location} onChange={handleChange} required style={inputStyle} placeholder="e.g. Beverly Hills, CA" />
                        </div>
                        <div>
                            <label style={labelStyle}>Price</label>
                            <input name="price" value={formData.price} onChange={handleChange} required style={inputStyle} placeholder="e.g. $5,000,000" />
                        </div>
                        <div>
                            <label style={labelStyle}>Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                                <option value="For Sale">For Sale</option>
                                <option value="For Rent">For Rent</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Bedrooms</label>
                            <input name="beds" type="number" value={formData.beds} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Bathrooms</label>
                            <input name="baths" type="number" value={formData.baths} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Square Footage</label>
                            <input name="sqft" value={formData.sqft} onChange={handleChange} required style={inputStyle} placeholder="e.g. 5,000 sqft" />
                        </div>
                        <div>
                            <label style={labelStyle}>Image URL</label>
                            <input name="image" value={formData.image} onChange={handleChange} required style={inputStyle} placeholder="https://..." />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={inputStyle} placeholder="Describe the luxury features..." />
                        </div>
                    </div>

                    {/* Boost Property Feature (Req 4, Feat 4) */}
                    <div style={{ padding: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--color-accent)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ color: 'var(--color-accent)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Boost Property Listing</h3>
                                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Get 3x more views by featuring your property on the homepage.</p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
                                <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)' }} />
                                <span>$49.99</span>
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                        Submit Listing
                    </button>
                </form>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'var(--color-text-light)',
    fontSize: '0.9rem'
};

const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'white',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem'
};

export default AddPropertyPage;
