import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaHome,
  FaArrowLeft 
} from "react-icons/fa";
import { authService, propertyService } from "../services/api";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PropertyCard from "../components/properties/PropertyCard";

/**
 * UserProfilePage
 * Public profile page showing user info and their property listings
 */
const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const userResponse = await authService.getProfile(userId);
        if (userResponse.data?.success && userResponse.data?.data) {
          setUser(userResponse.data.data);
        } else {
          setError("User not found");
          return;
        }

        // Fetch all properties and filter by this user
        const propertiesResponse = await propertyService.getAll();
        const allProperties = propertiesResponse.data?.data || propertiesResponse.data || [];
        
        // Filter properties owned by this user
        const userProperties = allProperties.filter(p => {
          const landlordId = p.landlord?._id || p.landlord;
          return landlordId && landlordId.toString() === userId;
        });
        
        setProperties(userProperties);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'landlord':
        return { background: 'rgba(212, 175, 55, 0.2)', color: '#d4af37' };
      case 'company':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
      default:
        return { background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af' };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: "var(--color-primary)", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ background: "var(--color-primary)", minHeight: "100vh" }}>
        <Navbar variant="solid" />
        <div style={{ 
          padding: "8rem 2rem",
          textAlign: "center",
          color: "white"
        }}>
          <h2 style={{ marginBottom: "1rem" }}>{error || "User not found"}</h2>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadgeStyle(user.role);
  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=d4af37&color=0a0a0f&size=200`;

  return (
    <div style={{ background: "var(--color-primary)", minHeight: "100vh" }}>
      <Navbar variant="solid" />

      <div className="container" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
        {/* Back Button */}
        <Link 
          to="/properties"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-text-light)",
            textDecoration: "none",
            marginBottom: "2rem",
            fontSize: "0.9rem",
          }}
        >
          <FaArrowLeft /> Back to Properties
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            gap: "3rem",
            alignItems: "flex-start",
            marginBottom: "4rem",
            flexWrap: "wrap",
          }}
        >
          {/* Profile Picture */}
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: `url("${user.image || defaultImage}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "4px solid var(--color-accent)",
              flexShrink: 0,
            }}
          />

          {/* Profile Info */}
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}>
              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2.5rem",
                color: "white",
                margin: 0,
              }}>
                {user.name}
              </h1>
              <span style={{
                ...roleBadge,
                padding: "0.35rem 1rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "uppercase",
              }}>
                {user.role}
              </span>
            </div>

            {/* Bio */}
            <p style={{
              color: "var(--color-text-light)",
              fontSize: "1.1rem",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
              maxWidth: "600px",
            }}>
              {user.description || "No description provided."}
            </p>

            {/* Contact Info */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              {user.email && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "var(--color-text-light)",
                }}>
                  <FaEnvelope style={{ color: "var(--color-accent)" }} />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phoneNumber && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "var(--color-text-light)",
                }}>
                  <FaPhone style={{ color: "var(--color-accent)" }} />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "var(--color-text-light)",
              }}>
                <FaCalendar style={{ color: "var(--color-accent)" }} />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Properties Section */}
        {(user.role === 'landlord' || user.role === 'company') && (
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "2rem",
            }}>
              <FaHome style={{ color: "var(--color-accent)", fontSize: "1.5rem" }} />
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                color: "white",
                margin: 0,
              }}>
                Properties by {user.name}
              </h2>
              <span style={{
                background: "rgba(212, 175, 55, 0.2)",
                color: "var(--color-accent)",
                padding: "0.25rem 0.75rem",
                borderRadius: "12px",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}>
                {properties.length}
              </span>
            </div>

            {properties.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
              }}>
                {properties.map((prop, index) => (
                  <PropertyCard 
                    key={prop._id || prop.id} 
                    data={prop} 
                    index={index} 
                  />
                ))}
              </div>
            ) : (
              <div style={{
                background: "var(--color-primary-light)",
                padding: "3rem",
                borderRadius: "12px",
                textAlign: "center",
                color: "var(--color-text-light)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <FaHome style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }} />
                <p>No properties listed yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
