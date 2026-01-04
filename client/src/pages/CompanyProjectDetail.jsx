import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaClock, FaDollarSign, FaUser, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { projectService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * CompanyProjectDetail Page
 * Shows details of an accepted development project for Company users
 */
const CompanyProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isCompany } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const response = await projectService.getCompanyProjectById(id);
                setProject(response.data?.data);
            } catch (err) {
                console.error("Failed to fetch project:", err);
                setError(err.response?.data?.message || "Failed to load project details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        }
    }, [id]);

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-primary)',
                paddingTop: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
            }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-primary)',
                paddingTop: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                gap: '1rem',
            }}>
                <p style={{ color: '#dc3545' }}>{error}</p>
                <Link to="/dashboard" className="btn btn-primary">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-primary)',
                paddingTop: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                gap: '1rem',
            }}>
                <p>Project not found</p>
                <Link to="/dashboard" className="btn btn-primary">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const acceptedBid = project.acceptedBid;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-primary)',
            paddingTop: '100px',
            paddingBottom: '4rem',
            color: 'white',
        }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-accent)',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        fontSize: '1rem',
                    }}
                >
                    <FaArrowLeft /> Back to Dashboard
                </button>

                {/* Project Header */}
                <div style={{
                    background: 'var(--color-primary-light)',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '2rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FaBuilding style={{ color: 'var(--color-accent)', fontSize: '1.5rem' }} />
                        </div>
                        <div>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(74, 222, 128, 0.15)',
                                color: '#4ade80',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                            }}>
                                Your Development Project
                            </span>
                        </div>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2rem',
                        color: 'var(--color-accent)',
                        marginBottom: '1rem',
                    }}>
                        {project.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        color: 'var(--color-text-light)',
                        fontSize: '0.9rem',
                    }}>
                        {project.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMapMarkerAlt style={{ color: 'var(--color-accent)' }} />
                                {project.location}
                            </span>
                        )}
                        {project.deadline && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCalendarAlt style={{ color: 'var(--color-accent)' }} />
                                Deadline: {formatDate(project.deadline)}
                            </span>
                        )}
                    </div>

                    {/* Landlord Info */}
                    {project.owner && (
                        <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}>
                            <FaUser style={{ color: 'var(--color-accent)' }} />
                            <span style={{ color: 'var(--color-text-light)' }}>
                                Landlord: <strong style={{ color: 'white' }}>{project.owner.name}</strong>
                            </span>
                        </div>
                    )}
                </div>

                {/* Landlord's Description Section */}
                <div style={{
                    background: 'var(--color-primary-light)',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '2rem',
                }}>
                    <h2 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.25rem',
                        marginBottom: '1.5rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}>
                        <FaFileAlt style={{ color: 'var(--color-accent)' }} />
                        Property Description (by Landlord)
                    </h2>
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        color: 'var(--color-text-light)',
                        lineHeight: 1.8,
                        whiteSpace: 'pre-wrap',
                    }}>
                        {project.description || 'No description provided.'}
                    </div>
                </div>

                {/* Your Accepted Bid Section */}
                {acceptedBid && (
                    <div style={{
                        background: 'var(--color-primary-light)',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        border: '1px solid rgba(74, 222, 128, 0.2)',
                    }}>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.25rem',
                            marginBottom: '1.5rem',
                            color: 'white',
                        }}>
                            Your Accepted Proposal
                        </h2>

                        {/* Bid Details */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                        }}>
                            <div>
                                <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                    <FaDollarSign style={{ marginRight: '0.25rem' }} />
                                    Amount to Receive
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80' }}>
                                    ${acceptedBid.amount?.toLocaleString()}
                                </div>
                            </div>
                            {acceptedBid.estimatedDays > 0 && (
                                <div>
                                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <FaClock style={{ marginRight: '0.25rem' }} />
                                        Estimated Duration
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                        {acceptedBid.estimatedDays} days
                                    </div>
                                </div>
                            )}
                            {acceptedBid.createdAt && (
                                <div>
                                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <FaCalendarAlt style={{ marginRight: '0.25rem' }} />
                                        Bid Accepted On
                                    </div>
                                    <div style={{ fontSize: '1rem' }}>
                                        {formatDate(acceptedBid.createdAt)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Your Proposal Description */}
                        {acceptedBid.proposalText && (
                            <div>
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '1rem',
                                    color: 'var(--color-accent)',
                                }}>
                                    Your Proposal
                                </h3>
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '12px',
                                    color: 'var(--color-text-light)',
                                    lineHeight: 1.8,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {acceptedBid.proposalText}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!acceptedBid && (
                    <div style={{
                        background: 'var(--color-primary-light)',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        textAlign: 'center',
                        color: 'var(--color-text-light)',
                    }}>
                        No accepted proposal information available.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyProjectDetail;
