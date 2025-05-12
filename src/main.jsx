import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.jsx";
import "./index.css";
import "./app.css";
import "bootstrap/dist/css/bootstrap.css";

import "bootstrap/dist/js/bootstrap.bundle";
import "@fortawesome/fontawesome-free/js/all.js";

import Login from "./login.jsx";
import Index from "./index.jsx";
import Register from "./register.jsx";
import Database from "./database.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Tools from "./Tools.jsx";
import Graficas from "./graphs.jsx";
import Graficas2 from "./graphs2.jsx";
import Sqlvehicles from "./sqlvehicles.jsx";
import Compare from "./compare2.jsx";
import Consult from "./consultarnom.jsx";
import AppConductor from "./appconductor.jsx";
import Horario from "./horario.jsx";
import TextChat from "./textchat.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" index element={<Index />} />
        <Route path="/app" element={<App />} />
        <Route path="/database" element={<Database />} />
        <Route path="/login" element={<Login />} />
        <Route path="/appconductor" element={<AppConductor />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/graphs" element={<Graficas />} />
        <Route path="/graphs2" element={<Graficas2 />} />

        <Route path="/sql" element={<Sqlvehicles />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/consult" element={<Consult />} />
        <Route path="/chat" element={<TextChat />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
