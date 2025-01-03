import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useContext(AuthContext); // Access AuthContext
  const [isLoginForm, setIsLoginForm] = useState(true); // Separate state to toggle form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    password: "",
  }); // State to store form input data
  const [error, setError] = useState(null); // State to store error messages

  // Toggle between Login and Signup forms
  const toggleForm = () => {
    setIsLoginForm(!isLoginForm); // Switch form type
    setFormData({ name: "", email: "", institution: "", password: "" }); // Clear form data
    setError(null); // Reset errors
  };

  // Handle input changes and update formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const endpoint = isLoginForm ? "/login/" : "/signup/"; // Choose the correct endpoint
    const requestData = isLoginForm
      ? { email: formData.email, password: formData.password } // Login only requires email and password
      : {
          name: formData.name,
          email: formData.email,
          institution: formData.institution,
          password: formData.password,
        }; // Signup requires additional fields

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong!");
      }

      const data = await response.json();

      // Set login status in AuthContext and localStorage
      setIsLoggedIn(true);
      setUserName(data.name); // Set userName from backend response
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", data.name);

      navigate("/"); // Redirect to the homepage
    } catch (err) {
      setError(err.message); // Display error message
    }
  };

  return (
    <div className="auth-page">
      <h1>{isLoginForm ? "Login" : "Sign Up"}</h1>
      <form onSubmit={handleSubmit}>
        {/* Signup fields (name and institution) */}
        {!isLoginForm && (
          <>
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
              Institution:
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
              />
            </label>
          </>
        )}
        {/* Common fields for Login and Signup */}
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">{isLoginForm ? "Login" : "Sign Up"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button className="toggle-button" onClick={toggleForm}>
        {isLoginForm
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default AuthPage;
