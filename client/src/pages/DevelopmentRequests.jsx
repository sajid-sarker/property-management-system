import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaMapMarkerAlt, FaClock, FaEye, FaEdit, FaTimes, FaDollarSign, FaUsers, FaCheck } from 'react-icons/fa';
import { projectService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

/**
 * DevelopmentRequests Page
 * Features 3 & 4 of Requirement 1: Bid management for real estate companies
 * - Feature 3: Modify/withdraw bids before deadline
 * - Feature 4: View other bids on projects
 */
const DevelopmentRequests = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myBids, setMyBids] = useState({});

    // Modal states
    const [showBidModal, setShowBidModal] = useState(false);
    const [showViewBidsModal, setShowViewBidsModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectBids, setProjectBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(false);

    // Bid form state
    const [bidAmount, setBidAmount] = useState('');
    const [proposalText, setProposalText] = useState('');
    const [estimatedDays, setEstimatedDays] = useState('');
    const [editingBid, setEditingBid] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProjects();
        if (user) {
            fetchMyBids();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const response = await projectService.getAll();
            const data = response.data?.data || response.data || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch projects", error);
            // Fallback to sample data if API fails
            setRequests([
                { _id: '1', title: 'Luxury High-Rise Complex', location: 'Dhaka, Gulshan 2', budget: 50000000, deadline: '2026-12-31', status: 'Open' },
                { _id: '2', title: 'Eco-Friendly Resort', location: "Cox's Bazar, Marine Drive", budget: 25000000, deadline: '2026-11-15', status: 'Open' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBids = async () => {
        try {
            const response = await projectService.getMyBids();
            const bids = response.data?.data || response.data || [];
            const bidsMap = {};
            bids.forEach(bid => {
                if (bid.project?._id) {
                    bidsMap[bid.project._id] = bid;
                }
            });
            setMyBids(bidsMap);
        } catch (error) {
            console.error("Failed to fetch my bids", error);
        }
    };

    // Feature 4: View other bids on a project
    const handleViewBids = async (project) => {
        setSelectedProject(project);
        setShowViewBidsModal(true);
        setLoadingBids(true);
        try {
            const response = await projectService.getProjectBids(project._id);
            const bids = response.data?.data || response.data || [];
            setProjectBids(Array.isArray(bids) ? bids : []);
        } catch (error) {
            console.error("Failed to fetch project bids", error);
            setProjectBids([]);
        } finally {
            setLoadingBids(false);
        }
    };

    // Open bid modal (new or edit)
    const openBidModal = (project, existingBid = null) => {
        setSelectedProject(project);
        setEditingBid(existingBid);
        setBidAmount(existingBid?.amount?.toString() || '');
        setProposalText(existingBid?.proposalText || '');
        setEstimatedDays(existingBid?.estimatedDays?.toString() || '');
        setError('');
        setSuccess('');
        setShowBidModal(true);
    };

    // Submit bid (create or update)
    const handleSubmitBid = async () => {
        if (!bidAmount || !proposalText) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const bidData = {
                amount: parseFloat(bidAmount),
                proposalText,
                estimatedDays: parseInt(estimatedDays) || 0,
            };

            if (editingBid) {
                // Feature 3: Update existing bid
                await projectService.updateBid(selectedProject._id, editingBid._id, bidData);
                setSuccess('Bid updated successfully!');
            } else {
                // Place new bid
                await projectService.placeBid(selectedProject._id, bidData);
                setSuccess('Bid placed successfully!');
            }

            setTimeout(() => {
                setShowBidModal(false);
                fetchMyBids();
            }, 1500);
        } catch (error) {
            console.error('Bid operation failed', error);
            setError(error.response?.data?.message || 'Failed to submit bid. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Feature 3: Withdraw bid
    const handleWithdrawBid = async (project, bid) => {
        if (!window.confirm('Are you sure you want to withdraw this bid?')) {
            return;
        }

        try {
            await projectService.withdrawBid(project._id, bid._id);
            alert('Bid withdrawn successfully!');
            fetchMyBids();
        } catch (error) {
            console.error('Failed to withdraw bid', error);
            alert(error.response?.data?.message || 'Failed to withdraw bid. Please try again.');
        }
    };

    // Format budget for display
    const formatBudget = (budget) => {
        if (typeof budget === 'number') {
            if (budget >= 1000000) {
                return `$${(budget / 1000000).toFixed(1)}M`;
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

    // Check if deadline has passed
    const isDeadlinePassed = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
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
                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>Development Requests</h1>
                        <p style={{ color: 'var(--color-text-light)' }}>Bid on development opportunities</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-outline">Back to Dashboard</button>
                </div>

                {/* Project List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading projects...</div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>
                        No development requests available at this time.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {requests.map((request) => {
                            const myBid = myBids[request._id];
                            const deadlinePassed = isDeadlinePassed(request.deadline);

                            return (
                                <motion.div
                                    key={request._id || request.projectId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        background: 'var(--color-primary-light)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '2rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        {/* Project Info */}
                                        <div style={{ flex: 1, minWidth: '300px' }}>
                                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>
                                                {request.title || 'Untitled Project'}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-light)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaMapMarkerAlt /> {request.location || request.address?.city || 'Location TBD'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FaClock /> Deadline: {formatDate(request.deadline)}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: '1rem' }}>
                                                <span style={{ fontWeight: 600, color: '#d4af37' }}>
                                                    <FaDollarSign style={{ marginRight: '0.25rem' }} />
                                                    Budget: {formatBudget(request.budget)}
                                                </span>
                                            </div>

                                            {/* My Bid Status */}
                                            {myBid && (
                                                <div style={{
                                                    marginTop: '1rem',
                                                    padding: '0.75rem 1rem',
                                                    background: 'rgba(212, 175, 55, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                                }}>
                                                    <div style={{ fontSize: '0.85rem', color: '#d4af37' }}>
                                                        <FaCheck style={{ marginRight: '0.5rem' }} />
                                                        Your Bid: {formatBudget(myBid.amount)} | Status: {myBid.status}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '150px' }}>
                                            {/* Feature 4: View Other Bids */}
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleViewBids(request)}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            >
                                                <FaEye /> View Bids
                                            </button>

                                            {/* Bid Actions */}
                                            {!deadlinePassed && user?.role === 'company' && (
                                                <>
                                                    {myBid ? (
                                                        <>
                                                            {/* Feature 3: Edit Bid */}
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => openBidModal(request, myBid)}
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                                            >
                                                                <FaEdit /> Edit Bid
                                                            </button>
                                                            {/* Feature 3: Withdraw Bid */}
                                                            <button
                                                                className="btn btn-outline"
                                                                onClick={() => handleWithdrawBid(request, myBid)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                                    borderColor: '#dc3545', color: '#dc3545'
                                                                }}
                                                            >
                                                                <FaTimes /> Withdraw
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => openBidModal(request)}
                                                        >
                                                            Place Bid
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {deadlinePassed && (
                                                <span style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'rgba(220, 53, 69, 0.2)',
                                                    borderRadius: '8px',
                                                    color: '#dc3545',
                                                    textAlign: 'center',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    Bidding Closed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bid Modal (Place/Edit) */}
            <Modal
                isOpen={showBidModal}
                onClose={() => setShowBidModal(false)}
                title={editingBid ? 'Edit Your Bid' : 'Place Your Bid'}
                size="md"
            >
                <div style={{ padding: '1rem 0' }}>
                    {selectedProject && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <h4 style={{ color: '#d4af37', marginBottom: '0.5rem' }}>{selectedProject.title}</h4>
                            <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Budget: {formatBudget(selectedProject.budget)}</p>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '0.75rem', background: 'rgba(220, 53, 69, 0.2)', borderRadius: '8px', color: '#dc3545', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ padding: '0.75rem', background: 'rgba(40, 167, 69, 0.2)', borderRadius: '8px', color: '#28a745', marginBottom: '1rem' }}>
                            {success}
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Bid Amount ($) *</label>
                        <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            style={inputStyle}
                            placeholder="Enter your bid amount"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Proposal *</label>
                        <textarea
                            value={proposalText}
                            onChange={(e) => setProposalText(e.target.value)}
                            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                            placeholder="Describe your proposal and approach..."
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Estimated Days to Complete</label>
                        <input
                            type="number"
                            value={estimatedDays}
                            onChange={(e) => setEstimatedDays(e.target.value)}
                            style={inputStyle}
                            placeholder="e.g. 180"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" onClick={() => setShowBidModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmitBid} isLoading={submitting}>
                            {editingBid ? 'Update Bid' : 'Submit Bid'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Bids Modal (Feature 4) */}
            <Modal
                isOpen={showViewBidsModal}
                onClose={() => setShowViewBidsModal(false)}
                title={`Bids on: ${selectedProject?.title || 'Project'}`}
                size="lg"
            >
                <div style={{ padding: '1rem 0' }}>
                    {loadingBids ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>Loading bids...</div>
                    ) : projectBids.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#a0a0a0' }}>
                            <FaUsers style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No bids have been placed on this project yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ marginBottom: '0.5rem', color: '#a0a0a0', fontSize: '0.9rem' }}>
                                {projectBids.length} bid{projectBids.length !== 1 ? 's' : ''} on this project
                            </div>
                            {projectBids.map((bid, index) => (
                                <div
                                    key={bid._id || index}
                                    style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#0a0a0f', fontWeight: 600
                                            }}>
                                                {(bid.company?.name || 'A')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{bid.company?.name || 'Anonymous Company'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#6a6a7a' }}>{formatDate(bid.createdAt)}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d4af37' }}>
                                                {formatBudget(bid.amount)}
                                            </div>
                                            {bid.estimatedDays > 0 && (
                                                <div style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
                                                    {bid.estimatedDays} days
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {bid.proposalText && (
                                        <p style={{ color: '#a0a0a0', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                            {bid.proposalText}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

// Input styles
const inputStyle = {
    width: '100%',
    padding: '0.875rem',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    fontSize: '1rem',
};

export default DevelopmentRequests;
