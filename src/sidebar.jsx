import React, { useState, useRef, useEffect } from "react";
import "./Sidebar.css";
import logo from "./assets/images/Logo.png";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null); // Create a ref to get the content height
  const [maxHeight, setMaxHeight] = useState("0px"); // State to control max-height

  const [isOpen2, setIsOpen2] = useState(false);
  const contentRef2 = useRef(null); // Create a ref to get the content height
  const [maxHeight2, setMaxHeight2] = useState("0px"); // State to control max-height

  const toggleCollapse = () => {
    setIsOpen((prev) => !prev);
  };
  const toggleCollapse2 = () => {
    setIsOpen2((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      // Set maxHeight to the scrollHeight of the content when opened
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      // Set maxHeight to 0 when closed
      setMaxHeight("0px");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen2) {
      // Set maxHeight to the scrollHeight of the content when opened
      setMaxHeight2(`${contentRef2.current.scrollHeight}px`);
    } else {
      // Set maxHeight to 0 when closed
      setMaxHeight2("0px");
    }
  }, [isOpen2]);

  return (
    <div className="text-center   ">
      <div className="pt-3 bg-supply p-0 m-0 rounded-bottom-4">
        <div className="d-flex align-items-center gap-3 p-2">
          <img
            src={logo}
            alt=""
            width={80}
            className="bg-white p-2 img-responsive rounded"
          />
          <h1 className="text-white fw-bold fs-2 m-0">We Supply APP</h1>
        </div>
      </div>

      <div className="d-flex flex-column mt-2">
        <a
          href={sessionStorage.getItem("rol") > 3 ? "/appconductor" : "/app"}
          className="mb-2 border hover-b rounded-3 py-2"
        >
          Programación <i className="fa-regular fa-pen-to-square"></i>
        </a>
      </div>
      {sessionStorage.getItem("rol") > 3 && (
        <div>
          <a
            href="/database?base=Misvehiculos"
            className=" border hover-b rounded-3 d-flex flex-column pb-1"
          >
            Mis vehículos <i className="fa fa-car"></i>
          </a>
        </div>
      )}
      {sessionStorage.getItem("rol") == 1 && (
        <div>
          <h4 className="text-center ">Bases de Datos</h4>
          <div className="d-flex flex-column mt-2 ">
            <a
              className={`border textcolor rounded-3 ${
                isOpen ? "bg-supply   text-white" : ""
              }`}
              onClick={toggleCollapse}
              aria-expanded={isOpen}
            >
              {isOpen ? "Ocultar" : "Mostrar"}{" "}
              <span className="">opciones {isOpen ? "▲" : " ▼"}</span>
            </a>
          </div>
          <div
            className={`d-flex flex-column mt-2 collapse ${
              isOpen ? "show" : ""
            }`}
            style={{ maxHeight: maxHeight }} // Apply dynamic maxHeight
            ref={contentRef}
          >
            <a
              href="/database?base=Nomina"
              className="mb-2 border hover-b rounded-3 py-2"
            >
              Nómina <i className="fa-solid fa-money-bill"></i>
            </a>

            <a
              href="/database?base=Vehiculos"
              className="mb-2 border hover-b rounded-3 py-2"
            >
              Vehículos <i className="fa-regular fa-id-card"></i>
            </a>
            <a
              href="/database?base=Transportadora"
              className="mb-2 border hover-b rounded-3 py-2"
            >
              Transportadoras <i className="fa-regular fa-paper-plane"></i>
            </a>
            <a
              href="/database?base=Empleados"
              className="mb-2 border hover-b rounded-3 py-2"
            >
              Empleados <i className="fa-solid fa-briefcase"></i>
            </a>
            <a
              href="/database?base=Usuarios"
              className="mb-2 border hover-b rounded-3 py-2"
            >
              Usuarios <i className="fa-solid fa-user"></i>
            </a>

            <a
              href="/database?base=Conductores"
              className="mb-2 border hover-b rounded-3 py-2"
            >
              Conductores <i className="fa-solid fa-user"></i>
            </a>
          </div>
        </div>
      )}

      {sessionStorage.getItem("rol") == 1 && (
        <div>
          <h4 className="text-center ">Gráficas</h4>
          <div className="d-flex flex-column mt-2 ">
            <a
              className={`border textcolor rounded-3 ${
                isOpen2 ? "bg-supply   text-white" : ""
              }`}
              onClick={toggleCollapse2}
              aria-expanded={isOpen2}
            >
              {isOpen2 ? "Ocultar" : "Mostrar"}{" "}
              <span className="">gráficas {isOpen2 ? "▲" : " ▼"}</span>
            </a>
          </div>
          <div
            className={`d-flex flex-column mt-2 collapse ${
              isOpen ? "show" : ""
            }`}
            style={{ maxHeight: maxHeight2 }} // Apply dynamic maxHeight
            ref={contentRef2}
          >
            <a href="/graphs" className="mb-2 border hover-b rounded-3 py-2">
              Rendimiento de empleados <i className="fa fa-briefcase"></i>
            </a>
            <a href="/graphs2" className="mb-2 border hover-b rounded-3 py-2">
              Promedio de efectivo por turnos{" "}
              <i className="fa fa-bar-chart"></i>
            </a>
            <a href="/" className="mb-2 border hover-b rounded-3 py-2">
              Proximamente <i className="fa-solid fa-spinner"></i>
            </a>
            <a href="/" className="mb-2 border hover-b rounded-3 py-2">
              Proximamente <i className="fa-solid fa-spinner"></i>
            </a>
          </div>
        </div>
      )}

      <p></p>
      <div className="mt-auto border-top text-center py-2 mx-5 ">
        {" "}
        {/* Espaciado automático para colocarlo en la parte inferior */}
        <a
          className="link-opacity-25 text-black-50 "
          href="https://github.com/Larz-Dev"
        >
          Desarrollado por Larz-Dev <i className="fa-brands fa-github"></i>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
