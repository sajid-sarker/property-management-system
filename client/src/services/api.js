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
  getUserNotifications: () => api.get("/notifications"),

  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// ============ PROPERTY SERVICE ============
export const propertyService = {
  // Get all properties from database
  getAll: () => api.get("/properties"),

  // Get single property by ID
  getById: (id) => api.get(`/properties/${id}`),

  // Get single property by ID
  deleteProperty: (id) => api.delete(`/properties/${id}`),
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
      price: data.price,
      images: data.image ? [data.image] : data.images || [],
      image: data.image || (data.images && data.images[0]) || "",
      isBoosted: data.isBoosted || false,
      isForSale: data.type === "For Sale",
      isForRent: data.type === "For Rent",
    };
    return api.post("/properties", payload);
  },

  // Place a bid on a property (for buyers)
  placeBid: (propertyId, bidData) =>
    api.post(`/properties/${propertyId}/bid`, bidData),

  // Add a review to a property (for renters)
  addReview: (propertyId, reviewData) =>
    api.post(`/properties/${propertyId}/review`, reviewData),
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
      tenant: "general",
      landlord: "landlord",
      agent: "landlord",
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
// Using localStorage for wishlist as it's user-specific client-side storage
export const wishlistService = {
  getAll: () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return Promise.resolve({ data: wishlist });
  },

  add: (property) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    // Avoid duplicates
    const exists = wishlist.find(
      (p) =>
        p._id === property._id ||
        p.propertyId === property.propertyId ||
        p.id === property.id
    );
    if (!exists) {
      wishlist.push(property);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
    return Promise.resolve({ data: property });
  },

  remove: (propertyId) => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    wishlist = wishlist.filter(
      (p) =>
        p._id !== propertyId &&
        p.propertyId !== propertyId &&
        p.id !== propertyId
    );
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    return Promise.resolve({ data: { success: true } });
  },

  // Update notes for a wishlist item
  updateNotes: (propertyId, notes) => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    wishlist = wishlist.map((p) => {
      if (
        p._id === propertyId ||
        p.propertyId === propertyId ||
        p.id === propertyId
      ) {
        return { ...p, notes };
      }
      return p;
    });
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    return Promise.resolve({ data: { success: true } });
  },
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

export default api;
