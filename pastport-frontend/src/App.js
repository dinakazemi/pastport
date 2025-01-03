import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Layout from "./Layout";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import AddSitePage from "./AddSitePage";
import SearchSitesPage from "./SearchSitesPage";
import SitePage from "./SitePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Nested routes inherit the layout */}
            <Route index element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/add-site" element={<AddSitePage />} />
            <Route path="/search-sites" element={<SearchSitesPage />} />
            <Route path="/site/:siteId" element={<SitePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
