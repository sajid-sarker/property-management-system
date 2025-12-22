import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { authService, notificationService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user, logout, loading, isLandlord, isTenant, isCompany, isAgent } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);

  React.useEffect(() => {
    if (activeTab === "notifications") {
      const fetchNotifications = async () => {
        try {
          const response = await notificationService.getUserNotifications();
          setNotifications(response.data);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      };
      fetchNotifications();
    }
  }, [activeTab]);

  // Determine if user is a landlord
  // Determine if user is a landlord - logic moved to useAuth hook

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
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: "var(--color-primary-light)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
        }}
      >
        <Link
          to="/"
          className="logo"
          style={{ display: "block", marginBottom: "3rem" }}
        >
          Luxe<span className="text-accent">Estate</span>
        </Link>

        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <SidebarItem
            icon={<FaSearch />}
            label="Search"
            active={false} // Always navigates to /search
            onClick={() => navigate("/search")}
          />

          <SidebarItem
            icon={<FaUser />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />

          {(isLandlord() || isAgent()) && (
            <>
              <SidebarItem
                icon={<FaHome />}
                label="My Properties"
                active={activeTab === "properties"}
                onClick={() => navigate("/properties")}
              />
              <SidebarItem
                icon={<FaPlus />}
                label="Add Property"
                active={activeTab === "add-property"}
                onClick={() => navigate("/add-property")}
              />
              <SidebarItem
                icon={<FaRocket />}
                label="Boosted Listings"
                active={activeTab === "boosted"}
                onClick={() => setActiveTab("boosted")}
              />
            </>
          )}

          {isCompany() && (
            <>
              <SidebarItem
                icon={<FaHome />}
                label="My Properties"
                active={activeTab === "properties"}
                onClick={() => navigate("/properties")}
              />
              <SidebarItem
                icon={<FaBuilding />}
                label="Dev Requests"
                active={activeTab === "dev-requests"}
                onClick={() => navigate("/development-requests")}
              />
            </>
          )}

          {isTenant() && (
            <>
              <SidebarItem
                icon={<FaHeart />}
                label="Wishlist"
                active={activeTab === "wishlist"}
                onClick={() => navigate("/wishlist")}
              />
              <SidebarItem
                icon={<FaHome />}
                label="Browse Properties"
                active={activeTab === "browse"}
                onClick={() => navigate("/properties")}
              />
            </>
          )}
          <SidebarItem
            icon={<FaComments />}
            label="Messages"
            active={activeTab === "messages"}
            onClick={() => setActiveTab("messages")}
          />
          <SidebarItem
            icon={<FaBell />}
            label="Notifications"
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          />
          <SidebarItem
            icon={<FaCog />}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </nav>

        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
          <button
            onClick={handleLogout}
            style={{
              ...sidebarItemStyle,
              color: "var(--color-error)",
              width: "100%",
              justifyContent: "flex-start",
            }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

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
          {(isLandlord() || isAgent() || isCompany()) && (
            <button
              className="btn btn-primary"
              style={{ gap: "0.5rem", display: 'flex', alignItems: 'center' }}
              onClick={() => navigate('/add-property')}
            >
              <FaPlus size={12} /> List New Property
            </button>
          )}
          {isTenant() && (
            <button
              className="btn btn-primary"
              style={{ gap: "0.5rem", display: 'flex', alignItems: 'center' }}
              onClick={() => navigate('/properties')}
            >
              <FaHome size={12} /> Browse Properties
            </button>
          )}
        </header>

        {/* Dashboard Stats - Role Based */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {isTenant() && (
            <>
              <StatCard number="12" label="Properties Viewed" />
              <StatCard number="5" label="Saved Listings" />
              <StatCard number="2" label="Scheduled Visits" />
            </>
          )}

          {(isLandlord() || isAgent()) && (
            <>
              <StatCard number="3" label="Active Listings" />
              <StatCard number="28" label="Total Views" />
              <StatCard number="4" label="New Inquiries" />
              <StatCard number="2" label="Boosted Listings" />
            </>
          )}

          {isCompany() && (
            <>
              <StatCard number="2" label="Active Projects" />
              <StatCard number="15" label="Units Available" />
              <StatCard number="8" label="Pending Bids" />
            </>
          )}
        </div>

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
                Recent Activity
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <ActivityItem
                  text="You viewed 'Midnight Villa'"
                  time="2 hours ago"
                />
                <ActivityItem
                  text="Saved 'Gold Coast Penthouse' to wishlist"
                  time="1 day ago"
                />
                <ActivityItem
                  text="Message sent to Agent Sarah Jenkins"
                  time="3 days ago"
                />
              </div>
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

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      ...sidebarItemStyle,
      background: active ? "rgba(212, 175, 55, 0.1)" : "transparent",
      color: active ? "var(--color-accent)" : "var(--color-text-light)",
      borderLeft: active
        ? "3px solid var(--color-accent)"
        : "3px solid transparent",
    }}
  >
    {icon} {label}
  </button>
);

const sidebarItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem",
  borderRadius: "0 8px 8px 0",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "all 0.2s",
  textAlign: "left",
};

const StatCard = ({ number, label }) => (
  <div
    style={{
      background: "var(--color-primary-light)",
      padding: "2rem",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <div
      style={{
        fontSize: "3rem",
        fontWeight: 700,
        color: "var(--color-accent)",
        marginBottom: "0.5rem",
      }}
    >
      {number}
    </div>
    <div style={{ color: "var(--color-text-light)" }}>{label}</div>
  </div>
);

const ActivityItem = ({ text, time, isHighlight }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "1rem",
      background: "rgba(0,0,0,0.2)",
      borderRadius: "8px",
      borderLeft: isHighlight ? "3px solid var(--color-accent)" : "none",
    }}
  >
    <div style={{ color: "var(--color-text-main)" }}>{text}</div>
    <div style={{ color: "var(--color-text-light)", fontSize: "0.85rem" }}>
      {time}
    </div>
  </div>
);

export default Dashboard;
