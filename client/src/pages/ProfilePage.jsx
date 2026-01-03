import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaUpload } from "react-icons/fa";
import { authService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/common/Sidebar";
import ImageCropper from "../components/common/ImageCropper";

// Limits for MongoDB free tier
const MAX_IMAGE_SIZE_KB = 500; // 500KB max for profile picture
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_KB * 1024;
const MAX_BIO_CHARACTERS = 500;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    description: "",
    phoneNumber: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  
  // Image cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      
      try {
        const response = await authService.getProfile(user._id);
        if (response.data?.success && response.data?.data) {
          const userData = response.data.data;
          setProfile({
            name: userData.name || "",
            email: userData.email || "",
            description: userData.description || "",
            phoneNumber: userData.phoneNumber || "",
            image: userData.image || "",
          });
          setImagePreview(userData.image || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // Use current user data as fallback
        if (user) {
          setProfile({
            name: user.name || "",
            email: user.email || "",
            description: user.description || "",
            phoneNumber: user.phoneNumber || "",
            image: user.image || "",
          });
          setImagePreview(user.image || "");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Enforce bio character limit
    if (name === "description" && value.length > MAX_BIO_CHARACTERS) {
      return;
    }
    
    setProfile({ ...profile, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (allow larger for cropping, final size will be smaller)
    if (file.size > MAX_IMAGE_SIZE_BYTES * 4) {
      setImageError(`Image size must be less than ${MAX_IMAGE_SIZE_KB * 4}KB for processing.`);
      return;
    }

    // Convert to base64 and open cropper
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImageToCrop(base64String);
      setShowCropper(true);
    };
    reader.onerror = () => {
      setImageError("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
    
    // Reset file input so same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = (croppedImage) => {
    // Check final cropped image size
    const base64Length = croppedImage.length - (croppedImage.indexOf(',') + 1);
    const approximateSizeKB = (base64Length * 0.75) / 1024;
    
    if (approximateSizeKB > MAX_IMAGE_SIZE_KB) {
      setImageError(`Cropped image is too large (${Math.round(approximateSizeKB)}KB). Try zooming out more.`);
      setShowCropper(false);
      return;
    }
    
    setImagePreview(croppedImage);
    setProfile({ ...profile, image: croppedImage });
    setShowCropper(false);
    setImageError("");
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      alert("Please log in to update your profile.");
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        name: profile.name,
        description: profile.description,
        phoneNumber: profile.phoneNumber,
        image: profile.image,
      };
      
      await authService.updateProfile(user._id, updateData);
      
      // Update local storage user data
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...storedUser, ...updateData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. " + (error.response?.data?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--color-primary)",
        }}
      >
        <Sidebar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=d4af37&color=0a0a0f&size=200`;
  const displayImage = imagePreview || defaultImage;
  const bioCharactersLeft = MAX_BIO_CHARACTERS - (profile.description?.length || 0);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-primary)",
      }}
    >
      <Sidebar />
      
      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
      
      <div
        style={{
          flex: 1,
          padding: "3rem",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: "100%",
            maxWidth: "800px",
            background: "var(--color-primary-light)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "3rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              marginBottom: "2rem",
            }}
          >
            <h1 style={{ fontSize: "2.5rem", fontFamily: "var(--font-heading)" }}>
              Edit Profile
            </h1>
          </div>

          <div
            style={{ display: "flex", gap: "3rem", flexDirection: "row-reverse" }}
          >
            {/* Profile Picture Column */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: "200px",
                  height: "200px",
                  margin: "0 auto 1.5rem auto",
                }}
              >
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    borderRadius: "50%",
                    background: `url("${displayImage}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "4px solid var(--color-accent)",
                  }}
                />
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />

              {/* Upload button */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="btn btn-outline"
                style={{
                  fontSize: "0.875rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FaUpload size={12} /> Upload Photo
              </button>

              {/* Info text */}
              <p style={{
                fontSize: "0.75rem",
                color: "var(--color-text-light)",
                marginTop: "0.75rem",
                lineHeight: 1.5,
              }}>
                Upload an image to crop and adjust.<br/>
                Max final size: {MAX_IMAGE_SIZE_KB}KB
              </p>

              {/* Error message */}
              {imageError && (
                <p style={{
                  fontSize: "0.8rem",
                  color: "#ef4444",
                  marginTop: "0.5rem",
                  padding: "0.5rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "4px",
                }}>
                  {imageError}
                </p>
              )}
            </div>

            {/* Form Column */}
            <form
              onSubmit={handleSubmit}
              style={{
                flex: 2,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  style={{ ...inputStyle, opacity: 0.6 }}
                  disabled
                />
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>
                  Email cannot be changed
                </span>
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Bio / Description
                  <span style={{
                    float: "right",
                    fontSize: "0.8rem",
                    color: bioCharactersLeft < 50 ? "#ef4444" : "var(--color-text-light)",
                  }}>
                    {bioCharactersLeft} characters left
                  </span>
                </label>
                <textarea
                  name="description"
                  value={profile.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  maxLength={MAX_BIO_CHARACTERS}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  color: "var(--color-text-light)",
  fontSize: "0.9rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  background: "rgba(0,0,0,0.2)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "4px",
  color: "white",
  outline: "none",
  fontFamily: "var(--font-body)",
  resize: "none",
};

export default ProfilePage;
