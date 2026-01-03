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
  FaCheck,
  FaHardHat,
} from "react-icons/fa";
import { authService, notificationService, dashboardService, projectService } from "../services/api";
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
  const [underDevProjects, setUnderDevProjects] = useState([]);
  const [underDevLoading, setUnderDevLoading] = useState(false);
  const [acceptingBid, setAcceptingBid] = useState(null);
  const [acceptedBids, setAcceptedBids] = useState(new Set());


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

  // Fetch under development projects for landlords
  useEffect(() => {
    const fetchUnderDevProjects = async () => {
      if (user && isLandlord() && activeTab === "overview") {
        try {
          setUnderDevLoading(true);
          const response = await projectService.getUnderDevelopment();
          setUnderDevProjects(response.data?.data || []);
        } catch (error) {
          console.error("Failed to fetch under development projects:", error);
        } finally {
          setUnderDevLoading(false);
        }
      }
    };
    fetchUnderDevProjects();
  }, [user, activeTab]);

  // Handle accepting a bid (landlord)
  const handleAcceptBid = async (notification) => {
    if (!notification.projectId || !notification.bidId) {
      // Use relatedId as bidId if bidId not set
      if (!notification.relatedId) {
        alert("Cannot accept this bid - missing bid reference");
        return;
      }
    }

    const bidId = notification.bidId || notification.relatedId;

    if (!window.confirm("Are you sure you want to accept this proposal? This will reject all other bids.")) {
      return;
    }

    setAcceptingBid(notification._id);
    try {
      // We need to get the project ID from the bid
      // First, let's try to get it from notification
      let projectId = notification.projectId;

      if (!projectId) {
        // If projectId not in notification, we need to fetch the bid to get project
        alert("Unable to accept - project reference missing. Please try refreshing.");
        setAcceptingBid(null);
        return;
      }

      await projectService.acceptBid(projectId, bidId);

      // Mark this bid as accepted so the button won't show again
      setAcceptedBids(prev => new Set([...prev, notification._id]));

      alert("Proposal accepted successfully!");

      // Refresh notifications
      const response = await notificationService.getUserNotifications();
      setNotifications(response.data);

      // Refresh under development projects
      const devResponse = await projectService.getUnderDevelopment();
      setUnderDevProjects(devResponse.data?.data || []);
    } catch (error) {
      console.error("Failed to accept bid:", error);
      alert(error.response?.data?.message || "Failed to accept proposal. Please try again.");
    } finally {
      setAcceptingBid(null);
    }
  };

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

              {/* Under Development Properties Section - Landlords Only */}
              {isLandlord() && (
                <div style={{ marginTop: "2.5rem" }}>
                  <h3
                    style={{
                      color: "white",
                      marginBottom: "1.5rem",
                      fontFamily: "var(--font-heading)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <FaHardHat style={{ color: "var(--color-accent)" }} />
                    Under Development Properties
                  </h3>

                  {underDevLoading ? (
                    <div style={{ color: "var(--color-text-light)", padding: "1rem" }}>
                      Loading...
                    </div>
                  ) : underDevProjects.length === 0 ? (
                    <div
                      style={{
                        padding: "2rem",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "12px",
                        textAlign: "center",
                        color: "var(--color-text-light)",
                      }}
                    >
                      No properties under development yet. Accept a proposal to get started!
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                      {underDevProjects.map((project) => (
                        <Link
                          key={project._id}
                          to={`/under-development/${project._id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <div
                            style={{
                              padding: "1.5rem",
                              background: "rgba(0,0,0,0.2)",
                              borderRadius: "12px",
                              border: "1px solid rgba(212, 175, 55, 0.2)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            className="hover-scale"
                          >
                            <h4 style={{ color: "var(--color-accent)", marginBottom: "0.5rem" }}>
                              {project.title}
                            </h4>
                            <p style={{ color: "var(--color-text-light)", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                              {project.location || project.address?.city || "Location not specified"}
                            </p>
                            {project.acceptedBid && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  paddingTop: "0.75rem",
                                  borderTop: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <span style={{ color: "var(--color-text-light)", fontSize: "0.85rem" }}>
                                  Accepted Amount:
                                </span>
                                <span style={{ color: "#4ade80", fontWeight: 600 }}>
                                  ${project.acceptedBid.amount?.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {project.selectedCompany && (
                              <div style={{ color: "var(--color-text-light)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                                Company: {project.selectedCompany.name}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                    <div
                      key={notif._id}
                      style={{
                        padding: "1rem 1.25rem",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "8px",
                        borderLeft: !notif.isRead ? "3px solid var(--color-accent)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "var(--color-text-main)", marginBottom: "0.5rem" }}>
                            {notif.message}
                          </div>
                          <div style={{ color: "var(--color-text-light)", fontSize: "0.85rem" }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Accept Proposal Button for bid_received notifications */}
                        {notif.type === "bid_received" && isLandlord() && !acceptedBids.has(notif._id) && (
                          <button
                            onClick={() => handleAcceptBid(notif)}
                            disabled={acceptingBid === notif._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              padding: "0.5rem 1rem",
                              background: "linear-gradient(135deg, #4ade80, #22c55e)",
                              border: "none",
                              borderRadius: "6px",
                              color: "white",
                              cursor: acceptingBid === notif._id ? "wait" : "pointer",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              opacity: acceptingBid === notif._id ? 0.7 : 1,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <FaCheck />
                            {acceptingBid === notif._id ? "Accepting..." : "Accept Proposal"}
                          </button>
                        )}
                      </div>
                    </div>
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
