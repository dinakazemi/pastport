import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./SitePage.css";

const SitePage = () => {
  const { siteId } = useParams();
  const [siteDetails, setSiteDetails] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { isLoggedIn, userName } = useContext(AuthContext);
  const [customMessage, setCustomMessage] = useState("");
  const [joinAsAdmin, setJoinAsAdmin] = useState(false);
  const navigate = useNavigate();

  // Fetch site details when component mounts
  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const response = await fetch(`/get-site/${siteId}`);
        console.log("Response:", response); // For debugging
        if (!response.ok) {
          throw new Error("Failed to fetch site details");
        }
        const data = await response.json();
        setSiteDetails(data);
        console.log("Site details:", data); // For debugging
        // Prepopulate the custom message
        if (isLoggedIn && data.name && userName) {
          setCustomMessage(
            `Hi,\nI am ${userName}. I would like to request to join the archaeological site of ${data.name}. Thank you!`
          );
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSiteDetails();
  }, [siteId, isLoggedIn, userName]);

  // Handle join request submission
  const handleJoinRequest = async () => {
    try {
      const response = await fetch("/request-to-join-site/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          message: customMessage,
          join_as_admin: joinAsAdmin,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit join request");
      }
      setSuccessMessage(data.message);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    }
  };

  if (!siteDetails) {
    return <p>Loading site details...</p>;
  }

  return (
    <div className="site-page">
      <h1>{siteDetails.name}</h1>
      <p>
        <strong>Location:</strong> {siteDetails.location}
      </p>
      <p>
        <strong>Latitude:</strong> {siteDetails.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {siteDetails.longitude}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(siteDetails.created_at).toLocaleString()}
      </p>
      {/* Render Admins */}
      <h3>Admins:</h3>
      <ul>
        {siteDetails.admins.map((admin, index) => (
          <li key={index}>{admin.email}</li>
        ))}
      </ul>
      {/* Request to Join Section */}
      {isLoggedIn ? (
        <div className="join-request">
          <h2>Request to Join</h2>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows="5"
            className="custom-message-box"
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="joinAsAdmin"
              checked={joinAsAdmin}
              onChange={(e) => setJoinAsAdmin(e.target.checked)}
            />
            <label htmlFor="joinAsAdmin" className="checkbox-message">
              Request to join as an admin
            </label>
          </div>
          <button onClick={handleJoinRequest}>Submit Request</button>
          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}
        </div>
      ) : (
        <p className="login-prompt">
          Log in to request to join this site.
          <button onClick={() => navigate("/auth")}>Log In</button>
        </p>
      )}
    </div>
  );
};

export default SitePage;
