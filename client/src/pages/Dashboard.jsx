import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaHome, FaHeart, FaCog, FaSignOutAlt, FaPlus, FaBuilding, FaComments, FaBell, FaChartLine, FaUsers, FaClipboardList, FaTools } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Default to 'renter' if role is undefined for robustness
    const role = user?.role || 'renter';

    const getSidebarItems = (role) => {
        const common = [
            { id: 'overview', label: 'Overview', icon: <FaUser /> },
            { id: 'messages', label: 'Messages', icon: <FaComments /> },
            { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
            { id: 'settings', label: 'Settings', icon: <FaCog /> },
        ];

        const roleSpecific = {
            renter: [
                { id: 'wishlist', label: 'My Wishlist', icon: <FaHeart />, link: '/wishlist' },
                { id: 'visits', label: 'Scheduled Visits', icon: <FaHome /> },
            ],
            landlord: [
                { id: 'my-listings', label: 'My Listings', icon: <FaBuilding />, link: '/properties' }, // Assuming filtering happens on page
                { id: 'inquiries', label: 'Tenant Inquiries', icon: <FaUsers /> },
                { id: 'maintenance', label: 'Maintenance', icon: <FaTools /> },
            ],
            company: [
                { id: 'portfolio', label: 'Portfolio', icon: <FaBuilding /> },
                { id: 'agents', label: 'Agent Team', icon: <FaUsers /> },
                { id: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
            ],
            admin: [
                { id: 'users', label: 'User Management', icon: <FaUsers /> },
                { id: 'platform', label: 'Platform Stats', icon: <FaChartLine /> },
                { id: 'reports', label: 'Reports', icon: <FaClipboardList /> },
            ]
        };

        const items = roleSpecific[role] || roleSpecific['renter'];
        return [...common.slice(0, 1), ...items, ...common.slice(1)];
    };


    const getStats = (role) => {
        // MOCK DATA: These statistics should be calculated from real data fetched via API
        switch (role) {
            case 'landlord':
                return [
                    { number: "5", label: "Active Listings" },
                    { number: "12", label: "Pending Inquiries" },
                    { number: "4.8", label: "Avg Rating" }
                ];
            case 'company':
                return [
                    { number: "45", label: "Properties Managed" },
                    { number: "8", label: "Agents Active" },
                    { number: "$2.4M", label: "Total Asset Value" }
                ];
            case 'admin':
                return [
                    { number: "1,204", label: "Total Users" },
                    { number: "340", label: "Active Listings" },
                    { number: "98%", label: "System Uptime" }
                ];
            case 'renter':
            default:
                return [
                    { number: "12", label: "Properties Viewed" },
                    { number: "5", label: "Saved Listings" },
                    { number: "2", label: "Scheduled Visits" }
                ];
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-primary)' }}>

            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'var(--color-primary-light)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
                <Link to="/" className="logo" style={{ display: 'block', marginBottom: '3rem' }}>
                    Luxe<span className="text-accent">Estate</span>
                </Link>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {getSidebarItems(role).map(item => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => item.link ? window.location.href = item.link : setActiveTab(item.id)}
                        />
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Logged in as</div>
                        <div style={{ textTransform: 'capitalize', color: 'var(--color-accent)', fontWeight: 'bold' }}>{role}</div>
                    </div>
                    <button onClick={handleLogout} style={{ ...sidebarItemStyle, color: 'var(--color-error)', width: '100%', justifyContent: 'flex-start' }}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', color: 'white' }}>Welcome back, <span className="text-accent">{user?.name || 'User'}</span></h1>
                    {(role === 'landlord' || role === 'company') && (
                        <button className="btn btn-primary" style={{ gap: '0.5rem' }}>
                            <FaPlus size={12} /> List New Property
                        </button>
                    )}
                </header>

                {/* Dashboard Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                    {getStats(role).map((stat, idx) => (
                        <StatCard key={idx} number={stat.number} label={stat.label} />
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ background: 'var(--color-primary-light)', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {activeTab === 'overview' && (
                        <>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Recent Activity</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* MOCK DATA: This entire activity feed is hardcoded for demonstration. Replace with an API call to /api/activity */}
                                {role === 'renter' && (
                                    <>
                                        <ActivityItem text="You viewed 'Midnight Villa'" time="2 hours ago" />
                                        <ActivityItem text="Saved 'Gold Coast Penthouse' to wishlist" time="1 day ago" />
                                    </>
                                )}
                                {(role === 'landlord' || role === 'company') && (
                                    <>
                                        <ActivityItem text="New inqiury for 'Seaside Manor'" time="30 mins ago" isHighlight />
                                        <ActivityItem text="Listing 'Downtown Loft' updated" time="2 hours ago" />
                                    </>
                                )}
                                {role === 'admin' && (
                                    <>
                                        <ActivityItem text="New user registration: Agent Smith" time="5 mins ago" />
                                        <ActivityItem text="System backup completed" time="1 hour ago" />
                                    </>
                                )}
                                <ActivityItem text="Message sent to support" time="3 days ago" />
                            </div>
                        </>
                    )}

                    {activeTab === 'notifications' && (
                        <>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Notifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* MOCK DATA: Notifications should be fetched from /api/notifications */}
                                <ActivityItem text="System: Your profile was successfully updated" time="1 day ago" />
                                {role === 'renter' && <ActivityItem text="Price Drop! 'Seaside Manor' is now $2.5M" time="1 hour ago" isHighlight />}
                            </div>
                        </>
                    )}

                    {activeTab === 'messages' && (
                        <>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Messages</h3>
                            {/* MOCK DATA: Messages placeholder */}
                            <div style={{ color: 'var(--color-text-light)' }}>No new messages.</div>
                        </>
                    )}

                    {/* Placeholder for other tabs */}
                    {(activeTab !== 'overview' && activeTab !== 'notifications' && activeTab !== 'messages') && (
                        <div style={{ color: 'var(--color-text-light)', textAlign: 'center', padding: '2rem' }}>
                            {activeTab} feature coming soon...
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            ...sidebarItemStyle,
            background: active ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
            color: active ? 'var(--color-accent)' : 'var(--color-text-light)',
            borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent'
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
    width: '100%',
    fontFamily: 'inherit'
};

const StatCard = ({ number, label }) => (
    <div style={{ background: 'var(--color-primary-light)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{number}</div>
        <div style={{ color: 'var(--color-text-light)' }}>{label}</div>
    </div>
);

const ActivityItem = ({ text, time, isHighlight }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        borderLeft: isHighlight ? '3px solid var(--color-accent)' : 'none'
    }}>
        <div style={{ color: 'var(--color-text-main)' }}>{text}</div>
        <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>{time}</div>
    </div>
);

export default Dashboard;
