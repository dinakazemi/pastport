import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./SearchSitesPage.css";

const SearchSitesPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ name: "", location: "" });
  const [error, setError] = useState(null);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `/search-sites/?name=${searchQuery.name}&location=${searchQuery.location}`
      );
      const data = await response.json();
      setSearchResults(data);
      setError(null); // Clear errors on successful search
    } catch (err) {
      setError("Failed to search for sites");
    }
  };

  const handleShowSite = (siteId) => {
    // Navigate to the specific site's page
    navigate(`/site/${siteId}`);
  };

  return (
    <div className="search-sites-page">
      <h1>Search Sites</h1>
      <div className="search-form">
        <input
          type="text"
          placeholder="Site Name"
          value={searchQuery.name}
          onChange={(e) =>
            setSearchQuery({ ...searchQuery, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Location"
          value={searchQuery.location}
          onChange={(e) =>
            setSearchQuery({ ...searchQuery, location: e.target.value })
          }
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="results">
        {searchResults.map((site) => (
          <div
            key={site.site_id}
            className="site-item"
            onClick={() => handleShowSite(site.site_id)}
            style={{ cursor: "pointer" }}
          >
            <h3>{site.name}</h3>
            <p>{site.location}</p>
            <button
              onClick={() => handleShowSite(site.site_id)}
              disabled={!isLoggedIn}
              className={!isLoggedIn ? "disabled-button" : ""}
            >
              {isLoggedIn ? "Request to Join" : "Log in to Join"}
            </button>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SearchSitesPage;
