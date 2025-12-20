import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'tenant' });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Registration failed. (Mock: Check console)');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop") center/cover',
            position: 'relative'
        }}>
            {/* Dark Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '500px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '16px',
                    padding: '3rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <Link to="/" style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'white' }}>
                        Luxe<span className="text-accent">Estate</span>
                    </Link>
                    <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>Create your account</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>I am a:</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={inputStyle}
                        >
                            <option value="tenant">Tenant (Looking to rent/buy)</option>
                            <option value="landlord">Landlord (Listing properties)</option>
                            <option value="agent">Agent (Managing properties)</option>
                            <option value="company">Real Estate Company (Development)</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}>
                        Create Account
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" className="text-accent" style={{ fontWeight: 600 }}>Sign in</Link>
                </div>
            </motion.div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    color: 'var(--color-text-light)',
    marginBottom: '0.5rem',
    fontSize: '0.875rem'
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    background: 'rgba(2, 6, 23, 0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s'
};

export default Register;
