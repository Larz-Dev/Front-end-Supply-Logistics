import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cabecera from "./cabecera.jsx";
import React from "react";
import { useIsMobile } from "./useIsMobile.jsx"; // ajusta el path

//import Publicar from "./publicar.jsx";
import {
  Validarsesion,
  Actualizar,
  variables,
  Notificar,
  getEstadoClase,
  getEstadoTexto,
} from "./funciones.jsx";

import Sidebar from "./sidebar.jsx";

//import CrearProgramacion from "./generarsolicitudrecepcion.jsx";
import CrearSolicitud from "./generaarsolicitud.jsx";
//import GenerarSolicitudDespacho from "./generarsolicituddespacho.jsx";
function App() {
  Validarsesion();
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
  const [currentPage, setCurrentPage] = useState(1);

  const [actualizar, setActualizar] = useState(true);
  const [buscarFecha, setbuscarFecha] = useState(true);
  const [todo, setTodo] = useState(false);
  const isMobile = useIsMobile();
  const [estadoProgramacion, setEstadoprogramacion] = useState(5);
  const [total, setTotal] = useState(0);

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
  useEffect(() => {
    const hoy = obtenerFechaHoy();
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

  const openEditModal = (idRecibo) => {
    setIdReciboToEdit(idRecibo);
    sessionStorage.setItem("idRecibo", idRecibo);
  };

  const closeEditModal = () => {
    setIdReciboToEdit("");
  };

  const programacionesPorArea = {};

  // Agrupar por área y luego por fecha (formateada como YYYY-MM-DD)
  filteredProgramaciones.forEach((prog) => {
    const area = prog.area?.nombre;
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
  Object.keys(programacionesPorArea).forEach((area) => {
    Object.keys(programacionesPorArea[area]).forEach((fecha) => {
      programacionesPorArea[area][fecha]
        .sort((a, b) => new Date(a.fechaAsignada) - new Date(b.fechaAsignada))
        .forEach((prog, index) => {
          prog.fechaAsignada;
        });
    });
  });

  const FiltrarestadoProgramacion = (opcion) => {
    let estadoactual = estadoProgramacion;
    if (opcion == ">") {
      setEstadoprogramacion(estadoactual + 1);
      if (estadoProgramacion > 8) {
        setEstadoprogramacion(0);
      }
    }

    if (opcion != ">") {
      setEstadoprogramacion(estadoactual - 1);
      if (estadoProgramacion < 0) {
        setEstadoprogramacion(8);
      }
    }

    console.log(estadoactual);
  };

  const FetchProgramaciones = () => {
    fetch(variables("API") + "/programacion/listingbypaginationbyid", {
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
        id: sessionStorage.getItem("idUsuario"),
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
  };

  const handleclose = (item) => {
    setprogramm(item);
  };

  const fetchProgramaciones = async () => {
    FetchProgramaciones();
    setActualizar(false); // Reinicia el estado después de actualizar
  };

  const Cargartodo = () => {
    setTodo(true);
  };

  useEffect(() => {
    if (todo == true) {
      FetchProgramaciones();
    }
  }, [todo]);

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
          (p.servicio?.nombre?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )) &&
        (estadoProgramacion === 5 || p.estado === estadoProgramacion)
    );
    setFilteredProgramaciones(filtro);
  }, [searchTerm, programaciones, estadoProgramacion]);

  const agrupadasPorArea = filteredProgramaciones
    .sort((a, b) => {
      const horaA = new Date(a.fechaAsignada || a.fechaEstimadaLlegada);
      const horaB = new Date(b.fechaAsignada || b.fechaEstimadaLlegada);
      return horaA - horaB;
    })
    .reduce((acc, prog) => {
      const area = "En construcción";
      if (!acc[area]) acc[area] = [];
      acc[area].push(prog);
      return acc;
    }, {});

  useEffect(() => {
    if (rangoInicio && rangoFin) {
      FetchProgramaciones();
    }
  }, [currentPage]);

  return (
    <>
      <div className="row w-100 p-0 m-0 ">
        {sidebarVisible && (
          <div
            className={`d-flex flex-column align-items-center  bg-light  ${
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

          <div className=" ">
            {" "}
            <div className=" justify-content-md-center">
              {" "}
              <div className=" d-flex align-items-center  mx-auto my-2 px-3">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Buscar por transportadora, placa, área, o concepto"
                  className="inner-shadow rounded form-control mx-2 "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/*     <CrearProgramacion onCreated={() => fetchProgramaciones()} />
                   <GenerarSolicitudDespacho onCreated={() => fetchProgramaciones()} />  */}

                <CrearSolicitud onCreated={() => fetchProgramaciones()} />
                <button
                  className="btn btn-warning col-md-2 mx-1 "
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
                  className={`btn mx-1  text-nowrap col-4 text-white fw-bold  ${getEstadoClase(
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
              <div className="bg-dark">
                {Object.keys(agrupadasPorArea).map((area, areaIdx) => {
                  // Agrupar las programaciones por fecha dentro de cada área
                  const programacionesPorFecha = {};
                  agrupadasPorArea[area].forEach((p) => {
                    const fecha = new Date(
                      p.fechaEstimadaLlegada
                    ).toLocaleDateString();
                    if (!programacionesPorFecha[fecha])
                      programacionesPorFecha[fecha] = [];
                    programacionesPorFecha[fecha].push(p);
                  });

                  return (
                    <div className="">
                      <div className="table-responsive">
                        <table className="table table-hover table-dark table-bordered m-0">
                          <thead className="text-uppercase text-center font-monospace">
                            <tr>
                              <th>#</th>
                              <th>Área</th>
                              <th>Tipo</th> {/* Nueva columna */}
                              <th>Vehículo</th>
                              <th>Servicio</th>
                              <th>Valor</th>
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
                                      <React.Fragment
                                        key={programacion.idProgramacion}
                                      >
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
                                          <td>{programacion?.servicio?.nombre}</td>
                                          <td>{programacion?.servicio?.valor?.toLocaleString("es-CO")} $</td>
                                          <td>
                                             <span
                                      className={`badge fs-6 font-monospace bg-success mb-1
                                      `}
                                    >
                                      Salida:{" "}
                                      {new Date(programacion.fechaSalida)
                                        .toISOString()
                                        .slice(0, 16)
                                        .replace("T", " ")}
                                    </span>

                                            <span
                                              className={`badge fs-6 font-monospace ${
                                                programacion.fechaAsignada
                                                  ? "bg-primary"
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
                                                {getEstadoTexto(
                                                  programacion.estado
                                                )}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="text-center">
                                            <button className="btn btn-sm btn-light">
                                              Ver más
                                            </button>
                                          </td>
                                        </tr>
                                        {/* Detalles colapsables */}
                                        <tr>
                                          <td colSpan="9" className="p-0">
                                            <div
                                              id={`collapse-${areaIdx}-${fechaIdx}-${idx}`}
                                              className="collapse bg-light text-dark pt-3 "
                                            >
                                              <div className="container-fluid">
                                                <div className="row">
                                                  <div className="col-md-4 mb-1">
                                                    {programacion.fechaAsignada && (
                                                      <p>
                                                        <strong>
                                                          Asignado para:
                                                        </strong>
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

                                                  <div className="col-md-4 mb-1">
                                                    {programacion.contacto && (
                                                      <p>
                                                        <strong>
                                                          Dirección:
                                                        </strong>
                                                        <br />
                                                        {programacion.contacto}
                                                      </p>
                                                    )}
                                                    {programacion.observaciones && (
                                                      <p>
                                                        <strong>
                                                          Observaciones:
                                                        </strong>
                                                        <br />
                                                        {
                                                          programacion.observaciones
                                                        }
                                                      </p>
                                                    )}
                                                    {programacion.observacionessistema && (
                                                      <p>
                                                        <strong>
                                                          Sistema:
                                                        </strong>
                                                        <br />
                                                        {
                                                          programacion.observacionessistema
                                                        }
                                                      </p>
                                                    )}
                                                  </div>

                                                  <div className="col-md-4 mb-1">
                                                    <p className="mb-1">
                                                      <strong>
                                                        Conductor:
                                                      </strong>
                                                      <br />
                                                      {
                                                        programacion.conductor
                                                          .Nombre1
                                                      }{" "}
                                                      {
                                                        programacion.conductor
                                                          .Nombre2
                                                      }{" "}
                                                      {
                                                        programacion.conductor
                                                          .Apellido1
                                                      }{" "}
                                                      {
                                                        programacion.conductor
                                                          .Apellido2
                                                      }
                                                      <br />
                                                      <small className="text-muted">
                                                        (
                                                        {
                                                          programacion.conductor
                                                            .phone
                                                        }
                                                        )
                                                      </small>
                                                    </p>
                                                    <p className="mb-1">
                                                      <strong>
                                                        Transportadora:
                                                      </strong>
                                                      <br />
                                                      {programacion.conductor
                                                        .transportadora
                                                        ?.nombre ||
                                                        programacion.conductor
                                                          .transportadorasugerida +
                                                          " (Sugerida)"}
                                                    </p>
                                                    {programacion.confirmador
                                                      ?.user && (
                                                      <p className="badge bg-primary fs-6">
                                                        <strong>
                                                          Confirmador:
                                                        </strong>
                                                        <br />
                                                        {programacion
                                                          .confirmador.user +
                                                          " (" +
                                                          programacion
                                                            .confirmador
                                                            .documento +
                                                          ")"}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="text-end mt-1">
                                                  {!programacion.fechaFinServicio &&
                                                    !programacion.fechaInicioServicio &&
                                                    programacion.estado !==
                                                      3 && (
                                                      <>
                                                        {programacion.estado ===
                                                          0 && (
                                                          <a
                                                            className="btn btn-danger fw-bold text-white me-2 mb-2"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#cancelPostModal"
                                                            onClick={() =>
                                                              handleclose(
                                                                programacion
                                                              )
                                                            }
                                                          >
                                                            Cancelar Solicitud
                                                          </a>
                                                        )}
                                                      </>
                                                    )}
                                                  {!programacion.fechaFinServicio &&
                                                    !programacion.fechaInicioServicio &&
                                                    (programacion.estado ===
                                                      7 ||
                                                      programacion.estado ===
                                                        2) && (
                                                      <button
                                                        className="btn btn-primary me-2 mb-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#finishPostModal"
                                                        onClick={() =>
                                                          handleclose(
                                                            programacion
                                                          )
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

                      <div className=" text-white fs-3 fw-bold  text-center bg-dark"></div>
                    </div>
                  );
                })}
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
            <div className="modal-header bg-warning  border-0">
              <h5
                className="modal-title text-dark fw-bold"
                id="finishPostModalLabel"
              >
                Atención
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body fs-3">
              Desea dejar una observación?
              <p>
                {" "}
                <span className=" text-mute fs-6">
                  (Esta será notificada a administradores)
                </span>
              </p>
            </div>

            <div className=" p-3 ">
              {selectedprogramm.idProgramacion != "" && (
                <div key={selectedprogramm.idProgramacion}>
                  <div className="card border-0 ">
                    <div className="card-header bg-dark text-white">
                      <h5 className="mb-0">
                        Vehículo número {selectedprogramm.numeroDelDia} del día{" "}
                        {selectedprogramm.diaFormateado}
                      </h5>
                    </div>
                    <div
                      className={`card-footer text-white fw-bold  ${getEstadoClase(
                        selectedprogramm.estado
                      )}`}
                    >
                      {getEstadoTexto(selectedprogramm.estado)}
                    </div>
                    <div className="card-body">
                      {selectedprogramm?.tipo == 0 && (
                        <h2 className="card-title text-secondary">
                          {selectedprogramm?.servicio?.nombre} -{" "}
                          <span className="text-muted">
                            {selectedprogramm?.servicio?.valor?.toLocaleString("es-CO")} $
                          </span>
                        </h2>
                      )}

                      <p className="card-text mb-1">
                        <strong>Vehículo:</strong>{" "}
                        {selectedprogramm.vehiculo?.placa} (
                        {selectedprogramm.vehiculo?.tipo})
                      </p>

                      {selectedprogramm.fechaAsignada ? (
                        <div className="bg-success text-white p-2 rounded mb-2">
                          <p className="card-text mb-1">
                            <strong>Fecha asignada:</strong>{" "}
                            {new Date(selectedprogramm.fechaAsignada)
                              .toISOString()
                              .slice(0, 16)
                              .replace("T", " ")}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Área asignada:</strong> En construcción
                          </p>
                        </div>
                      ) : (
                        <p className="card-text mb-1">
                          <strong>Fecha estimada:</strong>{" "}
                          {selectedprogramm.fechaEstimadaLlegada
                            ? new Date(selectedprogramm.fechaEstimadaLlegada)
                                .toISOString()
                                .slice(0, 16)
                                .replace("T", " ")
                            : "Sin fecha estimada"}
                        </p>
                      )}

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
                    </div>
                    <div className="card-footer text-muted">
                      Programado el{" "}
                      {selectedprogramm.createdAt
                        ? new Date(selectedprogramm.createdAt)
                            .toISOString()
                            .slice(0, 16)
                            .replace("T", " ")
                        : "Sin fecha estimada"}
                    </div>
                    {selectedprogramm.observaciones && (
                      <div className="card-footer text-muted">
                        <strong>Observaciones:</strong>{" "}
                        {selectedprogramm.observaciones}
                      </div>
                    )}{" "}
                    {selectedprogramm.observacionessistema && (
                      <div className="card-footer text-muted">
                        <strong>Sistema:</strong>{" "}
                        {selectedprogramm.observacionessistema}
                      </div>
                    )}{" "}
                    <div className="card-footer text-muted">
                      <div className="text-end"></div>
                    </div>
                  </div>
                </div>
              )}

              <div className=" modal-title">
                <div className="row">
                  <div className="col">
                    <label
                      htmlFor=""
                      name="fechaFinServicio"
                      className="form-label"
                    >
                      <br />
                      Observación
                    </label>

                    <input
                      name=""
                      id=""
                      type="text"
                      className=" form-control"
                      value={observacion}
                      onChange={(event) => setObservacion(event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Atrás
              </button>

              {selectedprogramm.estado == 7 && (
                <button
                  type="button"
                  className="btn bg-warning text-white"
                  onClick={() => {
                    fetch(
                      variables("API") + `/programacion/retrasobyConductor`,
                      {
                        method: "POST", // Specify the method if needed (GET is default)
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${sessionStorage.getItem(
                            "token"
                          )}`, // Include the token in the Authorization header
                        },
                        body: JSON.stringify({
                          idProgramacion: selectedprogramm.idProgramacion,
                        }),
                      }
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        Notificar(data.mensaje, data.status, "normal");
                        setprogramm([]);
                        setObservacion("");
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
                  Notificar retraso
                </button>
              )}

              {selectedprogramm.estado != 4 && selectedprogramm.estado != 3 && (
                <button
                  type="button"
                  className="btn bg-primary text-white"
                  onClick={() => {
                    // Send POST request to delete the post
                    if (observacion != "") {
                      fetch(
                        variables("API") +
                          `/programacion/observacionyyConductor`,
                        {
                          method: "POST", // Specify the method if needed (GET is default)
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${sessionStorage.getItem(
                              "token"
                            )}`, // Include the token in the Authorization header
                          },
                          body: JSON.stringify({
                            idProgramacion: selectedprogramm.idProgramacion,
                            observaciones: observacion,
                          }),
                        }
                      )
                        .then((response) => response.json())
                        .then((data) => {
                          Notificar(data.mensaje, data.status, "normal");
                          setprogramm([]);
                          setObservacion("");

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
                          console.log(error);
                        });
                    } else {
                      Notificar(
                        "Debe ingresar una observacion antes de enviar",
                        "error",
                        "normal"
                      );
                    }
                  }}
                >
                  Observación
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="cancelPostModal"
        tabIndex="-1"
        aria-labelledby="cancelPostModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content fondo2 text-white">
            <div className="modal-header bg-warning border-0">
              <h5
                className="modal-title text-dark fw-bold"
                id="finishPostModalLabel"
              >
                Atención
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body fs-3">
              Estás seguro que desesa cancelar la solicitud?
              <p>
                {" "}
                <span className=" text-mute fs-6">
                  (Esta será notificada a administradores)
                </span>
              </p>
            </div>

            <div className=" p-3 ">
              {selectedprogramm.idProgramacion != "" && (
                <div key={selectedprogramm.idProgramacion}>
                  <div className="card border-0 ">
                    <div className="card-header bg-dark text-white">
                      <h5 className="mb-0">
                        Vehículo número {selectedprogramm.numeroDelDia} del día{" "}
                        {selectedprogramm.diaFormateado}
                      </h5>
                    </div>
                    <div
                      className={`card-footer text-white fw-bold  ${getEstadoClase(
                        selectedprogramm.estado
                      )}`}
                    >
                      {getEstadoTexto(selectedprogramm.estado)}
                    </div>
                    <div className="card-body">
                      {selectedprogramm.tipo == 0 && (
                        <h2 className="card-title text-secondary">
                          {selectedprogramm?.servicio?.nombre} -{" "}
                          <span className="text-muted">
                            {selectedprogramm?.servicio?.valor?.toLocaleString("es-CO")} $
                          </span>
                        </h2>
                      )}
                      <p className="card-text mb-1">
                        <strong>Vehículo:</strong>{" "}
                        {selectedprogramm.vehiculo?.placa} (
                        {selectedprogramm.vehiculo?.tipo})
                      </p>

                      {selectedprogramm.fechaAsignada ? (
                        <div className="bg-success text-white p-2 rounded mb-2">
                          <p className="card-text mb-1">
                            <strong>Fecha asignada:</strong>{" "}
                            {selectedprogramm.fechaAsignada
                              ? new Date(selectedprogramm.fechaAsignada)
                                  .toISOString()
                                  .slice(0, 16)
                                  .replace("T", " ")
                              : "Sin fecha estimada"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Área asignada:</strong> En construcción
                          </p>
                        </div>
                      ) : (
                        <p className="card-text mb-1">
                          <strong>Fecha estimada:</strong>{" "}
                          {selectedprogramm.fechaEstimadaLlegada
                            ? new Date(selectedprogramm.fechaEstimadaLlegada)
                                .toISOString()
                                .slice(0, 16)
                                .replace("T", " ")
                            : "Sin fecha estimada"}
                        </p>
                      )}

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
                    </div>
                    <div className="card-footer text-muted">
                      Programado el{" "}
                      {selectedprogramm.createdAt
                        ? new Date(selectedprogramm.createdAt)
                            .toISOString()
                            .slice(0, 16)
                            .replace("T", " ")
                        : "Sin fecha estimada"}
                    </div>
                    {selectedprogramm.observaciones && (
                      <div className="card-footer text-muted">
                        <strong>Observaciones:</strong>{" "}
                        {selectedprogramm.observaciones}
                      </div>
                    )}{" "}
                    {selectedprogramm.observacionessistema && (
                      <div className="card-footer text-muted">
                        <strong>Sistema:</strong>{" "}
                        {selectedprogramm.observacionessistema}
                      </div>
                    )}{" "}
                    <div className="card-footer text-muted">
                      <div className="text-end"></div>
                    </div>
                  </div>
                </div>
              )}

              <div className=" modal-title">
                <div className="row">
                  <div className="col"></div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Atrás
              </button>

              {selectedprogramm.estado == 7 && (
                <button
                  type="button"
                  className="btn bg-warning text-white"
                  onClick={() => {
                    fetch(
                      variables("API") + `/programacion/observacionyyConductor`,
                      {
                        method: "POST", // Specify the method if needed (GET is default)
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${sessionStorage.getItem(
                            "token"
                          )}`, // Include the token in the Authorization header
                        },
                        body: JSON.stringify({
                          idProgramacion: selectedprogramm.idProgramacion,
                          observaciones: observacion,
                        }),
                      }
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        Notificar(data.mensaje, data.status, "normal");
                        setprogramm([]);
                        setObservacion("");
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
                  Notificar retraso
                </button>
              )}

              {selectedprogramm.estado == 0 && (
                <button
                  type="button"
                  className="btn bg-danger text-white"
                  onClick={() => {
                    // Send POST request to delete the post

                    fetch(
                      variables("API") + `/programacion/cancelarbyconductor`,
                      {
                        method: "POST", // Specify the method if needed (GET is default)
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${sessionStorage.getItem(
                            "token"
                          )}`, // Include the token in the Authorization header
                        },
                        body: JSON.stringify({
                          idProgramacion: selectedprogramm.idProgramacion,
                          observaciones: observacion,
                        }),
                      }
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        Notificar(data.mensaje, data.status, "normal");
                        setprogramm([]);
                        setObservacion("");

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
                        console.log(error);
                      });
                  }}
                >
                  Cancelar solicitud
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
//  <Publicar cargarPosts={cargarPosts}></Publicar>
