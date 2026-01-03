import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEdit, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';
import { authService } from '../../services/api';

/**
 * UserProfileCard Component
 * Displays user profile information with picture, name, role, and description
 * 
 * Props:
 * - user: object - User data containing name, email, role, image, description, etc.
 * - isOwnProfile: boolean - Whether viewing own profile (shows edit button)
 * - compact: boolean - Whether to show a compact version
 */
const UserProfileCard = ({ user, isOwnProfile = false, compact = false }) => {
    const [fullProfile, setFullProfile] = useState(null);
    
    // Fetch full profile to get createdAt and other fields
    useEffect(() => {
        const fetchFullProfile = async () => {
            if (user?._id || user?.id) {
                try {
                    const userId = user._id || user.id;
                    const response = await authService.getProfile(userId);
                    if (response.data?.success && response.data?.data) {
                        setFullProfile(response.data.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch full profile:", error);
                }
            }
        };
        fetchFullProfile();
    }, [user]);

    if (!user) return null;

    // Use full profile data if available, fallback to passed user
    const displayUser = fullProfile || user;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'landlord':
                return { bg: 'rgba(212, 175, 55, 0.2)', color: '#d4af37' };
            case 'company':
                return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
            default:
                return { bg: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' };
        }
    };

    const roleBadge = getRoleBadgeColor(displayUser.role);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                background: 'var(--color-primary-light)',
                borderRadius: '12px',
                padding: compact ? '1.5rem' : '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: compact ? 'row' : 'column',
                alignItems: compact ? 'center' : 'flex-start',
                gap: compact ? '1.5rem' : '1rem',
            }}
        >
            {/* Profile Picture */}
            <div
                style={{
                    width: compact ? '80px' : '120px',
                    height: compact ? '80px' : '120px',
                    borderRadius: '50%',
                    background: `url("${displayUser.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayUser.name || 'User') + '&background=d4af37&color=0a0a0f'}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '3px solid var(--color-accent)',
                    flexShrink: 0,
                }}
            />

            {/* Profile Info */}
            <div style={{ flex: 1 }}>
                {/* Name and Role */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap'
                }}>
                    <h3 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: compact ? '1.25rem' : '1.5rem',
                        color: 'white',
                        margin: 0,
                    }}>
                        {displayUser.name || 'User'}
                    </h3>
                    <span style={{
                        background: roleBadge.bg,
                        color: roleBadge.color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                    }}>
                        {displayUser.role || 'Member'}
                    </span>
                </div>

                {/* Description */}
                <p style={{
                    color: 'var(--color-text-light)',
                    fontSize: '0.9rem',
                    marginBottom: compact ? '0' : '1rem',
                    lineHeight: 1.6,
                }}>
                    {displayUser.description || 'No description provided.'}
                </p>

                {/* Details (non-compact) */}
                {!compact && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-text-light)',
                            fontSize: '0.85rem',
                        }}>
                            <FaEnvelope style={{ color: 'var(--color-accent)' }} />
                            {displayUser.email}
                        </div>
                        {displayUser.phoneNumber && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: 'var(--color-text-light)',
                                fontSize: '0.85rem',
                            }}>
                                <FaPhone style={{ color: 'var(--color-accent)' }} />
                                {displayUser.phoneNumber}
                            </div>
                        )}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--color-text-light)',
                            fontSize: '0.85rem',
                        }}>
                            <FaCalendar style={{ color: 'var(--color-accent)' }} />
                            Member since {formatDate(displayUser.createdAt)}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Button (own profile only) */}
            {isOwnProfile && (
                <Link
                    to="/profile"
                    className="btn btn-outline"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        alignSelf: compact ? 'center' : 'flex-start',
                    }}
                >
                    <FaEdit size={12} /> Edit Profile
                </Link>
            )}
        </motion.div>
    );
};

export default UserProfileCard;
