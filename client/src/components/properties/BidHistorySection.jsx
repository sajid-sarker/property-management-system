import React, { useState, useEffect } from 'react';
import { propertyBidService } from '../../services/api';

/**
 * BidHistorySection - Displays bid history for a property
 * Shows full details for landlord (owner), limited info for others
 */
const BidHistorySection = ({ propertyId, isOwner, listingType, onBidAccepted }) => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchBids = async () => {
            if (listingType !== 'sell') {
                setLoading(false);
                return;
            }

            try {
                let response;
                if (isOwner) {
                    response = await propertyBidService.getBidsForProperty(propertyId);
                } else {
                    response = await propertyBidService.getBidHistory(propertyId);
                }
                const data = response.data?.data || response.data || [];
                setBids(Array.isArray(data) ? data : (data.bids || []));
            } catch (err) {
                console.error('Failed to fetch bids:', err);
                setError(err.response?.data?.message || 'Failed to load bids');
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, [propertyId, isOwner, listingType]);

    const handleAcceptBid = async (bidId) => {
        if (!confirm('Accept this bid? This will mark the property as sold.')) return;

        setActionLoading(bidId);
        try {
            await propertyBidService.acceptBid(bidId);
            alert('Bid accepted successfully!');
            // Refresh bids
            const response = await propertyBidService.getBidsForProperty(propertyId);
            const data = response.data?.data || [];
            setBids(Array.isArray(data) ? data : []);
            if (onBidAccepted) onBidAccepted();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to accept bid');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectBid = async (bidId) => {
        if (!confirm('Reject this bid?')) return;

        setActionLoading(bidId);
        try {
            await propertyBidService.rejectBid(bidId);
            alert('Bid rejected');
            // Refresh bids
            const response = await propertyBidService.getBidsForProperty(propertyId);
            const data = response.data?.data || [];
            setBids(Array.isArray(data) ? data : []);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject bid');
        } finally {
            setActionLoading(null);
        }
    };

    if (listingType !== 'sell') return null;

    if (loading) {
        return (
            <div style={sectionStyle}>
                <h2 style={headingStyle}>Bid History</h2>
                <p style={{ color: 'var(--color-text-light)' }}>Loading bids...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={sectionStyle}>
                <h2 style={headingStyle}>Bid History</h2>
                <p style={{ color: '#ff6b6b' }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={sectionStyle}>
            <h2 style={headingStyle}>
                Bid History
                {bids.length > 0 && (
                    <span style={{
                        fontSize: '0.9rem',
                        color: 'var(--color-accent)',
                        marginLeft: '1rem'
                    }}>
                        ({bids.length} {bids.length === 1 ? 'bid' : 'bids'})
                    </span>
                )}
            </h2>

            {bids.length === 0 ? (
                <p style={{ color: 'var(--color-text-light)' }}>
                    No bids yet. Be the first to place a bid!
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bids.map((bid, index) => (
                        <div key={bid._id || bid.bidId || index} style={bidCardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {bid.bidder?.image && (
                                        <img
                                            src={bid.bidder.image}
                                            alt={bid.bidder.name}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'white' }}>
                                            {bid.bidder?.name || 'Anonymous Bidder'}
                                        </div>
                                        {isOwner && bid.bidder?.email && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                                {bid.bidder.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        color: 'var(--color-accent)'
                                    }}>
                                        ${bid.bidAmount?.toLocaleString()}
                                    </div>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: getStatusColor(bid.status),
                                        textTransform: 'capitalize'
                                    }}>
                                        {bid.status}
                                    </div>
                                </div>
                            </div>

                            {bid.message && (
                                <p style={{
                                    marginTop: '0.75rem',
                                    color: 'var(--color-text-light)',
                                    fontSize: '0.9rem',
                                    fontStyle: 'italic'
                                }}>
                                    "{bid.message}"
                                </p>
                            )}

                            {isOwner && bid.status === 'pending' && (
                                <div style={{
                                    marginTop: '1rem',
                                    display: 'flex',
                                    gap: '0.75rem'
                                }}>
                                    <button
                                        onClick={() => handleAcceptBid(bid._id)}
                                        disabled={actionLoading === bid._id}
                                        style={{
                                            ...actionButtonStyle,
                                            background: 'var(--color-accent)',
                                            color: 'black'
                                        }}
                                    >
                                        {actionLoading === bid._id ? 'Processing...' : '✓ Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleRejectBid(bid._id)}
                                        disabled={actionLoading === bid._id}
                                        style={{
                                            ...actionButtonStyle,
                                            background: 'transparent',
                                            border: '1px solid rgba(255, 107, 107, 0.5)',
                                            color: '#ff6b6b'
                                        }}
                                    >
                                        ✕ Reject
                                    </button>
                                </div>
                            )}

                            <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-light)'
                            }}>
                                {new Date(bid.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'accepted': return '#4ade80';
        case 'rejected': return '#ff6b6b';
        case 'pending': return 'var(--color-accent)';
        case 'outbid': return '#a0a0a0';
        default: return 'var(--color-text-light)';
    }
};

const sectionStyle = {
    marginTop: '3rem',
    padding: '2rem',
    background: 'var(--color-primary-light)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
};

const headingStyle = {
    marginBottom: '1.5rem',
    fontFamily: 'var(--font-heading)',
    color: 'white',
    display: 'flex',
    alignItems: 'center'
};

const bidCardStyle = {
    padding: '1.25rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
};

const actionButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
};

export default BidHistorySection;
