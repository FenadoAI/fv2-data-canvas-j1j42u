import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataVisualizationPlayground from "./components/DataVisualizationPlayground";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DataVisualizationPlayground />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
