import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FaSearch,
  FaArrowRight,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaStar,
} from "react-icons/fa";
import { propertyService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const HomePage = () => {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 200]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch properties from our MERN-aligned service
    const fetchProperties = async () => {
      try {
        const response = await propertyService.getAll();
        // Handle API response format: { success: true, data: [...] }
        const propertiesData = response.data?.data || response.data || [];
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      } catch (error) {
        console.error("Failed to fetch properties", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="home-page" style={{ background: "var(--color-primary)" }}>
      <Navbar variant="transparent" />

      {/* Cinematic Hero Section */}
      <section
        className="hero-section"
        style={{
          position: "relative",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          className="hero-bg"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url("https://images.unsplash.com/photo-1622372738946-a2e5330eef76?q=80&w=2574&auto=format&fit=crop")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4)",
            zIndex: 0,
          }}
        ></div>

        {/* Subtle Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(to top, var(--color-primary), transparent)",
            zIndex: 1,
          }}
        ></div>

        <motion.div
          className="container hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            width: "100%",
            maxWidth: "900px",
            y: yHero,
          }}
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "10px" }}
            animate={{ opacity: 1, letterSpacing: "3px" }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              textTransform: "uppercase",
              color: "var(--color-accent)",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            Exclusive Living
          </motion.div>
          <h1
            style={{
              fontSize: "clamp(3rem, 5vw, 5rem)",
              marginBottom: "2rem",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            Curating the World's <br />{" "}
            <span style={{ fontStyle: "italic", fontFamily: "serif" }}>
              Finest Properties
            </span>
          </h1>

          {/* Luxury Search Bar */}
          <motion.div
            className="search-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "0.75rem",
              borderRadius: "8px",
              display: "flex",
              gap: "0.5rem",
              maxWidth: "800px",
              margin: "0 auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <input
              type="text"
              placeholder="Search by location, property type..."
              style={darkInputStyle}
            />
            <button className="btn btn-primary" style={{ minWidth: "120px" }}>
              Search
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Recommended for You (Logged In) */}
      {user && (
        <section
          style={{
            padding: "6rem 0 2rem 0",
            background: "var(--color-primary)",
          }}
        >
          <div className="container">
            <h4
              className="text-accent"
              style={{
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              {user.role === "landlord"
                ? "Market Insights"
                : "Recommended For You"}
            </h4>
            <div
              style={{
                background: "var(--color-primary-light)",
                padding: "2rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p style={{ color: "white" }}>
                {/* MOCK DATA: This recommendation text is hardcoded based on role. Replace with dynamic AI-driven recommendations or stats. */}
                {user.role === "renter" &&
                  "Based on your search for 'Villas', check out these new listings in Beverly Hills."}
                {user.role === "landlord" &&
                  "Rental demand in New York has increased by 15% this week."}
                {user.role === "company" &&
                  "Your agency performance is in the top 10% this month."}
                {user.role === "admin" &&
                  "System health is optimal. No critical alerts."}
                {!["renter", "landlord", "company", "admin"].includes(
                  user.role
                ) && "Welcome back! Check out the latest properties."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection */}
      <section
        id="featured"
        className="featured-section"
        style={{ padding: "8rem 0", background: "var(--color-primary)" }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "4rem",
            }}
          >
            <div>
              <h4
                className="text-accent"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                The Collection
              </h4>
              <h2 style={{ fontSize: "3rem", color: "var(--color-text-main)" }}>
                Featured Residences
              </h2>
            </div>
            <button className="btn btn-outline">View All Listings</button>
          </div>

          {loading ? (
            <div style={{ color: "white", textAlign: "center" }}>
              Loading Collection...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: "2.5rem",
              }}
            >
              {properties.map((prop, idx) => (
                <PropertyCard key={prop._id || prop.id || idx} data={prop} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition / Services */}
      <section
        id="services"
        style={{ padding: "8rem 0", background: "var(--color-primary-light)" }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "3rem", marginBottom: "2rem" }}>
              Experience the{" "}
              <span className="text-accent" style={{ fontStyle: "italic" }}>
                Extraordinary
              </span>
            </h2>
            <p
              style={{
                color: "var(--color-text-light)",
                fontSize: "1.1rem",
                marginBottom: "2rem",
                lineHeight: "1.8",
              }}
            >
              We don't just find you a house; we curate a lifestyle. Our team of
              elite real estate professionals provides an unparalleled level of
              service, ensuring your journey is as exceptional as your
              destination.
            </p>
            <ul style={{ listStyle: "none", display: "grid", gap: "1.5rem" }}>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: "1.1rem",
                }}
              >
                <FaStar className="text-accent" /> Private Concierge Service
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: "1.1rem",
                }}
              >
                <FaStar className="text-accent" /> Exclusive Off-Market Listings
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: "1.1rem",
                }}
              >
                <FaStar className="text-accent" /> Global Investment Portfolio
                Management
              </li>
            </ul>
          </div>
          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop"
              alt="Luxury Interior"
              style={{
                width: "100%",
                borderRadius: "4px",
                filter: "brightness(0.9)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-2rem",
                right: "-2rem",
                border: "2px solid var(--color-accent)",
                width: "100%",
                height: "100%",
                zIndex: -1,
                borderRadius: "4px",
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* Reusable Footer Component */}
      <Footer />
    </div>
  );
};

// Sub-components
const PropertyCard = ({ data, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -10 }}
    style={{
      background: "var(--color-primary-light)",
      borderRadius: "4px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <div style={{ height: "300px", overflow: "hidden", position: "relative" }}>
      <img
        src={data.image}
        alt={data.title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.7s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
          padding: "2rem 1.5rem 1rem 1.5rem",
        }}
      >
        <div
          style={{
            color: "var(--color-accent)",
            fontWeight: 600,
            fontSize: "1.25rem",
            marginBottom: "0.25rem",
          }}
        >
          {data.price}
        </div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          {data.title}
        </h3>
      </div>
    </div>
    <div style={{ padding: "1.5rem" }}>
      <p
        style={{
          color: "var(--color-text-light)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.9rem",
        }}
      >
        <FaMapMarkerAlt className="text-accent" /> {data.location}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          color: "var(--color-text-main)",
          fontSize: "0.9rem",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaBed className="text-accent" /> {data.beds} Beds
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaBath className="text-accent" /> {data.baths} Baths
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <FaRulerCombined className="text-accent" /> {data.sqft}
        </span>
      </div>
    </div>
  </motion.div>
);

const darkInputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  background: "transparent",
  color: "white",
};

export default HomePage;
