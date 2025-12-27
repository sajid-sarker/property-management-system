import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { propertyService } from "../services/api";
import PropertyCard from "../components/properties/PropertyCard";
import Sidebar from "../components/common/Sidebar";

const SearchPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null); // { primary: [], nearby: [] }
    const [hasSearched, setHasSearched] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        street: "",
        city: "",
        state: "",
        type: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            // Filter out empty fields
            const params = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== "")
            );

            const response = await propertyService.searchProperties(params);
            setResults(response.data.data);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "var(--color-primary)",
        }}>
            <Sidebar />
            <div style={{
                flex: 1,
                padding: "2rem",
                color: "white"
            }}>
                {/* Header */}
                <div style={{ maxWidth: "1200px", margin: "0 auto", marginBottom: "2rem" }}>
                    <h1 style={{ fontFamily: "var(--font-heading)", color: "white" }}>
                        Find Your <span className="text-accent">Dream Property</span>
                    </h1>
                </div>

            {/* Search Form */}
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto 3rem",
                background: "var(--color-primary-light)",
                padding: "2rem",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.05)"
            }}>
                <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Property Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} style={inputStyle} placeholder="e.g. Seaside Villa" />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Street Address</label>
                        <input name="street" value={formData.street} onChange={handleChange} style={inputStyle} placeholder="e.g. 123 Palm Ave" />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>City</label>
                        <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} placeholder="e.g. Dhaka" />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>State / Division</label>
                        <input name="state" value={formData.state} onChange={handleChange} style={inputStyle} placeholder="e.g. Dhaka" />
                    </div>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Property Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} style={inputStyle}>
                            <option value="">Any Type</option>
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="land">Land</option>
                            <option value="commercial">Commercial</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "46px", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }} disabled={loading}>
                            {loading ? "Searching..." : <><FaSearch /> Search</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {hasSearched && results && (
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "3rem" }}>

                    {/* Primary Results */}
                    <section>
                        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-accent)", paddingBottom: "0.5rem", display: "inline-block" }}>
                            Primary Matches
                            <span style={{ fontSize: "0.9rem", color: "var(--color-text-light)", marginLeft: "1rem", fontWeight: "normal" }}>
                                ({results.primary.length} found)
                            </span>
                        </h2>

                        {results.primary.length > 0 ? (
                            <div style={gridStyle}>
                                {results.primary.map(property => (
                                    <PropertyCard key={property._id} data={property} />
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: "var(--color-text-light)", fontStyle: "italic" }}>No exact matches found for your criteria.</p>
                        )}
                    </section>

                    {/* Nearby Results - Only show if we have city and nearby results */}
                    {results.nearby.length > 0 && (
                        <section>
                            <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-accent)", paddingBottom: "0.5rem", display: "inline-block" }}>
                                Nearby Properties in {formData.city}
                                <span style={{ fontSize: "0.9rem", color: "var(--color-text-light)", marginLeft: "1rem", fontWeight: "normal" }}>
                                    ({results.nearby.length} found)
                                </span>
                            </h2>
                            <div style={gridStyle}>
                                {results.nearby.map(property => (
                                    <PropertyCard key={property._id} data={property} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
            </div>
        </div>
    );
};

// Styles
const inputGroupStyle = { display: "flex", flexDirection: "column", gap: "0.5rem" };
const labelStyle = { color: "var(--color-text-light)", fontSize: "0.9rem" };
const inputStyle = {
    padding: "0.75rem",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "white",
    fontSize: "1rem",
    outline: "none"
};
const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem"
};

export default SearchPage;
