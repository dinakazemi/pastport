import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import logo from "./logo.png";

const HomePage = () => {
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const navigate = useNavigate();

  // Check login status on component mount
  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);
  }, []);

  useEffect(() => {
    fetch("/get-sites/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // Read response as text
      })
      .then((text) => {
        try {
          const data = JSON.parse(text); // Attempt to parse JSON
          setSites(data);
        } catch (e) {
          console.error("Error parsing JSON:", e);
          console.error("Response text:", text); // Log the response text
          setError("Failed to parse response as JSON");
        }
      })
      .catch((error) => {
        console.error("Error fetching sites:", error);
        setError(error.message); // Update error state
      });
  }, []);

  const handleAddSite = () => {
    if (isLoggedIn) {
      navigate("/add-site"); // Navigate to Add New Site page if logged in
    } else {
      navigate("/auth"); // Navigate to AuthPage if not logged in
    }
  };

  const handleSiteClick = (siteId) => {
    navigate(`/site/${siteId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Remove login status
    setIsLoggedIn(false); // Update state
    navigate("/"); // Redirect to Home
  };

  return (
    <div className="HomePage">
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
        <div className="header-buttons">
          <button onClick={handleAddSite} className="add-site-button">
            Add New Site
          </button>
          {isLoggedIn && ( // Conditionally render logout button
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="content">
        <h2 className="section-title">Explore Sites</h2>
        <div className="site-list">
          {sites.map((site) => (
            <div
              key={site.site_id}
              className="site-item"
              onClick={() => handleSiteClick(site.siteId)}
            >
              <h3>{site.name}</h3>
              <p>{site.location}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
