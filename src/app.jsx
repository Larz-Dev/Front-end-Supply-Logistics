import { useState, useEffect } from "react";
//import { Link } from "react-router-dom";
import Cabecera from "./cabecera.jsx";
import React from "react";
import { useIsMobile } from "./useIsMobile.jsx"; // ajusta el path
//import Publicar from "./publicar.jsx";
import {
  Validarsesion,
  variables,
  Notificar,
  getEstadoClase,
  getEstadoTexto,
} from "./funciones.jsx";
//import loadingPost from "./assets/images/PostLoading.gif";
//import loadingProfile from "./assets/images/ProfileLoading.gif";
//import ImageMaximizer from "./maximizer.jsx";
import Sidebar from "./sidebar.jsx";
//import * as XLSX from "xlsx";
//import EditarRecibo from "./Editar.jsx";
function App() {
  Validarsesion();

  if (sessionStorage.getItem("rol") == 4) {
    window.location = "/appconductor";
  }
  document.body.style = "background: #dee2e6;";
  const [programaciones, setProgramaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rangoInicio, setRangoInicio] = useState("");
  const [rangoFin, setRangoFin] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [selectedprogramm, setprogramm] = useState([]);
  const [filteredProgramaciones, setFilteredProgramaciones] = useState([]); // Total de publicaciones

  const [fechaInicio, setfechaInicio] = useState("");
  const [fechaFin, setfechaFin] = useState("");
  const [estado, setestado] = useState("");
  const [observacion, setObservacion] = useState("");
  const [areaAsignada, setAreaAsignada] = useState("");
  const [fechaAsignada, setFechaAsignada] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [Montacargas, setMontacargas] = useState(1);
  const [Auxiliares, setAuxiliares] = useState(1);
  const [buscarFecha, setbuscarFecha] = useState(true);
  const [todo, setTodo] = useState(false);
  const [total, setTotal] = useState(0);

  const [estadoProgramacion, setEstadoprogramacion] = useState(5);
  const isMobile = useIsMobile();

  // Lógica de paginación
  const postsPerPage = 6; // o cualquier número de publicaciones por página que desees

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredProgramaciones.slice(
    indexOfFirstPost,
    indexOfLastPost
  );
  const totalPages = Math.ceil(total / postsPerPage);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const openEditModal = (idRecibo) => {
    setIdReciboToEdit(idRecibo);
    sessionStorage.setItem("idRecibo", idRecibo);
  };

  const closeEditModal = () => {
    setIdReciboToEdit("");
  };
  const programacionesPorArea = {};

  const [areas, setAreas] = useState([]);

  useEffect(() => {
    fetch(variables("API") + "/programacion/areas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.areas)) {
          setAreas(data.areas);
        }
      })
      .catch((err) => {
        console.error("Error al obtener las áreas:", err);
      });
  }, []);

  // Agrupar por área y luego por fecha (formateada como YYYY-MM-DD)
  filteredProgramaciones.forEach((prog) => {
    const area = prog.area?.nombre || "Sin área";
    const fecha = new Date(prog.fechaAsignada || prog.fechaEstimadaLlegada)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD

    if (!programacionesPorArea[area]) {
      programacionesPorArea[area] = {};
    }

    if (!programacionesPorArea[area][fecha]) {
      programacionesPorArea[area][fecha] = [];
    }

    programacionesPorArea[area][fecha].push(prog);
  });

  // Ordenar y asignar numeroDelDia y diaFormateado

  const Cargartodo = () => {
    setTodo(true);
  };

  useEffect(() => {
    if (todo == true) {
      FetchProgramaciones();
    }
  }, [todo]);

  useEffect(() => {
    const hoy = obtenerFechaHoy();
    setTodo(false);
    setRangoInicio(hoy);
    setRangoFin(hoy);
    setfechaInicio(hoy); // si lo usas para el modal
    setfechaFin(hoy); // si lo usas para el modal
    setbuscarFecha(true);
  }, []);
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset(); // minutos de diferencia con UTC
    const hoyLocal = new Date(hoy.getTime() - offset * 60000); // corregimos la hora
    return hoyLocal.toISOString().split("T")[0];
  };
  useEffect(() => {
    if (buscarFecha && rangoFin != "" && rangoFin != "" && todo == false) {
      FetchProgramaciones();
    }
  }, [buscarFecha, rangoInicio, rangoFin]);

  const FetchProgramaciones = () => {
    if (todo == false) {
      fetch(variables("API") + "/programacion/listingbypagination", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          offset: (currentPage - 1) * postsPerPage,
          limit: postsPerPage,
          fechaInicio: rangoInicio,
          fechaFin: rangoFin,
          todo: todo,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setProgramaciones(data.programaciones || []);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error al cargar programaciones:", error);
          setLoading(false);
        });
    } else {
      fetch(variables("API") + "/programacion/listingbypagination", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          offset: (currentPage - 1) * postsPerPage,
          limit: postsPerPage,
          todo: todo,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setProgramaciones(data.programaciones || []);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error al cargar programaciones:", error);
          setLoading(false);
        });
    }
  };

  const handleclose = (item) => {
    setprogramm(item);
  };

  useEffect(() => {
    const filtro = programaciones.filter(
      (p) =>
        ((p.conductor.Nombre1?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
          (p.conductor.Apellido1?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (p.conductor.Nombre2?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (p.conductor.Apellido2?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (p.conductor.phone?.toString() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (p.vehiculo?.placa?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (p.producto?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )) &&
        (estadoProgramacion === 5 || p.estado === estadoProgramacion)
    );
    setFilteredProgramaciones(filtro);
  }, [searchTerm, programaciones, estadoProgramacion]);

  const FiltrarestadoProgramacion = (opcion) => {
    let estadoactual = estadoProgramacion;
    if (opcion == ">") {
      setEstadoprogramacion(estadoactual + 1);
      if (estadoProgramacion >= 8) {
        setEstadoprogramacion(0);
      }
    }

    if (opcion != ">") {
      setEstadoprogramacion(estadoactual - 1);
      if (estadoProgramacion <= 0) {
        setEstadoprogramacion(8);
      }
    }

    console.log(estadoactual);
  };

  useEffect(() => {
    if (rangoInicio && rangoFin) {
      FetchProgramaciones();
    }
  }, [currentPage]);

  return (
    <>
      <div className="row w-100 p-0 m-0">
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
            {!isMobile}
          </div>
        )}

        <div
          className={`p-0 overflow-x-hidden ${
            sidebarVisible && !isMobile ? "col-md-9" : "col-md-12"
          }`}
          style={{
            marginLeft: sidebarVisible && !isMobile ? "25%" : "0",
            transition: "margin-left 0.3s ease",
            height: "100vh",
          }}
        >
          <div className="d-flex justify-content-start">
            <button
              className="btn mt-3 mx-4 btn-outline-secondary"
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              {sidebarVisible ? "⮜ Ocultar menú" : "⮞ Mostrar menú"}
            </button>
          </div>

          <div className=" justify-content-md-center ">
            {" "}
            <div className="row justify-content-center"></div>
            <div className=" d-flex align-items-center  mx-auto my-2 px-3">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Buscar por transportadora, placa, área, o concepto"
                className="inner-shadow rounded form-control mx-2 "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                className="btn btn-warning col-md-2 mx-1"
                onClick={() => {
                  Cargartodo();
                }}
              >
                Cargar todos
              </button>
            </div>
            <div className=" d-flex align-items-center   mx-auto my-2 px-3">
              <button
                className="btn btn-success  col-4"
                onClick={() => {
                  FiltrarestadoProgramacion("<");
                }}
              >
                Atrás
              </button>
              <div
                className={`btn mx-1   col-4 text-white fw-bold  ${getEstadoClase(
                  estadoProgramacion
                )}`}
              >
                {getEstadoTexto(estadoProgramacion)}
              </div>
              <button
                className="btn btn-success col-4"
                onClick={() => {
                  FiltrarestadoProgramacion(">");
                }}
              >
                Adelante
              </button>
            </div>
            <div className=" d-flex align-items-center  mx-auto  px-3">
              <input
                type="date"
                placeholder="Inicio"
                className="inner-shadow rounded form-control  mx-auto py-2"
                name="inicio"
                id="inicio"
                value={rangoInicio}
                onChange={(event) => {
                  setCurrentPage(1),
                    setTodo(false),
                    setRangoInicio(event.target.value);
                }}
              />
              <span className="mx-3"> {"y"}</span>
              <input
                type="date"
                placeholder="Fin"
                className="inner-shadow rounded form-control mx-auto py-2"
                name="fin"
                id="fin"
                value={rangoFin}
                onChange={(event) => {
                  setCurrentPage(1),
                    setTodo(false),
                    setRangoFin(event.target.value);
                }}
              />
            </div>
            <p></p>
            <div className="  ">
              <div className="table-responsive">
                <table className="table table-hover table-dark table-bordered m-0">
                  <thead className="text-uppercase text-center font-monospace">
                    <tr>
                      <th>#</th>
                      <th>Área</th>
                      <th>Tipo</th> {/* Nueva columna */}
                      <th>Vehículo</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Fecha/Hora</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(programacionesPorArea).flatMap(
                      ([area, fechas], areaIdx) =>
                        Object.entries(fechas).flatMap(
                          ([fecha, programaciones], fechaIdx) =>
                            programaciones.map((programacion, idx) => (
                              <React.Fragment key={programacion.idProgramacion}>
                                <tr
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#collapse-${areaIdx}-${fechaIdx}-${idx}`}
                                  aria-expanded="false"
                                  className="accordion-toggle text-center"
                                >
                                  <td>{programacion.numeroDelDia}</td>
                                  <td>
                                    {programacion?.area?.nombre ||
                                      "No asignado"}{" "}
                                    (
                                    {programacion?.subareaNombre ||
                                      "Sin espacio asignado"}
                                    )
                                  </td>
                                  <td>
                                    <span
                                      className={`badge fs-6 ${
                                        programacion.tipo === 0
                                          ? "bg-primary"
                                          : programacion.tipo === 1
                                          ? "bg-success"
                                          : ""
                                      }`}
                                    >
                                      {programacion.tipo === 0
                                        ? "Recepción"
                                        : programacion.tipo === 1
                                        ? "Despacho"
                                        : "—"}
                                    </span>
                                  </td>
                                  <td>
                                    {programacion.vehiculo.placa} (
                                    {programacion.vehiculo.tipo})
                                  </td>
                                  <td>{programacion.producto}</td>
                                  <td>{programacion.cantidad}</td>
                                  <td>
                                    <span
                                      className={`badge fs-6 font-monospace ${
                                        programacion.fechaAsignada
                                          ? "bg-success"
                                          : "bg-warning text-dark"
                                      }`}
                                    >
                                      {programacion.fechaAsignada
                                        ? `Asignada: ${new Date(
                                            programacion.fechaAsignada
                                          )
                                            .toISOString()
                                            .slice(0, 16)
                                            .replace("T", " ")}`
                                        : `Estimada: ${new Date(
                                            programacion.fechaEstimadaLlegada
                                          )
                                            .toISOString()
                                            .slice(0, 16)
                                            .replace("T", " ")}`}
                                    </span>
                                  </td>
                                  <td>
                                    <div
                                      className={` fs-6 rounded-3 fw-bold  ${getEstadoClase(
                                        programacion.estado
                                      )}`}
                                    >
                                      <span>
                                        {getEstadoTexto(programacion.estado)}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="text-center">
                                    <button className="btn btn-sm btn-light">
                                      Ver más
                                    </button>
                                  </td>
                                </tr>

                                {/* Fila colapsable */}
                                <tr>
                                  <td colSpan="9" className="p-0">
                                    <div
                                      id={`collapse-${areaIdx}-${fechaIdx}-${idx}`}
                                      className="collapse bg-light text-dark pt-3  "
                                    >
                                      <div className="container-fluid">
                                        <div className="row">
                                          {/* Columna 1 */}
                                          <div className="col-md-4 mb-1">
                                            {programacion.fechaAsignada && (
                                              <p>
                                                <strong>Asignado para:</strong>
                                                <br />
                                                {new Date(
                                                  programacion.fechaAsignada
                                                )
                                                  .toISOString()
                                                  .slice(0, 16)
                                                  .replace("T", " ")}
                                              </p>
                                            )}
                                            {programacion.fechaInicioServicio && (
                                              <p>
                                                <strong>
                                                  Inicio de servicio:
                                                </strong>
                                                <br />
                                                {new Date(
                                                  programacion.fechaInicioServicio
                                                )
                                                  .toISOString()
                                                  .slice(0, 16)
                                                  .replace("T", " ")}
                                              </p>
                                            )}
                                            {programacion.fechaFinServicio && (
                                              <p>
                                                <strong>
                                                  Fin de servicio:
                                                </strong>
                                                <br />
                                                {new Date(
                                                  programacion.fechaFinServicio
                                                )
                                                  .toISOString()
                                                  .slice(0, 16)
                                                  .replace("T", " ")}
                                              </p>
                                            )}
                                          </div>

                                          {/* Columna 2 */}
                                          <div className="col-md-4 mb-1">
                                            {programacion.contacto && (
                                              <p>
                                                <strong>Dirección:</strong>
                                                <br />
                                                {programacion.contacto}
                                              </p>
                                            )}
                                            {programacion.observaciones && (
                                              <p>
                                                <strong>Observaciones:</strong>
                                                <br />
                                                {programacion.observaciones}
                                              </p>
                                            )}
                                            {programacion.observacionessistema && (
                                              <p>
                                                <strong>Sistema:</strong>
                                                <br />
                                                {
                                                  programacion.observacionessistema
                                                }
                                              </p>
                                            )}
                                          </div>

                                          {/* Columna 3 */}
                                          <div className="col-md-4 mb-1">
                                            <p className="mb-1">
                                              <strong>Conductor:</strong>
                                              <br />
                                              {
                                                programacion.conductor.Nombre1
                                              }{" "}
                                              {programacion.conductor.Nombre2}{" "}
                                              {programacion.conductor.Apellido1}{" "}
                                              {programacion.conductor.Apellido2}
                                              <br />
                                              <small className="text-muted">
                                                ({programacion.conductor.phone})
                                              </small>
                                            </p>
                                            <p className="mb-1">
                                              <strong>Transportadora:</strong>
                                              <br />
                                              {programacion.conductor
                                                .transportadora?.nombre ||
                                                programacion.conductor
                                                  .transportadorasugerida +
                                                  " (Sugerida)"}
                                            </p>
                                            {programacion.confirmador?.user && (
                                              <p className="badge bg-primary fs-6">
                                                <strong>Confirmador:</strong>
                                                <br />
                                                {programacion.confirmador.user +
                                                  " (" +
                                                  programacion.confirmador
                                                    .documento +
                                                  ")"}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="text-end mt-1">
                                          {!programacion.fechaFinServicio &&
                                            !programacion.fechaInicioServicio &&
                                            programacion.estado !== 3 && (
                                              <>
                                                {programacion.estado === 0 && (
                                                  <div>
                                                    <a
                                                      className="btn btn-primary fw-bold text-white me-2 mb-2"
                                                      data-bs-toggle="modal"
                                                      data-bs-target="#finishPostModal"
                                                      onClick={() =>
                                                        handleclose(
                                                          programacion
                                                        )
                                                      }
                                                    >
                                                      Gestionar solicitud
                                                    </a>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          {!programacion.fechaFinServicio &&
                                            !programacion.fechaInicioServicio &&
                                            (programacion.estado === 1 ||
                                              programacion.estado === 2) && (
                                              <button
                                                className="btn btn-primary me-2 mb-2"
                                                data-bs-toggle="modal"
                                                data-bs-target="#finishPostModal"
                                                onClick={() =>
                                                  handleclose(programacion)
                                                }
                                              >
                                                Observación
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))
                        )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Anterior
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>

        <p></p>
      </div>

      <div
        className="modal fade"
        id="finishPostModal"
        tabIndex="-1"
        aria-labelledby="finishPostModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content fondo2 text-white">
            <div className="modal-header bg-warning border-0">
              <h5 className="modal-title" id="finishPostModalLabel">
                Atención
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="p-3 bor">
              {/* Mostrar solo si estado es 0 */}
              {selectedprogramm.estado === 0 && (
                <div>
                  {/* Resumen arriba */}

                  <h4 className="mb-3">Confirmar solicitud</h4>
                  <div className="mb-3">
                    <label htmlFor="asignarArea" className="form-label">
                      Asignar área
                    </label>
                    {selectedprogramm.tipo !== undefined && (
                      <select
                        id="asignarArea"
                        className="form-select"
                        value={areaAsignada}
                        onChange={(e) => setAreaAsignada(e.target.value)}
                      >
                        <option value="">Selecciona un área...</option>
                        {areas
                          .filter((area) => area.tipo == selectedprogramm.tipo)
                          .map((area) => (
                            <option key={area.idArea} value={area.idArea}>
                              {area.nombre}
                            </option>
                          ))}
                      </select>
                    )}

                    <label htmlFor="asignarFecha" className="form-label mt-3">
                      Asignar fecha (Sugerida por conductor:{" "}
                      {new Date(selectedprogramm.fechaEstimadaLlegada)
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                      )
                    </label>
                    <input
                      type="datetime-local"
                      id="asignarFecha"
                      className="form-control"
                      value={fechaAsignada}
                      onChange={(e) => setFechaAsignada(e.target.value)}
                    />

                    <label className="form-label mt-3">
                      Observación (En caso de declinar)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                    />

                    <br />
                  </div>
                </div>
              )}

              {/* Mostrar solo si estado es 1 o 2 */}
              {(selectedprogramm.estado === 1 ||
                selectedprogramm.estado === 2) && (
                <div key={selectedprogramm.idProgramacion}>
                  <div className="modal-body fs-3">
                    ¿Estás seguro de que deseas finalizar este servicio?
                  </div>

                  <div className="card border-0">
                    <div className="card-header bg-dark text-white">
                      <h5 className="mb-0">
                        Vehículo # {selectedprogramm.numeroDelDia} del día{" "}
                        {selectedprogramm.diaFormateado}
                      </h5>
                    </div>

                    <div
                      className={`card-footer text-white fw-bold ${getEstadoClase(
                        selectedprogramm.estado
                      )}`}
                    >
                      {getEstadoTexto(selectedprogramm.estado)}
                    </div>

                    <div className="card-body">
                      {selectedprogramm?.tipo == 0 && (
                        <h2 className="card-title text-secondary">
                          {selectedprogramm.producto} -{" "}
                          <span className="text-muted">
                            {selectedprogramm.cantidad}
                          </span>
                        </h2>
                      )}

                      <p className="card-text mb-1">
                        <strong>Vehículo:</strong>{" "}
                        {selectedprogramm.vehiculo.placa} (
                        {selectedprogramm.vehiculo.tipo})
                      </p>
                      <p className="card-text mb-1">
                        <strong>Conductor:</strong>{" "}
                        {selectedprogramm.conductor.Nombre1}{" "}
                        {selectedprogramm.conductor.Nombre2}{" "}
                        {selectedprogramm.conductor.Apellido1}{" "}
                        {selectedprogramm.conductor.Apellido2}{" "}
                        <span className=" text-light-emphasis">
                          ({selectedprogramm.conductor.phone})
                        </span>
                      </p>
                      <p className="card-text mb-1">
                        <strong>Transportadora:</strong>{" "}
                        {selectedprogramm.conductor.transportadora?.nombre ||
                          selectedprogramm.conductor?.transportadorasugerida +
                            " (Transportadora sugerida por el conductor)"}
                      </p>

                      {selectedprogramm.fechaInicioServicio &&
                        selectedprogramm.fechaFinServicio && (
                          <>
                            <p className="card-text mb-1">
                              <strong>Inicio de servicio:</strong>{" "}
                              {new Date(selectedprogramm.fechaInicioServicio)
                                .toISOString()
                                .slice(0, 16)
                                .replace("T", " ")}
                            </p>
                            <p className="card-text mb-1">
                              <strong>Fin de servicio:</strong>{" "}
                              {new Date(selectedprogramm.fechaFinServicio)
                                .toISOString()
                                .slice(0, 16)
                                .replace("T", " ")}
                            </p>
                          </>
                        )}

                      {selectedprogramm.contacto && (
                        <p className="card-text mb-1">
                          <strong>Dirección:</strong>{" "}
                          {selectedprogramm.contacto}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Campos de cancelación o finalización */}
                  <br />
                  <div className="modal-title">
                    <div className="row">
                      <div className="col">
                        <label className="form-label">Inicio de servicio</label>
                        <input
                          type="datetime-local"
                          name="fechaInicioServicio"
                          className="form-control"
                          value={fechaInicio}
                          onChange={(e) => {
                            setfechaInicio(e.target.value);
                          }}
                        />

                        <label className="form-label mt-3">
                          Fin de servicio
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={fechaFin}
                          onChange={(e) => setfechaFin(e.target.value)}
                        />
                      </div>

                      <div className="col">
                        <label className="form-label">Razón</label>
                        <select
                          className="form-select"
                          value={estado}
                          onChange={(e) => setestado(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Finalizado">Finalizar</option>
                          <option value="Cancelado">Cancelar</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  fetch(variables("API") + `/programacion/declinate`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "token"
                      )}`,
                    },
                    body: JSON.stringify({
                      idProgramacion: selectedprogramm.idProgramacion,
                      estado: 3, // Código para "Declinado"
                      observacionessistema:
                        observacion ||
                        "Solicitud declinada por el administrador",
                    }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      Notificar(data.mensaje, data.status, "normal");
                      setprogramm([]);
                      FetchProgramaciones();
                      document
                        .getElementById("finishPostModal")
                        .classList.remove("show");
                      document
                        .getElementById("finishPostModal")
                        .setAttribute("aria-hidden", "true");
                      document.querySelector(".modal-backdrop").remove();
                    })
                    .catch((error) => {
                      Notificar(
                        "No se ha podido establecer conexión con el servidor",
                        "error",
                        "normal"
                      );
                    });
                }}
              >
                Declinar solicitud
              </button>
              <button
                type="button"
                className="btn bg-warning"
                onClick={() => {
                  // Send POST request to delete the post
                  if (
                    fechaFin != "" &&
                    fechaInicio != "" &&
                    estado == "Finalizado"
                  ) {
                    fetch(variables("API") + `/programacion/finish`, {
                      method: "POST", // Specify the method if needed (GET is default)
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${sessionStorage.getItem(
                          "token"
                        )}`, // Include the token in the Authorization header
                      },
                      body: JSON.stringify({
                        idProgramacion: selectedprogramm.idProgramacion,
                        fechaInicioServicio: fechaInicio,
                        fechaFinServicio: fechaFin,
                        estado: 4,
                        observacionessistema: observacion,
                      }),
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        Notificar(data.mensaje, data.status, "normal");
                        setprogramm([]);
                        FetchProgramaciones();
                        document
                          .getElementById("finishPostModal")
                          .classList.remove("show");
                        document
                          .getElementById("finishPostModal")
                          .setAttribute("aria-hidden", "true");
                        document.querySelector(".modal-backdrop").remove();
                      })
                      .catch((error) => {
                        Notificar(
                          "No se ha podido establecer conexión con el servidor",
                          "error",
                          "normal"
                        );
                      });
                  } else {
                    if (estado == "Cancelado") {
                      fetch(variables("API") + `/programacion/finish`, {
                        method: "POST", // Specify the method if needed (GET is default)
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${sessionStorage.getItem(
                            "token"
                          )}`, // Include the token in the Authorization header
                        },
                        body: JSON.stringify({
                          idProgramacion: selectedprogramm.idProgramacion,
                          fechaInicioServicio: fechaInicio,
                          fechaFinServicio: fechaFin,
                          estado: 3,
                          observacionessistema: observacion,
                        }),
                      })
                        .then((response) => response.json())
                        .then((data) => {
                          Notificar(data.mensaje, data.status, "normal");
                          setprogramm([]);
                          FetchProgramaciones();
                          document
                            .getElementById("finishPostModal")
                            .classList.remove("show");
                          document
                            .getElementById("finishPostModal")
                            .setAttribute("aria-hidden", "true");
                          document.querySelector(".modal-backdrop").remove();
                        })
                        .catch((error) => {
                          Notificar(
                            "No se ha podido establecer conexión con el servidor",
                            "error",
                            "normal"
                          );
                        });
                    } else {
                      if (
                        selectedprogramm.estado == 0 &&
                        fechaAsignada != "" &&
                        areaAsignada != "" &&
                        Montacargas > 0 &&
                        Auxiliares > 0
                      ) {
                        fetch(variables("API") + `/programacion/confirm`, {
                          method: "POST", // Specify the method if needed (GET is default)
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${sessionStorage.getItem(
                              "token"
                            )}`, // Include the token in the Authorization header
                          },
                          body: JSON.stringify({
                            idProgramacion: selectedprogramm.idProgramacion,
                            fechaAsignada: fechaAsignada,
                            idArea: areaAsignada,

                            idUsuario: sessionStorage.getItem("idUsuario"),
                          }),
                        })
                          .then((response) => response.json())
                          .then((data) => {
                            Notificar(data.mensaje, data.status, "normal");
                            setFechaAsignada("");
                            setAreaAsignada("");
                            setprogramm([]);
                            FetchProgramaciones();
                            document
                              .getElementById("finishPostModal")
                              .classList.remove("show");
                            document
                              .getElementById("finishPostModal")
                              .setAttribute("aria-hidden", "true");
                            document.querySelector(".modal-backdrop").remove();
                          })
                          .catch((error) => {
                            Notificar(
                              "No se ha podido establecer conexión con el servidor",
                              "error",
                              "normal"
                            );
                          });
                      } else {
                        Notificar(
                          "Llenar los campos requeridos",
                          "error",
                          "normal"
                        );
                      }
                    }
                  }
                }}
              >
                {selectedprogramm.estado == 0
                  ? "Confirmar solicitud"
                  : selectedprogramm.estado == 1 || 2
                  ? "Finzalizar"
                  : ""}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
//  <Publicar cargarPosts={cargarPosts}></Publicar>
