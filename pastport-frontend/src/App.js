import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import AddSitePage from "./AddSitePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/add-site" element={<AddSitePage />} />
      </Routes>
    </Router>
  );
}

export default App;
