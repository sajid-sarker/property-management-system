import React from 'react';
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
    FaRocket,
} from 'react-icons/fa';
import { authService } from '../../services/api';
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
    const { user, isLandlord, isTenant, isCompany, isAgent } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

                {(isLandlord() || isAgent()) && (
                    <>
                        <SidebarItem
                            icon={<FaHome />}
                            label="My Properties"
                            active={isRouteActive('/properties')}
                            onClick={() => navigate('/properties')}
                        />
                        <SidebarItem
                            icon={<FaPlus />}
                            label="Add Property"
                            active={isRouteActive('/add-property')}
                            onClick={() => navigate('/add-property')}
                        />
                        <SidebarItem
                            icon={<FaRocket />}
                            label="Boosted Listings"
                            active={activeTab === 'boosted'}
                            onClick={() => handleNavigation('boosted')}
                        />
                    </>
                )}

                {isCompany() && (
                    <>
                        <SidebarItem
                            icon={<FaHome />}
                            label="My Properties"
                            active={isRouteActive('/properties')}
                            onClick={() => navigate('/properties')}
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

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        ...sidebarItemStyle,
                        color: 'var(--color-error)',
                        width: '100%',
                        justifyContent: 'flex-start',
                    }}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </aside>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            ...sidebarItemStyle,
            background: active ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
            color: active ? 'var(--color-accent)' : 'var(--color-text-light)',
            borderLeft: active
                ? '3px solid var(--color-accent)'
                : '3px solid transparent',
        }}
    >
        {icon} {label}
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
