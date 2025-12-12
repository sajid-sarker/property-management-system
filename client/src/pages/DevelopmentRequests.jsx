import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { projectService } from '../services/api';

const DevelopmentRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectService.getAll();
                setRequests(response.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
                // Fallback to mock data if API fails
                setRequests([
                    { _id: '1', title: 'Luxury High-Rise Complex', location: 'Dhaka, Gulshan 2', budget: 50000000, deadline: '2024-12-31', status: 'Open' },
                    { _id: '2', title: 'Eco-Friendly Resort', location: 'Cox\'s Bazar, Marine Drive', budget: 25000000, deadline: '2024-11-15', status: 'Open' },
                    { _id: '3', title: 'Commercial Office Tower', location: 'Chittagong, Agrabad', budget: 45000000, deadline: '2024-10-20', status: 'Closed' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleBid = async (projectId) => {
        const amount = prompt('Enter your bid amount:');
        if (amount) {
            try {
                await projectService.placeBid(projectId, {
                    amount: parseFloat(amount),
                    proposalText: 'Bid from company'
                });
                alert('Bid placed successfully!');
            } catch (error) {
                console.error('Failed to place bid', error);
                alert('Failed to place bid. Please try again.');
            }
        }
    };

    // Format budget for display
    const formatBudget = (budget) => {
        if (typeof budget === 'number') {
            if (budget >= 1000000) {
                return `$${(budget / 1000000).toFixed(0)}M`;
            }
            return `$${budget.toLocaleString()}`;
        }
        return budget || 'TBD';
    };

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading projects...</div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>No development requests available at this time.</div>
                ) : (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {requests.map((request) => (
                            <motion.div
                                key={request._id || request.projectId || request.id}
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
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>{request.title || 'Untitled Project'}</h3>
                                    <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMapMarkerAlt /> {request.location || 'Location TBD'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaClock /> Deadline: {formatDate(request.deadline)}</span>
                                    </div>
                                    <div style={{ marginTop: '1rem', fontWeight: 600 }}>Estimated Budget: {formatBudget(request.budget)}</div>
                                </div>
                                <div>
                                    {request.status !== 'Closed' ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleBid(request._id || request.projectId || request.id)}
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
                )}
            </div>
        </div>
    );
};

export default DevelopmentRequests;
