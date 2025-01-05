import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  useEffect(() => {
    console.log("Auth Context:", userName);
    const handleStorageChange = () => {
      const newLoginStatus = localStorage.getItem("isLoggedIn") === "true";
      const newUserName = localStorage.getItem("userName") || "";
      const newUserEmail = localStorage.getItem("userEmail") || "";

      if (isLoggedIn !== newLoginStatus) {
        setIsLoggedIn(newLoginStatus);
      }
      if (userName !== newUserName) {
        setUserName(newUserName);
      }
      if (userEmail !== newUserEmail) {
        setUserEmail(newUserEmail);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        userEmail,
        setUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
