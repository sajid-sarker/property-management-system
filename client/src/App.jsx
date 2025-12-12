import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SignupPage from './pages/SignupPage.jsx';
import Properties from './pages/Properties.jsx';
import PropertyListPage from './pages/PropertyListPage.jsx';
import PropertyDetailsPage from './pages/PropertyDetailsPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import DevelopmentRequests from './pages/DevelopmentRequests.jsx';
import AddPropertyPage from './pages/AddPropertyPage.jsx';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties-list" element={<PropertyListPage />} />
                    <Route path="/properties/:id" element={<PropertyDetailsPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/development-requests" element={<DevelopmentRequests />} />
                    <Route path="/add-property" element={<AddPropertyPage />} />
                    {/* Fallback route */}
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import SignupPage from './pages/SignupPage';
import Properties from './pages/Properties';
import PropertyListPage from './pages/PropertyListPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import DevelopmentRequests from './pages/DevelopmentRequests';
import AddPropertyPage from './pages/AddPropertyPage';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties-list" element={<PropertyListPage />} />
                    <Route path="/properties/:id" element={<PropertyDetailsPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/development-requests" element={<DevelopmentRequests />} />
                    <Route path="/add-property" element={<AddPropertyPage />} />
                    {/* Fallback route */}
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
