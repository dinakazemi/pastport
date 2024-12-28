import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    password: "",
  }); // State to store form input data
  const [error, setError] = useState(null); // State to store error messages

  // Toggle between Login and Signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin); // Switch form type
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
    const endpoint = isLogin ? "/login/" : "/signup/"; // Choose the correct endpoint
    const requestData = isLogin
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
        throw new Error(errorData.message || "Something went wrong!");
      }

      const data = await response.json();
      console.log("Success:", data); // For debugging
      // Set login status in localStorage and navigate to Add New Site page
      localStorage.setItem("isLoggedIn", "true");
      navigate("/add-site");
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message); // Display error message
    }
  };

  return (
    <div className="auth-page">
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={handleSubmit}>
        {/* Signup fields (name and institution) */}
        {!isLogin && (
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
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <button className="toggle-button" onClick={toggleForm}>
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default AuthPage;
