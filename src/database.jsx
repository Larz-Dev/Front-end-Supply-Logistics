import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Cabecera from "./cabecera.jsx";
import Sidebar from "./sidebar.jsx";

import Transportadora from "./transportadora.jsx";
import Servicios from "./servicios.jsx";
import Vehiculos from "./vehiculos.jsx";
import Empleados from "./empleados.jsx";
import Usuarios from "./usuarios.jsx";
import Nomina from "./nomina.jsx";
function Database() {
  // Validate session (assuming this function does something important)

  document.body.style = "background: #dee2e6;";

  // Get the current location
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const base = queryParams.get("base"); // Get the base parameter from the URL

  return (
    <>
      <div className="row">
        <Cabecera></Cabecera>

        
        <div className="col-md-3  d-flex flex-column p-3 bg-light">
          <Sidebar></Sidebar>
        </div>

        <div className="col-md-9 " style={{ height: "100vh" }}>
          {base === "Transportadora" && <Transportadora />}
          {base === "Vehiculos" && <Vehiculos />}
          {base === "Servicios" && <Servicios />}
          {base === "Empleados" && <Empleados />}
          {base === "Usuarios" && <Usuarios />}
          {base === "Nomina" && <Nomina />}
          {!base && (
            <div>
              <h1>Please select a database</h1>
              <Link to="/database?base=Transportadora">Transportadora</Link>
              <Link to="/database?base=Vehiculos">Vehiculos</Link>
              <Link to="/database?base=Servicios">Servicios</Link>
              <Link to="/database?base=Usuarios">Servicios</Link>
              <Link to="/database?base=Nomina">Servicios</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Database;
