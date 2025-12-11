import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Standard MERN backend port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor for JWT token (if auth is involved later)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// API Service Methods
export const propertyService = {
    getAll: async () => {
        // In a real app: return api.get('/properties');
        // Using mock data for demo since backend might not be running
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        {
                            id: 1,
                            title: "Midnight Villa",
                            location: "Beverly Hills, CA",
                            price: "$14,500,000",
                            type: "For Sale",
                            beds: 6,
                            baths: 7,
                            sqft: "8,500 sqft",
                            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
                        },
                        {
                            id: 2,
                            title: "Obsidian Heights",
                            location: "New York, NY",
                            price: "$22,000/mo",
                            type: "For Rent",
                            beds: 3,
                            baths: 3,
                            sqft: "2,800 sqft",
                            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        },
                        {
                            id: 3,
                            title: "Gold Coast Penthouse",
                            location: "Chicago, IL",
                            price: "$5,200,000",
                            type: "For Sale",
                            beds: 4,
                            baths: 4,
                            sqft: "4,200 sqft",
                            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        }
                    ]
                });
            }, 500);
        });
    },

    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => {
        // Mock creation
        console.log("Mock Create Property:", data);
        return Promise.resolve({ data: { id: Math.floor(Math.random() * 1000), ...data } });
    },
};

export const wishlistService = {
    getAll: async () => {
        // Mock wishlist data (subset of properties)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        {
                            id: 1,
                            title: "Midnight Villa",
                            location: "Beverly Hills, CA",
                            price: "$14,500,000",
                            type: "For Sale",
                            beds: 6,
                            baths: 7,
                            sqft: "8,500 sqft",
                            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
                        }
                    ]
                });
            }, 500);
        });
    },
    add: (propertyId) => {
        console.log("Mock Add to Wishlist:", propertyId);
        return Promise.resolve({ data: { success: true } });
    },
    remove: (propertyId) => {
        console.log("Mock Remove from Wishlist:", propertyId);
        return Promise.resolve({ data: { success: true } });
    }
};

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => {
        localStorage.removeItem('token');
    },
};

export default api;
