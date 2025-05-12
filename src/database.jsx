import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Cabecera from "./cabecera.jsx";
import Sidebar from "./sidebar.jsx";
import Transportadora from "./transportadora.jsx";
import Servicios from "./servicios.jsx";
import Vehiculos from "./vehiculos.jsx";
import Empleados from "./empleados.jsx";
import Usuarios from "./usuarios.jsx";
import Conductores from "./conductores.jsx";
import Nomina from "./nomina.jsx";
import Myvehiculos from "./vehiculosconductor.jsx";
  import { useIsMobile } from "./useIsMobile.jsx"; // ajusta el path

function Database() {
  const isMobile = useIsMobile();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  document.body.style = "background: #dee2e6;";

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const base = queryParams.get("base");

  return (
    <>
      <div className="row w-100 m-0 p-0 ">
    
        {sidebarVisible && (
          <div
             className={`d-flex flex-column bg-light align-items-center  ${
        isMobile
          ? " top-0 start-0 w-100 h-100"
          : "position-fixed top-0 start-0 col-md-3 h-100"
      }`}
            style={{ zIndex: 1050 }}
          >
            <Sidebar />
                 <Cabecera />

          </div>
        )}

        {/* Contenido principal */}
        <div
          className={`p-3 overflow-x-hidden ${
            sidebarVisible && !isMobile ? "offset-md-3 col-md-9" : "col-md-12"
          }`}
          style={{
            marginLeft: sidebarVisible && !isMobile ? "25%" : "0",
            transition: "margin-left 0.3s ease",
            height: "100vh",
          }}
        >
          <div className="d-flex justify-content-start">
            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              {sidebarVisible ? "⮜ Ocultar menú" : "⮞ Mostrar menú"}
            </button>
          </div>

          {base === "Transportadora" && <Transportadora />}
          {base === "Vehiculos" && <Vehiculos />}
          {base === "Servicios" && <Servicios />}
          {base === "Empleados" && <Empleados />}
          {base === "Usuarios" && <Usuarios />}
          {base === "Nomina" && <Nomina />}
          {base === "Conductores" && <Conductores />}
          {base === "Misvehiculos" && <Myvehiculos />}
          {!base && (
            <div>
              <h1>Selecciona una base de datos</h1>
              <Link to="/database?base=Transportadora">Transportadora</Link><br/>
              <Link to="/database?base=Vehiculos">Vehículos</Link><br/>
              <Link to="/database?base=Servicios">Servicios</Link><br/>
              <Link to="/database?base=Usuarios">Usuarios</Link><br/>
              <Link to="/database?base=Nomina">Nómina</Link><br/>
              <Link to="/database?base=Misvehiculos">Mis vehículos</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Database;
