import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData);

            // Role-based redirect
            if (user?.role === 'landlord' || user?.role === 'agent') {
                navigate('/dashboard'); // Landlords go to dashboard
            } else if (user?.role === 'company') {
                navigate('/development-requests'); // Companies go to dev requests
            } else {
                navigate('/properties'); // General users go to browse properties
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'url("https://images.unsplash.com/photo-1622372738946-a2e5330eef76?q=80&w=2574&auto=format&fit=crop") center/cover',
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
                    maxWidth: '450px',
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
                    <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>Welcome back to exclusive living</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--color-text-light)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--color-text-light)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(220, 38, 38, 0.2)',
                            border: '1px solid rgba(220, 38, 38, 0.5)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            color: '#fca5a5',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" className="text-accent" style={{ fontWeight: 600 }}>Join the waiting list</Link>
                </div>
            </motion.div>
        </div>
    );
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

export default Login;
