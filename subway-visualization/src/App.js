import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Visualize from "./components/Visualize";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/visualize" element={<Visualize />} />
      </Routes>
    </Router>
  );
};

export default App;
