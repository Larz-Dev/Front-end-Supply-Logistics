import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cabecera from "./cabecera.jsx";
//import Publicar from "./publicar.jsx";
import {
  Validarsesion,
  Actualizar,
  variables,
  Notificar,
} from "./funciones.jsx";

import Sidebar from "./sidebar.jsx";

import CrearProgramacion from "./crearprogramacion.jsx";
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
  const postsPerPage = 6; // o cualquier número de publicaciones por página que desees
  const [actualizar, setActualizar] = useState(true);

  // Lógica de paginación
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredProgramaciones.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  const [sidebarVisible, setSidebarVisible] = useState(true);

  const totalPages = Math.ceil(filteredProgramaciones.length / postsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const programacionesPorDia = {};

  // Agrupar por fecha (basado en createdAt)
  currentPosts.forEach((prog) => {
    const fecha = new Date(prog.createdAt);
    const dia = fecha.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!programacionesPorDia[dia]) {
      programacionesPorDia[dia] = [];
    }

    programacionesPorDia[dia].push(prog);
  });

  const openEditModal = (idRecibo) => {
    setIdReciboToEdit(idRecibo);
    sessionStorage.setItem("idRecibo", idRecibo);
  };

  const closeEditModal = () => {
    setIdReciboToEdit("");
  };

  // Ordenar por createdAt dentro del día y asignar número
  Object.keys(programacionesPorDia).forEach((dia) => {
    programacionesPorDia[dia]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .forEach((prog, index) => {
        prog.numeroDelDia = index + 1;
        prog.diaFormateado = new Date(prog.createdAt).toLocaleDateString();
      });
  });

  useEffect(() => {
    if (actualizar) {
      fetchProgramaciones();
    }
  }, [actualizar]);

  const fetchProgramaciones = async () => {
    FetchProgramaciones();
    setActualizar(false); // Reinicia el estado después de actualizar
  };

  const FetchProgramaciones = () => {
    fetch(variables("API") + "/programacion/listingbypaginationbyid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        inicio: 0,
        fin: 20,
        id: sessionStorage.getItem("idUsuario"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProgramaciones(data.programaciones || []);
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

  useEffect(() => {
    const filtro = programaciones.filter(
      (p) =>
        (p.conductor.Nombre1?.toLowerCase() || "").includes(
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
        )
    );
    setFilteredProgramaciones(filtro);
  }, [searchTerm, programaciones]);
  return (
    <>
      <CrearProgramacion onCreated={() => setActualizar(true)} />
      <div className="row">
        <Cabecera></Cabecera>

        {sidebarVisible && (
          <div className="col-md-3 d-flex flex-column p-3 bg-light">
            <Sidebar />
          </div>
        )}

        <div
          className={sidebarVisible ? "col-md-9" : "col-md-12"}
          style={{
            maxHeight: "1000px",
            height: "100vh",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <div className="d-flex justify-content-start">
            <button
              className="btn mt-3 mx-4 btn-outline-secondary "
              onClick={() => setSidebarVisible(!sidebarVisible)}
            >
              {sidebarVisible ? "⮜ Ocultar menú" : "⮞ Mostrar menú"}
            </button>
          </div>

          <div className="  justify-content-md-center mt-3">
            {" "}
            <div className=" d-flex align-items-center m-3">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="placa"
                className="inner-shadow rounded form-control mx-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="row m-1">
              {programaciones.length >= 1 &&
                currentPosts.map((programacion) => (
                  <div
                    key={programacion.idProgramacion}
                    className="col-md-6 col-lg-3 mb-4"
                  >
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-dark text-white">
                        <h5 className="mb-0">
                          Vehículo número {programacion.numeroDelDia} del día{" "}
                          {programacion.diaFormateado}
                        </h5>
                      </div>
                      <div
                        className={`card-footer text-white fw-bold  ${
                          programacion.estado === "En curso"
                            ? "bg-primary"
                            : programacion.estado === "Retraso"
                            ? "bg-warning "
                            : programacion.estado === "Observación"
                            ? "bg-danger "
                            : programacion.estado === "Cancelado"
                            ? "bg-danger "
                            : programacion.estado === "Finalizado"
                            ? "bg-success "
                            : ""
                        }`}
                      >
                        {programacion.estado}
                      </div>
                      <div className="card-body">
                        <h2 className="card-title text-secondary">
                          {programacion.producto} -{" "}
                          <span className="text-muted">
                            {" "}
                            {programacion.cantidad}
                          </span>
                        </h2>

                        <p className="card-text mb-1">
                          <strong>Vehículo:</strong>{" "}
                          {programacion.vehiculo.placa} (
                          {programacion.vehiculo.tipo})
                        </p>

                        <p className="card-text mb-1">
                          <strong>Fecha estimada:</strong>{" "}
                          {new Date(
                            programacion.fechaEstimadaLlegada
                          ).toLocaleString()}
                        </p>

                        {programacion.fechaInicioServicio &&
                          programacion.fechaFinServicio && (
                            <>
                              <p className="card-text mb-1">
                                <strong>Inicio de servicio:</strong>{" "}
                                {new Date(
                                  programacion.fechaInicioServicio
                                ).toLocaleString()}
                              </p>
                              <p className="card-text mb-1">
                                <strong>Fin de servicio:</strong>{" "}
                                {new Date(
                                  programacion.fechaFinServicio
                                ).toLocaleString()}
                              </p>
                            </>
                          )}

                        {programacion.contacto && (
                          <p className="card-text mb-1">
                            <strong>Dirección:</strong> {programacion.contacto}
                          </p>
                        )}
                      </div>
                      <div className="card-footer text-muted">
                        Programado el{" "}
                        {new Date(programacion.createdAt).toLocaleString()}
                      </div>
                      {programacion.observaciones && (
                        <div className="card-footer text-muted">
                          <strong>Observaciones:</strong>{" "}
                          {programacion.observaciones}
                        </div>
                      )}{" "}
                      {programacion.observacionessistema && (
                        <div className="card-footer text-muted">
                          <strong>Sistema:</strong>{" "}
                          {programacion.observacionessistema}
                        </div>
                      )}{" "}
                      <div className="card-footer text-muted">
                        <div className="text-end">
                          {!programacion.fechaFinServicio &&
                            !programacion.fechaInicioServicio &&
                            (programacion.estado == "En curso" ||
                              programacion.estado == "Retraso") && (
                              <div>
                                <a
                                  className="btn btn-primary fw-bold text-white"
                                  data-bs-toggle="modal"
                                  data-bs-target="#finishPostModal"
                                  onClick={() => handleclose(programacion)}
                                >
                                  {" "}
                                  Observacion
                                </a>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
            <div className="modal-body fs-3">
              Desea dejar una observación?
              <p>
                {" "}
                <span className=" text-mute fs-6">
                  (Esta será observada por los administradores)
                </span>
              </p>
            </div>

            <div className=" p-3 bor">
              {selectedprogramm.estado && (
                <div key={selectedprogramm.idProgramacion}>
                  <div className="card border-0 ">
                    <div className="card-header bg-dark text-white">
                      <h5 className="mb-0">
                        Vehículo número {selectedprogramm.numeroDelDia} del día{" "}
                        {selectedprogramm.diaFormateado}
                      </h5>
                    </div>
                    <div
                      className={`card-footer text-white fw-bold  ${
                        selectedprogramm.estado === "En curso"
                          ? "bg-primary"
                          : selectedprogramm.estado === "Retraso"
                          ? "bg-warning "
                          : selectedprogramm.estado === "Observación"
                          ? "bg-danger "
                          : selectedprogramm.estado === "Cancelado"
                          ? "bg-danger "
                          : selectedprogramm.estado === "Finalizado"
                          ? "bg-success "
                          : ""
                      }`}
                    >
                      {selectedprogramm.estado}
                    </div>
                    <div className="card-body">
                      <h2 className="card-title text-secondary">
                        {selectedprogramm.producto} -{" "}
                        <span className="text-muted">
                          {" "}
                          {selectedprogramm.cantidad}
                        </span>
                      </h2>

                      <p className="card-text mb-1">
                        <strong>Vehículo:</strong>{" "}
                        {selectedprogramm.vehiculo.placa} (
                        {selectedprogramm.vehiculo.tipo})
                      </p>

                      <p className="card-text mb-1">
                        <strong>Fecha estimada:</strong>{" "}
                        {new Date(
                          selectedprogramm.fechaEstimadaLlegada
                        ).toLocaleString()}
                      </p>

                      {selectedprogramm.fechaInicioServicio &&
                        selectedprogramm.fechaFinServicio && (
                          <>
                            <p className="card-text mb-1">
                              <strong>Inicio de servicio:</strong>{" "}
                              {new Date(
                                selectedprogramm.fechaInicioServicio
                              ).toLocaleString()}
                            </p>
                            <p className="card-text mb-1">
                              <strong>Fin de servicio:</strong>{" "}
                              {new Date(
                                selectedprogramm.fechaFinServicio
                              ).toLocaleString()}
                            </p>
                          </>
                        )}
                    </div>
                    <div className="card-footer text-muted">
                      Programado el{" "}
                      {new Date(selectedprogramm.createdAt).toLocaleString()}
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
                Cancelar
              </button>

              {selectedprogramm.estado == "En curso" && (
                <button
                  type="button"
                  className="btn bg-warning text-white"
                  onClick={() => {
                    // Send POST request to delete the post

                    fetch(
                      variables("API") + `/programacion/estadobyconductor`,
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
                          estado: "Retraso",
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

              {selectedprogramm.estado != "Finalizado" &&
                selectedprogramm.estado != "Cancelado" && (
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
                          });
                      } else {
                        Notificar(
                          "Porfavor, establecer los tiempos de servicio",
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
    </>
  );
}

export default App;
//  <Publicar cargarPosts={cargarPosts}></Publicar>
