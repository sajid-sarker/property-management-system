import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { propertyService, propertyBidService, messageService, wishlistService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheck,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaHeart,
  FaRegHeart,
  FaRocket,
} from "react-icons/fa";
import ReviewSection from "../components/properties/ReviewSection";
import BidHistorySection from "../components/properties/BidHistorySection";
import ErrorBoundary from "../components/common/ErrorBoundary";
import BoostPropertyModal from "../components/properties/BoostPropertyModal";
import Navbar from "../components/common/Navbar";

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Fetch property by ID from backend
        const response = await propertyService.getById(id);
        console.log("PropertyDetailsPage - Raw API Response:", response);
        // Handle both { success: true, data: property } and direct property response
        const propertyData = response.data?.data || response.data;
        console.log("PropertyDetailsPage - Extracted propertyData:", propertyData);
        if (propertyData && typeof propertyData === 'object' && propertyData._id) {
          setProperty(propertyData);
        } else {
          console.error("PropertyDetailsPage - Invalid property data:", propertyData);
        }
      } catch (error) {
        console.error("Failed to fetch property", error);
        // Fallback: try to get from all properties if getById fails
        try {
          const allResponse = await propertyService.getAll();
          // Handle both response structures
          const allData = allResponse.data?.data || allResponse.data || [];
          const found = (Array.isArray(allData) ? allData : []).find(
            (p) => p._id === id || p.propertyId === id || String(p.id) === id
          );
          if (found) setProperty(found);
        } catch (e) {
          console.error("Fallback also failed", e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Check if property is in user's wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && id) {
        try {
          const response = await wishlistService.check(id);
          setInWishlist(response.data?.inWishlist || false);
        } catch (error) {
          console.error("Failed to check wishlist status:", error);
        }
      }
    };
    checkWishlistStatus();
  }, [user, id]);

  // Toggle wishlist
  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Please log in to add to wishlist");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.remove(id);
        setInWishlist(false);
      } else {
        await wishlistService.add(id);
        setInWishlist(true);
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      alert(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          background: "var(--color-primary)",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Loading Details...
      </div>
    );
  if (!property)
    return (
      <div
        style={{
          background: "var(--color-primary)",
          height: "100vh",
          padding: "5rem",
          color: "white",
        }}
      >
        Property not found
      </div>
    );

  // Handle database field structures
  const imageUrl =
    property.image ||
    (property.images && property.images[0]) ||
    "https://via.placeholder.com/800x600?text=No+Image";
  const locationText =
    property.location ||
    (property.address &&
      `${property.address.street || ""}, ${property.address.city || ""}`) ||
    "Location N/A";

  // Display price based on listing type
  const priceText = property.listingType === 'sell'
    ? `$${(property.currentPrice || property.startingPrice || property.price)?.toLocaleString()}`
    : `$${property.price?.toLocaleString()}/mo`;

  const typeText = property.listingType === 'sell' ? 'For Sale' : 'For Rent';

  // Check if current user is the landlord (owner)
  const landlordId = property.landlord?._id || property.landlord;
  const userId = user?._id || user?.userId || user?.id;
  const isOwner = landlordId && userId && landlordId.toString() === userId.toString();

  // Handle placing a bid
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to place a bid');
      navigate('/login');
      return;
    }
    if (!bidAmount || bidAmount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    setSubmittingBid(true);
    try {
      await propertyBidService.placeBid(id, {
        bidAmount: parseInt(bidAmount),
        message: bidMessage
      });
      alert('Bid placed successfully!');
      setBidAmount('');
      setBidMessage('');
      // Refresh property to get updated currentPrice
      const response = await propertyService.getById(id);
      const propertyData = response.data?.data || response.data;
      if (propertyData) setProperty(propertyData);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--color-primary)",
        minHeight: "100vh",
        color: "var(--color-text-main)",
      }}
    >
      <Navbar variant="solid" />

      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "4rem" }}
      >
        {/* Image Gallery (Hero) */}
        <div
          style={{
            height: "60vh",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "3rem",
            position: "relative",
          }}
        >
          <img
            src={imageUrl}
            alt={property.title || "Property"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "2rem",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "3rem",
                    marginBottom: "0.5rem",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {property.title || "Untitled Property"}
                </h1>
                <p
                  style={{
                    fontSize: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-text-light)",
                  }}
                >
                  <FaMapMarkerAlt className="text-accent" /> {locationText}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                  }}
                >
                  {priceText}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {typeText}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "4rem",
          }}
        >
          {/* Main Content */}
          <div>
            <div
              style={{
                display: "flex",
                gap: "2rem",
                padding: "2rem",
                background: "var(--color-primary-light)",
                borderRadius: "8px",
                marginBottom: "2rem",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <FaBed
                  size={24}
                  className="text-accent"
                  style={{ marginBottom: "0.5rem" }}
                />
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  {property.beds} Bedrooms
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRight: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <FaBath
                  size={24}
                  className="text-accent"
                  style={{ marginBottom: "0.5rem" }}
                />
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  {property.baths} Bathrooms
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <FaRulerCombined
                  size={24}
                  className="text-accent"
                  style={{ marginBottom: "0.5rem" }}
                />
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                  {property.sqft}
                </div>
              </div>
            </div>

            <h2
              style={{
                marginBottom: "1.5rem",
                fontFamily: "var(--font-heading)",
              }}
            >
              Description
            </h2>
            <p
              style={{
                lineHeight: "1.8",
                color: "var(--color-text-light)",
                marginBottom: "3rem",
              }}
            >
              Experience the epitome of luxury living in this stunning residence
              located in the heart of {property.location}. Meticulously designed
              with premium finishes and state-of-the-art amenities, this home
              offers an unparalleled blend of sophistication and comfort.
              Features include floor-to-ceiling windows, a gourmet chef's
              kitchen, and expansive outdoor living spaces perfect for
              entertaining.
            </p>

            <h2
              style={{
                marginBottom: "1.5rem",
                fontFamily: "var(--font-heading)",
              }}
            >
              Amenities
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
            >
              {[
                "Smart Home System",
                "Infinity Pool",
                "Private Gym",
                "Wine Cellar",
                "24/7 Security",
                "Home Theater",
                "Spa & Sauna",
                "Rooftop Terrace",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    color: "var(--color-text-light)",
                  }}
                >
                  <FaCheck className="text-accent" size={12} /> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Bidding Section (Only for sale listings, not for owner) */}
          {property.listingType === 'sell' && property.isBiddable && !isOwner && (
            <div
              style={{
                marginTop: "4rem",
                padding: "2rem",
                background: "var(--color-primary-light)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <h2
                style={{
                  marginBottom: "1.5rem",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Place a Bid
              </h2>
              <form onSubmit={handlePlaceBid}>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "var(--color-text-light)",
                        marginBottom: "0.5rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      Your Bid Amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingBid}
                  >
                    {submittingBid ? 'Submitting...' : 'Submit Bid'}
                  </button>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--color-text-light)",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Message (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Add a message to the seller..."
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </form>
              <p
                style={{
                  marginTop: "1rem",
                  color: "var(--color-text-light)",
                  fontSize: "0.9rem",
                }}
              >
                * Current price:{" "}
                <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                  ${(property.currentPrice || property.startingPrice)?.toLocaleString()}
                </span>
              </p>
            </div>
          )}

          {/* Bid History Section (For Sell listings) */}
          <BidHistorySection
            propertyId={property._id || id}
            isOwner={isOwner}
            listingType={property.listingType}
            onBidAccepted={() => {
              // Refresh property when bid is accepted
              propertyService.getById(id).then(res => {
                const data = res.data?.data || res.data;
                if (data) setProperty(data);
              });
            }}
          />

          {/* Reviews Section (Feature 4 of Requirement 3) */}
          <ReviewSection
            propertyId={property._id || id}
            landlordId={landlordId}
            initialReviews={property.reviews || []}
            initialAverageRating={property.averageRating || 0}
          />
        </div>

        {/* Sidebar / Contact Landlord */}
        <div>
          <div
            style={{
              background: "var(--color-primary-light)",
              padding: "2rem",
              borderRadius: "12px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              position: "sticky",
              top: "100px",
            }}
          >
            <h3
              style={{
                marginBottom: "1.5rem",
                fontFamily: "var(--font-heading)",
                color: "white",
              }}
            >
              Contact Landlord
            </h3>
            
            {/* Landlord Info */}
            {property.landlord && (
              <Link
                to={`/user/${property.landlord._id || property.landlord}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "2rem",
                  textDecoration: "none",
                  color: "inherit",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                <img
                  src={property.landlord.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.landlord.name || 'Owner')}&background=d4af37&color=0a0a0f`}
                  alt="Landlord"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "2px solid var(--color-accent)",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "white" }}>
                    {property.landlord.name || "Property Owner"}
                  </div>
                  <div
                    style={{
                      color: "var(--color-text-light)",
                      fontSize: "0.9rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {property.landlord.role || "Landlord"}
                  </div>
                  <div
                    style={{
                      color: "var(--color-accent)",
                      fontSize: "0.8rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    View Profile →
                  </div>
                </div>
              </Link>
            )}

            {/* Message Form */}
            {user && property.landlord && property.landlord._id !== user._id && property.landlord._id !== user.id ? (
              <form
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const messageContent = e.target.message.value.trim();
                  if (!messageContent) {
                    alert("Please enter a message");
                    return;
                  }
                  try {
                    await messageService.send({
                      receiverId: property.landlord._id,
                      content: messageContent,
                      propertyId: property._id || id,
                    });
                    alert("Message sent to landlord!");
                    e.target.reset();
                  } catch (error) {
                    console.error("Failed to send message:", error);
                    console.error("Error response:", error.response?.data);
                    const errorMsg = error.response?.data?.message || error.message || "Unknown error";
                    alert(`Failed to send message: ${errorMsg}`);
                  }
                }}
              >
                <textarea
                  name="message"
                  placeholder={`Hi, I'm interested in "${property.title || 'this property'}"...`}
                  rows="4"
                  style={inputStyle}
                ></textarea>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  💬 Send Message
                </button>
              </form>
            ) : !user ? (
              <div style={{ textAlign: "center", color: "var(--color-text-light)" }}>
                <p style={{ marginBottom: "1rem" }}>Please log in to contact the landlord</p>
                <button
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                  onClick={() => navigate("/login")}
                >
                  Log In
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--color-text-light)" }}>
                <p style={{ marginBottom: "1rem" }}>This is your property listing.</p>
                {property.priority > 1 ? (
                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(212, 175, 55, 0.1)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      color: "#d4af37",
                      fontWeight: "600",
                    }}
                  >
                    <FaRocket /> Currently Boosted
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      background: "linear-gradient(135deg, #d4af37, #c5a028)",
                      color: "#0a0a0f",
                      fontWeight: "bold",
                      border: "none",
                    }}
                    onClick={() => setShowBoostModal(true)}
                  >
                    <FaRocket /> Boost Listing
                  </button>
                )}
              </div>
            )}

            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <button
                className="btn btn-primary"
                style={{ width: "100%", background: "var(--color-accent)", color: "black", fontWeight: "bold" }}
                onClick={async () => {
                  console.log("Interested button clicked!"); // DEBUG
                  try {
                    console.log("Calling markInterested for ID:", id); // DEBUG
                    await propertyService.markInterested(id);
                    console.log("markInterested call successful"); // DEBUG
                    alert("Interest marked! The owner has been notified.");
                  } catch (error) {
                    console.error("Error marking interest:", error);
                    alert(`Failed to mark interest: ${error.message || "Unknown error"}`);
                  }
                }}
              >
                👋 I'm Interested
              </button>

              {/* Add to Wishlist Button */}
              <button
                className="btn btn-outline"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  color: inWishlist ? "#e53e3e" : "var(--color-text-main)",
                  borderColor: inWishlist ? "#e53e3e" : "rgba(255,255,255,0.2)",
                }}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                {inWishlist ? <FaHeart /> : <FaRegHeart />}
                {wishlistLoading ? "Updating..." : inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>

              {/* View All Messages with Landlord */}
              {user && property.landlord && property.landlord._id !== user._id && property.landlord._id !== user.id && (
                <button
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                  onClick={() => navigate(`/messages?user=${property.landlord._id}`)}
                >
                  📨 View Conversation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Boost Modal for Property Owners */}
      <BoostPropertyModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        propertyId={property._id || id}
        landlordId={userId}
        onBoostComplete={(boostData) => {
          setShowBoostModal(false);
          // Optionally refresh the property data
          propertyService.getById(id).then(res => {
            const data = res.data?.data || res.data;
            if (data) setProperty(data);
          });
        }}
      />
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "0.875rem",
  background: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "4px",
  color: "white",
  outline: "none",
  fontFamily: "var(--font-body)",
};

// Wrapper component with ErrorBoundary
const PropertyDetailsPageWithErrorBoundary = () => (
  <ErrorBoundary>
    <PropertyDetailsPage />
  </ErrorBoundary>
);

export default PropertyDetailsPageWithErrorBoundary;

