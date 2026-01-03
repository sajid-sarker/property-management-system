import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import Properties from "./pages/Properties.jsx";
import PropertyListPage from "./pages/PropertyListPage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";
import EditPropertyPage from "./pages/EditPropertyPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import DevelopmentRequests from "./pages/DevelopmentRequests.jsx";
import AddPropertyPage from "./pages/AddPropertyPage.jsx";
import ListForDevelopmentPage from "./pages/ListForDevelopmentPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties-list" element={<PropertyListPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/property/:id" element={<PropertyDetailsPage />} />
        <Route path="/edit-property/:id" element={<EditPropertyPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/development-requests" element={<DevelopmentRequests />} />
        <Route path="/add-property" element={<AddPropertyPage />} />
        <Route path="/list-for-development" element={<ListForDevelopmentPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
