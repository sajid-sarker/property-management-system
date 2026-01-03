import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (user) {
                const search = location.search; // Preserve query params
                if (user.role === 'tenant') navigate(`/dashboard/tenant${search}`);
                else if (user.role === 'landlord') navigate(`/dashboard/landlord${search}`);
                else if (user.role === 'company') navigate(`/dashboard/company${search}`);
                else navigate('/'); // Fallback
            } else {
                navigate('/login');
            }
        }
    }, [user, loading, navigate, location]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--color-primary)',
            color: 'white'
        }}>
            Redirecting...
        </div>
    );
};

export default DashboardRedirect;
