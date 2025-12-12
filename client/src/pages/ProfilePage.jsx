import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Real estate enthusiast and investor.',
        phone: '+1 234 567 8900'
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Profile Updated Successfully! (Mock)');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-primary)',
            paddingTop: '80px',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    background: 'var(--color-primary-light)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '3rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>Edit Profile</h1>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-outline">Back to Dashboard</button>
                </div>

                <div style={{ display: 'flex', gap: '3rem', flexDirection: 'row-reverse' }}>
                    {/* Profile Picture Column */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: 'url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            margin: '0 auto 1.5rem auto',
                            border: '4px solid var(--color-accent)'
                        }}></div>
                        <button className="btn btn-outline" style={{ fontSize: '0.875rem' }}>Change Photo</button>
                    </div>

                    {/* Form Column */}
                    <form onSubmit={handleSubmit} style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                style={inputStyle}
                                disabled
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Bio</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows="4"
                                style={inputStyle}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Save Changes
                        </button>
                    </form>
                </div>
            </motion.div>
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
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '4px',
    color: 'white',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    resize: 'none'
};

export default ProfilePage;
