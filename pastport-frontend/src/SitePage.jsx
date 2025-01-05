import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./SitePage.css";

const SitePage = () => {
  const { siteId } = useParams();
  const [siteDetails, setSiteDetails] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { isLoggedIn, userName, userEmail } = useContext(AuthContext);
  const [customMessage, setCustomMessage] = useState("");
  const [joinAsAdmin, setJoinAsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [artefactData, setArtefactData] = useState({
    user_generated_id: "",
    photo_url: "",
    context: "",
    condition: "",
    material: "",
    description: "",
    is_public: false,
  });
  const [artefactError, setArtefactError] = useState(null);
  const [artefactSuccess, setArtefactSuccess] = useState(null);
  const [isAddArtefactOpen, setIsAddArtefactOpen] = useState(false); // Toggle state
  const navigate = useNavigate();

  // Fetch site details when component mounts
  useEffect(() => {
    console.log(userName, isLoggedIn, userEmail);
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
        console.log("user name", userName);
        // check if the user is already a member
        if (data.members && userEmail) {
          const isUserMember = data.members.some(
            (member) => member.email === userEmail
          );
          setIsMember(isUserMember);
        }

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
  }, [siteId, isLoggedIn, userName, userEmail]);

  // Handle artefact form submission
  const handleArtefactSubmit = async (e) => {
    setArtefactSuccess(null);
    setArtefactError(null);
    e.preventDefault();
    console.log("Artefact data:", artefactData);
    try {
      const response = await fetch("/add-artefact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...artefactData, site: siteId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add artefact");
      }
      setArtefactSuccess(data.message);
      setArtefactError(null);
      setArtefactData({
        user_generated_id: "",
        photo_url: "",
        context: "",
        condition: "",
        material: "",
        description: "",
        is_public: false,
      });
    } catch (err) {
      setArtefactError(err.message);
    }
  };

  if (!siteDetails) {
    return <p>Loading site details...</p>;
  }

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
      <p>
        <strong>Admins:</strong>{" "}
        {siteDetails.admins.map((admin, index) => (
          <li key={index}>{admin.email}</li>
        ))}
      </p>
      {/* Request to Join Section */}
      <h3>Request to Join</h3>
      {isLoggedIn ? (
        !isMember ? ( // Display Join Request only if the user is not a member
          <div className="join-request">
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
          <p className="member-message">
            You are already a member of this site.
          </p>
        )
      ) : (
        <p className="login-prompt">
          <button onClick={() => navigate("/auth")}>Log In</button> to request
          to join this site
        </p>
      )}

      {/* Add Artefact Section */}
      {isLoggedIn && isMember && (
        <div className="add-artefact-container">
          <div
            className="toggle-artefact-title"
            onClick={() => setIsAddArtefactOpen((prev) => !prev)}
          >
            <h3>Add Artefact</h3>
            <span className={`arrow ${isAddArtefactOpen ? "open" : "closed"}`}>
              ▼
            </span>
          </div>
          {isAddArtefactOpen && (
            <div className="add-artefact-section">
              <form
                onSubmit={handleArtefactSubmit}
                className="add-artefact-form"
              >
                <label>
                  Artefact ID:
                  <input
                    type="text"
                    value={artefactData.user_generated_id}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        user_generated_id: e.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Photo URL:
                  <input
                    type="text"
                    value={artefactData.photo_url}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        photo_url: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Context:
                  <input
                    type="text"
                    value={artefactData.context}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        context: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Condition:
                  <input
                    type="text"
                    value={artefactData.condition}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        condition: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Material:
                  <input
                    type="text"
                    value={artefactData.material}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        material: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={artefactData.description}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Upload Image:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setArtefactData({
                        ...artefactData,
                        image: e.target.files[0],
                      })
                    }
                  />
                </label>
                <div className="makepublic-checkbox-container">
                  <label htmlFor="makePublic" id="make-public-label">
                    Make public
                  </label>
                  <input
                    id="makePublic"
                    type="checkbox"
                    checked={artefactData.is_public}
                    onChange={(e) =>
                      setArtefactData((prev) => ({
                        ...prev,
                        is_public: e.target.checked,
                      }))
                    }
                  />
                </div>

                <button type="submit">Add Artefact</button>
              </form>
              {artefactError && <p className="error">{artefactError}</p>}
              {artefactSuccess && <p className="success">{artefactSuccess}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SitePage;
