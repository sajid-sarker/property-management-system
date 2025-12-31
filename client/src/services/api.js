import axios from "axios";

// API base URL - Backend runs on port 5000
const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ============ NOTIFICATION SERVICE ============
export const notificationService = {
  // Get all notifications
  getUserNotifications: () => api.get("/properties/notifications/mine"),

  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// ============ PROPERTY SERVICE ============
export const propertyService = {
  // Get all properties from database
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return api.get(`/properties?${queryString}`);
  },

  // Get landlord's own listings
  getMyListings: () => api.get("/properties/my-listings"),

  // Get single property by ID
  getById: (id) => api.get(`/properties/${id}`),

  // Delete property by ID 
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  
  // Get single property by ID
  searchProperties: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/properties/search?${queryString}`);
  },

  // Mark property as interested
  markInterested: (id) => api.post(`/properties/${id}/interested`),

  // Create new property
  create: (data) => {
    // Transform frontend data to match backend schema
    const payload = {
      title: data.title,
      description: data.description || "No description provided",
      type: data.type,
      location: data.location,
      address: {
        street: data.location || "",
        city: data.city || "Unknown",
        state: data.state || "Unknown",
        country: data.country || "Unknown",
      },
      beds: parseInt(data.beds) || 0,
      baths: parseInt(data.baths) || 0,
      sqft: data.sqft,
      price: data.listingType === 'sell' ? (data.startingPrice || data.price) : data.price,
      images: data.image ? [data.image] : data.images || [],
      image: data.image || (data.images && data.images[0]) || "",
      isBoosted: data.isBoosted || false,
      // New fields for sell/rent
      listingType: data.listingType || 'rent',
      startingPrice: data.listingType === 'sell' ? parseInt(data.startingPrice) : undefined,
      isBiddable: data.listingType === 'sell' ? (data.isBiddable || false) : false,
    };
    return api.post("/properties", payload);
  },

  // Place a bid on a property (for buyers) - uses new bid API
  placeBid: (propertyId, bidData) =>
    api.post(`/property-bids/property/${propertyId}`, bidData),

  // Add a review to a property (for renters)
  addReview: (propertyId, reviewData) =>
    api.post(`/properties/${propertyId}/review`, reviewData),

  // Update property (landlord only)
  update: (id, data) => api.put(`/properties/${id}`, data),
};

// ============ PROPERTY BID SERVICE ============
export const propertyBidService = {
  // Place a bid on a property
  placeBid: (propertyId, bidData) =>
    api.post(`/property-bids/property/${propertyId}`, bidData),

  // Get all bids for a property (landlord only - full details)
  getBidsForProperty: (propertyId) =>
    api.get(`/property-bids/property/${propertyId}`),

  // Get public bid history (limited info)
  getBidHistory: (propertyId) =>
    api.get(`/property-bids/history/${propertyId}`),

  // Get current user's bids
  getMyBids: () => api.get("/property-bids/my-bids"),

  // Accept a bid (landlord only)
  acceptBid: (bidId) => api.patch(`/property-bids/${bidId}/accept`),

  // Reject a bid (landlord only)
  rejectBid: (bidId) => api.patch(`/property-bids/${bidId}/reject`),

  // Withdraw own bid
  withdrawBid: (bidId) => api.delete(`/property-bids/${bidId}`),
};

// ============ AUTH SERVICE ============
export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);
    if (response.data && response.data.token) {
      // Store token separately for auth header
      localStorage.setItem("token", response.data.token);
      // Store user data
      localStorage.setItem("user", JSON.stringify(response.data.user || response.data));
    }
    return response;
  },

  // Register new user
  register: async (userData) => {
    // Map frontend role values to backend enum
    const roleMap = {
      tenant: "tenant",      // Fixed: was "general", now correctly "tenant"
      landlord: "landlord",
      agent: "agent",        // Fixed: was "landlord", now correctly "agent"
      company: "company",
    };

    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: roleMap[userData.role] || "general",
    };

    const response = await api.post("/users/register", payload);
    if (response.data && response.data.token) {
      // Store token separately for auth header
      localStorage.setItem("token", response.data.token);
      // Store user data
      localStorage.setItem("user", JSON.stringify(response.data.user || response.data));
    }
    return response;
  },

  // Get user profile
  getProfile: (userId) => api.get(`/users/profile/${userId}`),

  // Update user profile
  updateProfile: (userId, data) => api.put(`/users/profile/${userId}`, data),

  // Logout
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

// ============ PROJECT SERVICE (Development Requests) ============
export const projectService = {
  // Get all development projects
  getAll: () => api.get("/projects"),

  // Create new project
  create: (data) => api.post("/projects", data),

  // Place bid on a project (for companies)
  placeBid: (projectId, bidData) =>
    api.post(`/projects/${projectId}/bid`, bidData),
};

// ============ WISHLIST SERVICE ============
export const wishlistService = {
  // Get user's wishlist from backend
  getAll: () => api.get("/wishlist"),

  // Add property to wishlist
  add: (propertyId) => api.post("/wishlist/add", { propertyId }),

  // Remove property from wishlist
  remove: (propertyId) => api.delete(`/wishlist/${propertyId}`),

  // Update notes for a wishlist item
  updateNotes: (propertyId, notes) =>
    api.put(`/wishlist/${propertyId}/notes`, { notes }),

  // Check if property is in wishlist
  check: (propertyId) => api.get(`/wishlist/check/${propertyId}`),
};

// ============ BOOST SERVICE ============
export const boostService = {
  // Get boost pricing options
  getPricing: () => api.get("/boosts/pricing"),

  // Create a new boost for a property
  createBoost: (propertyId, landlordId, duration, amount, paymentMethod = "card") =>
    api.post("/boosts", {
      propertyId,
      landlordId,
      duration,
      amount,
      paymentMethod,
    }),

  // Get all boosts for a landlord
  getMyBoosts: (landlordId) => api.get(`/boosts/landlord/${landlordId}`),

  // Get all active boosts
  getActiveBoosts: () => api.get("/boosts/active"),

  // Cancel a boost
  cancelBoost: (boostId) => api.delete(`/boosts/${boostId}`),
};

// ============ MESSAGE SERVICE ============
export const messageService = {
  // Send a new message
  send: (data) => api.post("/messages", data),

  // Get unread message count
  getUnreadCount: () => api.get("/messages/unread-count"),

  // Get list of conversations
  getConversations: () => api.get("/messages/conversations"),

  // Get messages with a specific user
  getMessages: (userId) => api.get(`/messages/${userId}`),
};

export default api;
