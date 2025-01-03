import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header"; // Import your Header component

const Layout = () => {
  return (
    <div>
      <Header /> {/* Header included on all pages */}
      <main>
        <Outlet /> {/* Placeholder for page-specific content */}
      </main>
    </div>
  );
};

export default Layout;
