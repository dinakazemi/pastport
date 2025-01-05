import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { AuthContext } from "./AuthContext";
import logo from "./logo.png";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, setUserName, setUserEmail } =
    useContext(AuthContext); // State to track login status
  const navigate = useNavigate();

  const handleAddSite = () => {
    if (isLoggedIn) {
      navigate("/add-site"); // Navigate to Add New Site page if logged in
    } else {
      navigate("/auth"); // Navigate to AuthPage if not logged in
    }
  };

  const handleSearchSite = () => {
    navigate("/search-sites");
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    // Update global state
    setIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
    navigate("/"); // Redirect to Home
  };

  const handleLogin = () => {
    navigate("/auth"); // Redirect to Home
  };

  const handleLogoClick = () => {
    navigate("/"); // Redirect to the homepage
  };

  return (
    <header className="header">
      <img
        src={logo}
        className="logo"
        alt="logo"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      />
      <div className="header-buttons">
        <button onClick={handleAddSite} className="add-site-button">
          Add New Site
        </button>
        <button onClick={handleSearchSite} className="search-site-button">
          Search Sites
        </button>
        {isLoggedIn && ( // Conditionally render logout button
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
        {!isLoggedIn && ( // Conditionally render logout button
          <button onClick={handleLogin} className="logout-button">
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
