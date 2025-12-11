import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const DevelopmentRequests = () => {
    const navigate = useNavigate();
    // Mock data for development requests (Requirement: Functional A.1)
    const [requests, setRequests] = useState([
        { id: 1, title: 'Luxury High-Rise Complex', location: 'Dhaka, Gulshan 2', budget: '$50M - $70M', deadline: '2024-12-31', status: 'Open' },
        { id: 2, title: 'Eco-Friendly Resort', location: 'Cox\'s Bazar, Marine Drive', budget: '$20M - $30M', deadline: '2024-11-15', status: 'Open' },
        { id: 3, title: 'Commercial Office Tower', location: 'Chittagong, Agrabad', budget: '$40M - $55M', deadline: '2024-10-20', status: 'Closed' }
    ]);

    const handleBid = (id) => {
        alert(`Bid placement interface for Request #${id} (Mock)`);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-primary)',
            paddingTop: '100px',
            paddingBottom: '4rem',
            color: 'white'
        }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>Development Requests</h1>
                        <p style={{ color: 'var(--color-text-light)' }}>Opportunities for Real Estate Companies</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-outline">Back to Dashboard</button>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    {requests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'var(--color-primary-light)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                padding: '2rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>{request.title}</h3>
                                <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMapMarkerAlt /> {request.location}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaClock /> Deadline: {request.deadline}</span>
                                </div>
                                <div style={{ marginTop: '1rem', fontWeight: 600 }}>Estimated Budget: {request.budget}</div>
                            </div>
                            <div>
                                {request.status === 'Open' ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleBid(request.id)}
                                    >
                                        Place Bid
                                    </button>
                                ) : (
                                    <button className="btn btn-outline" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                        Bidding Closed
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DevelopmentRequests;
