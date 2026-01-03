import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  FaListAlt,
} from "react-icons/fa";
import { authService, notificationService, dashboardService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/common/Sidebar";
import UserProfileCard from "../components/users/UserProfileCard";

const Dashboard = () => {
  const { user, logout, loading, isLandlord, isTenant, isCompany } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          setStatsLoading(true);
          const response = await dashboardService.getStats();
          setStats(response.data?.data || {});
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error);
        } finally {
          setStatsLoading(false);
        }
      }
    };
    fetchStats();
  }, [user]);

  // Sync activeTab with URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (activeTab === "notifications") {
      const fetchNotifications = async () => {
        try {
          console.log("Dashboard: fetching notifications...");
          const response = await notificationService.getUserNotifications();
          console.log("Dashboard: fetched notifications:", response.data);
          setNotifications(response.data);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();
    }
  }, [activeTab]);


  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-primary)',
        color: 'white'
      }}>
        Loading...
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-primary)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Please log in to access the dashboard</h2>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-primary)",
      }}
    >
      {/* Reusable Sidebar Component */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main style={{ flex: 1, padding: "3rem" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "3rem",
          }}
        >
          <h1 style={{ fontFamily: "var(--font-heading)", color: "white" }}>
            Welcome back, <span className="text-accent">{user?.name || 'User'}</span>
            <span style={{
              fontSize: "0.8rem",
              background: "rgba(212, 175, 55, 0.2)",
              padding: "0.2rem 0.6rem",
              borderRadius: "12px",
              marginLeft: "1rem",
              color: "var(--color-accent)",
              border: "1px solid rgba(212, 175, 55, 0.4)"
            }}>
              {user?.role?.toUpperCase()}
            </span>
          </h1>
          <button
            className="btn btn-primary"
            style={{ gap: "0.5rem", display: 'flex', alignItems: 'center' }}
            onClick={handleLogout}
          >
            <FaSignOutAlt size={12} /> Logout
          </button>
        </header>

        {/* Dashboard Stats - Role Based */}
        {activeTab !== 'settings' && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            {isTenant() && (
              <>
                <StatCard number={statsLoading ? "..." : stats.savedListings || 0} label="Saved Listings" />
                <StatCard number={statsLoading ? "..." : stats.unreadMessages || 0} label="Unread Messages" />
                <StatCard number={statsLoading ? "..." : stats.myBids || 0} label="Active Bids" />
              </>
            )}

            {isLandlord() && (
              <>
                <StatCard number={statsLoading ? "..." : stats.activeListings || 0} label="Active Listings" />
                <StatCard number={statsLoading ? "..." : stats.totalInquiries || 0} label="New Inquiries" />
                <StatCard number={statsLoading ? "..." : stats.pendingBids || 0} label="Pending Bids" />
                <StatCard number={statsLoading ? "..." : stats.boostedListings || 0} label="Boosted Listings" />
              </>
            )}

            {isCompany() && (
              <>
                <StatCard number={statsLoading ? "..." : stats.activeProjects || 0} label="Active Projects" />
                <StatCard number={statsLoading ? "..." : stats.unitsAvailable || 0} label="Units Available" />
                <StatCard number={statsLoading ? "..." : stats.pendingBids || 0} label="Pending Bids" />
              </>
            )}
          </div>
        )}

        {/* Recent Activity Section */}
        {/* Content Area */}
        <div
          style={{
            background: "var(--color-primary-light)",
            borderRadius: "12px",
            padding: "2rem",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {activeTab === "overview" && (
            <>
              <h3
                style={{
                  color: "white",
                  marginBottom: "1.5rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                My Profile
              </h3>
              <UserProfileCard user={user} isOwnProfile={true} />
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <h3
                style={{
                  color: "white",
                  marginBottom: "1.5rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Notifications
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <ActivityItem
                      key={notif._id}
                      text={notif.message}
                      time={new Date(notif.createdAt).toLocaleString()}
                      isHighlight={!notif.isRead}
                      link={notif.relatedId && notif.type !== 'general' ? `/property/${notif.relatedId}` : null}
                    />
                  ))
                ) : (
                  <div style={{ color: "var(--color-text-light)" }}>
                    No notifications yet.
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "messages" && (
            <>
              <h3
                style={{
                  color: "white",
                  marginBottom: "1.5rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Messages
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                    borderLeft: "3px solid var(--color-accent)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      Sarah Jenkins (Agent)
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-light)",
                      }}
                    >
                      2 mins ago
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--color-text-light)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Hi! I'm available for a viewing of the Penthouse tomorrow at
                    2 PM.
                  </p>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>John Doe (Buyer)</span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-light)",
                      }}
                    >
                      1 day ago
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--color-text-light)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Is the price negotiable for the Downtown Loft?
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== "overview" &&
            activeTab !== "notifications" &&
            activeTab !== "messages" && (
              <div
                style={{
                  color: "var(--color-text-light)",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                Feature coming soon...
              </div>
            )}
        </div>
      </main>
    </div>
  );
};



const StatCard = ({ number, label }) => (
  <div
    style={{
      background: "var(--color-primary-light)",
      padding: "1.25rem",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <div
      style={{
        fontSize: "2rem",
        fontWeight: 700,
        color: "var(--color-accent)",
        marginBottom: "0.25rem",
      }}
    >
      {number}
    </div>
    <div style={{ color: "var(--color-text-light)", fontSize: "0.85rem" }}>{label}</div>
  </div>
);

const ActivityItem = ({ text, time, isHighlight, link }) => {
  const content = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
        background: "rgba(0,0,0,0.2)",
        borderRadius: "8px",
        borderLeft: isHighlight ? "3px solid var(--color-accent)" : "none",
        cursor: link ? "pointer" : "default",
        transition: "background 0.2s",
      }}
      className={link ? "hover:bg-black/40" : ""}
    >
      <div style={{ color: "var(--color-text-main)" }}>{text}</div>
      <div style={{ color: "var(--color-text-light)", fontSize: "0.85rem" }}>
        {time}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} style={{ display: 'block', textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default Dashboard;
