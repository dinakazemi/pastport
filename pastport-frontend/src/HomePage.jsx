import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import logo from "./logo.png";

const HomePage = () => {
  const [sites, setSites] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    const isLoggedIn = localStorage.getItem("isLoggedIn"); // Check login status
    if (isLoggedIn === "true") {
      navigate("/add-site"); // Navigate to Add New Site page if logged in
    } else {
      navigate("/auth"); // Navigate to AuthPage if not logged in
    }
  };

  const handleSiteClick = (siteId) => {
    navigate(`/site/${siteId}`);
  };

  return (
    <div className="HomePage">
      <header className="header">
        <img src={logo} className="logo" alt="logo" />
        <button onClick={handleAddSite} className="add-site-button">
          Add New Site
        </button>
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
