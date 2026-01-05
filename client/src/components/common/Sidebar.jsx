import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaUser,
    FaHome,
    FaHeart,
    FaCog,
    FaSignOutAlt,
    FaPlus,
    FaBuilding,
    FaComments,
    FaBell,
    FaSearch,
    FaHardHat,
} from 'react-icons/fa';
import { authService, messageService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Reusable Sidebar Component
 * Displays navigation menu with role-based items
 * 
 * Props:
 * - activeTab: string - Currently active tab/section
 * - onTabChange: function - Callback when a tab is clicked (for in-page navigation)
 */
const Sidebar = ({ activeTab = 'overview', onTabChange }) => {
    const { user, isLandlord, isTenant, isCompany } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread message count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (user) {
                try {
                    const response = await messageService.getUnreadCount();
                    setUnreadCount(response.data?.count || 0);
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                }
            }
        };
        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Helper to determine if a route is active
    const isRouteActive = (path) => location.pathname === path;

    // Handle navigation - either use onTabChange for in-page tabs or navigate for routes
    const handleNavigation = (tab, route) => {
        if (route) {
            navigate(route);
        } else if (onTabChange) {
            onTabChange(tab);
        }
    };

    return (
        <aside
            style={{
                width: '280px',
                background: 'var(--color-primary-light)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'sticky',
                top: 0,
            }}
        >
            <Link
                to="/"
                className="logo"
                style={{ display: 'block', marginBottom: '3rem' }}
            >
                Luxe<span className="text-accent">Estate</span>
            </Link>

            <nav
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}
            >
                <SidebarItem
                    icon={<FaSearch />}
                    label="Search"
                    active={isRouteActive('/search')}
                    onClick={() => navigate('/search')}
                />

                <SidebarItem
                    icon={<FaUser />}
                    label="Overview"
                    active={activeTab === 'overview' && isRouteActive('/dashboard')}
                    onClick={() => {
                        if (onTabChange) {
                            onTabChange('overview');
                        } else {
                            navigate('/dashboard');
                        }
                    }}
                />

                {isLandlord() && (
                    <>
                        <SidebarItem
                            icon={<FaHome />}
                            label="My Properties"
                            active={location.pathname === '/properties' && location.search.includes('myListings=true')}
                            onClick={() => navigate('/properties?myListings=true')}
                        />
                        <SidebarItem
                            icon={<FaPlus />}
                            label="Add Property"
                            active={isRouteActive('/add-property')}
                            onClick={() => navigate('/add-property')}
                        />
                        <SidebarItem
                            icon={<FaHardHat />}
                            label="List for Development"
                            active={isRouteActive('/list-for-development')}
                            onClick={() => navigate('/list-for-development')}
                        />
                    </>
                )}

                {isCompany() && (
                    <>
                        <SidebarItem
                            icon={<FaHome />}
                            label="My Properties"
                            active={location.pathname === '/properties' && location.search.includes('myListings=true')}
                            onClick={() => navigate('/properties?myListings=true')}
                        />
                        <SidebarItem
                            icon={<FaBuilding />}
                            label="Dev Requests"
                            active={isRouteActive('/development-requests')}
                            onClick={() => navigate('/development-requests')}
                        />
                    </>
                )}

                {isTenant() && (
                    <SidebarItem
                        icon={<FaHeart />}
                        label="Wishlist"
                        active={isRouteActive('/wishlist')}
                        onClick={() => navigate('/wishlist')}
                    />
                )}

                <SidebarItem
                    icon={<FaComments />}
                    label="Messages"
                    active={isRouteActive('/messages') || activeTab === 'messages'}
                    onClick={() => navigate('/messages')}
                    badge={unreadCount}
                />
                <SidebarItem
                    icon={<FaBell />}
                    label="Notifications"
                    active={activeTab === 'notifications'}
                    onClick={() => {
                        if (onTabChange) {
                            onTabChange('notifications');
                        } else {
                            navigate('/dashboard?tab=notifications');
                        }
                    }}
                />
                <SidebarItem
                    icon={<FaCog />}
                    label="Settings"
                    active={activeTab === 'settings'}
                    onClick={() => {
                        if (onTabChange) {
                            onTabChange('settings');
                        } else {
                            navigate('/dashboard?tab=settings');
                        }
                    }}
                />
            </nav>
        </aside>
    );
};

const SidebarItem = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        style={{
            ...sidebarItemStyle,
            background: active ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
            color: active ? 'var(--color-accent)' : 'var(--color-text-light)',
            borderLeft: active
                ? '3px solid var(--color-accent)'
                : '3px solid transparent',
            position: 'relative',
        }}
    >
        {icon} {label}
        {badge > 0 && (
            <span
                style={{
                    marginLeft: 'auto',
                    background: '#e53e3e',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    borderRadius: '9999px',
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                }}
            >
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </button>
);

const sidebarItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderRadius: '0 8px 8px 0',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    border: 'none',
    background: 'transparent',
};

export default Sidebar;
