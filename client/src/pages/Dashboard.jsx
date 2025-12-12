import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";
import { authService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

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
            icon={<FaUser />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarItem
            icon={<FaHome />}
            label="My Properties"
            active={activeTab === "properties"}
            onClick={() => (window.location.href = "/properties")}
          />
          <SidebarItem
            icon={<FaBuilding />}
            label="Dev Requests"
            active={activeTab === "dev-requests"}
            onClick={() => (window.location.href = "/development-requests")}
          />
          <SidebarItem
            icon={<FaHeart />}
            label="Wishlist"
            active={activeTab === "wishlist"}
            onClick={() => (window.location.href = "/wishlist")}
          />
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
            Welcome back, <span className="text-accent">User</span>
          </h1>
          <button className="btn btn-primary" style={{ gap: "0.5rem" }}>
            <FaPlus size={12} /> List New Property
          </button>
        </header>

        {/* Dashboard Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          <StatCard number="12" label="Properties Viewed" />
          <StatCard number="5" label="Saved Listings" />
          <StatCard number="2" label="Scheduled Visits" />
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
                <ActivityItem
                  text="Price Drop! 'Seaside Manor' is now $2.5M (was $2.8M)"
                  time="1 hour ago"
                  isHighlight
                />
                <ActivityItem
                  text="New Inquiry: Someone is interested in your listing"
                  time="5 hours ago"
                />
                <ActivityItem
                  text="System: Your profile was successfully updated"
                  time="1 day ago"
                />
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
