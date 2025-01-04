import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./AddSitePage.css";

const AddSitePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState(null); // For displaying error messages
  const [success, setSuccess] = useState(false); // For showing success message
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate, isLoggedIn]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Reset errors
    setSuccess(false); // Reset success status

    try {
      const response = await fetch("/create-site/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong!");
      }

      // If successful, show success message
      setSuccess(true);
      setFormData({
        name: "",
        location: "",
        latitude: "",
        longitude: "",
      });

      // Optionally navigate back to the home page
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="add-site-page">
      <h1>Add New Site</h1>
      <form onSubmit={handleSubmit} className="add-site-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Latitude:
          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Add Site</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && (
        <p className="success">Site added successfully! Redirecting...</p>
      )}
    </div>
  );
};

export default AddSitePage;
