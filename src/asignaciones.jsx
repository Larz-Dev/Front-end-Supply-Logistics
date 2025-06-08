import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Asignaciones = () => {
  const [areas, setAreas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [collapseOpen, setCollapseOpen] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAreasConProgramacion();
  }, []);

  const fetchAreasConProgramacion = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        variables("API") + "/programacion/areasandprogramacion",
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Error al obtener áreas y programaciones");
      const data = await res.json();

      const { areas, recurso, totalAreas, areasConProgramacionActual } = data;
      setAreas(areas);
      setResumen({ recurso, totalAreas, areasConProgramacionActual });
    } catch (error) {
      Notificar(error.message, "error", "normal");
    }
    setLoading(false);
  };

  const toggleCollapse = (idArea) => {
    setCollapseOpen((prev) => ({
      ...prev,
      [idArea]: !prev[idArea],
    }));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Áreas y Programaciones</h2>

      {loading && <p className="fw-bold">Cargando datos...</p>}

      {resumen && (
        <div className="alert alert-info d-flex flex-wrap justify-content-between align-items-center mb-4 shadow-sm">
          <div>
            <strong>Áreas registradas:</strong> {resumen.totalAreas}{" "}
            <strong>con programación:</strong>{" "}
            {resumen.areasConProgramacionActual}
          </div>
          <div>
            <strong>Montacargas:</strong> {resumen.recurso.montacargasActuales}{" "}
            / {resumen.recurso.totalMontacargas}{" "}
            <i className="fas fa-truck text-primary"></i>
          </div>
          <div>
            <strong>Auxiliares:</strong> {resumen.recurso.auxiliaresActuales} /{" "}
            {resumen.recurso.totalAuxiliares}{" "}
            <i className="fas fa-user text-info"></i>
          </div>
        </div>
      )}

      <div className="row">
        {areas.map((area) => {
          const tieneProgramacion = !!area.programacionActual;
          return (
            <div key={area.idArea} className="col-md-3 mb-4">
              <div
                className={`card shadow-sm h-100 ${
                  tieneProgramacion ? "border-success" : "border-primary"
                }`}
              >
            <div
  className={`card-header d-flex justify-content-between align-items-center ${
    tieneProgramacion ? "bg-success" : "bg-primary"
  } text-white`}
>
  <div>
    <h5 className="mb-0">{area.nombre}</h5>
    <small>
      Tipo: <b>{area.tipo || "No definido"}</b>
    </small>
  </div>
  {tieneProgramacion && (
    <span className="badge bg-light text-success fw-semibold">Ocupado</span>
  )}
</div>


                <div className="card-body d-flex flex-column">
                  <div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="fw-semibold me-2">
                        Montacargas asignados:
                      </span>
                      {area.montacargasAsignados > 0 ? (
                        <>
                          <span className="badge bg-warning text-dark fs-6 me-2">
                            {area.montacargasAsignados}
                          </span>
                          <i className="fas fa-truck fa-lg text-warning"></i>
                        </>
                      ) : (
                        <small className="fw-bold text-dark">No hay</small>
                      )}
                    </div>

                    <div className="d-flex align-items-center">
                      <span className="fw-semibold me-2">
                        Auxiliares asignados:
                      </span>
                      {area.auxiliaresAsignados > 0 ? (
                        <>
                          <span className="badge bg-info text-white fs-6 me-2">
                            {area.auxiliaresAsignados}
                          </span>
                          <i className="fas fa-user text-info"></i>
                        </>
                      ) : (
                        <small className="fw-bold text-dark">No hay</small>
                      )}
                    </div>
                    <p></p>
                  </div>

                  <button
                    className={`btn ${
                      collapseOpen[area.idArea]
                        ? tieneProgramacion
                          ? "btn-outline-success"
                          : "btn-outline-primary"
                        : tieneProgramacion
                        ? "btn-success"
                        : "btn-primary"
                    } mt-auto`}
                    onClick={() => toggleCollapse(area.idArea)}
                    aria-expanded={collapseOpen[area.idArea] || false}
                  >
                    {collapseOpen[area.idArea]
                      ? "Ocultar Programación"
                      : "Ver Programación"}
                    <i
                      className={`ms-2 fas fa-chevron-${
                        collapseOpen[area.idArea] ? "up" : "down"
                      }`}
                    ></i>
                  </button>

                  {collapseOpen[area.idArea] && (
                    <div
                      className="mt-3"
                      style={{ maxHeight: "350px", overflowY: "auto" }}
                    >
                      {tieneProgramacion ? (
                        <div className="border rounded p-3 bg-light">
                          <div>
                            <strong>ID:</strong>{" "}
                            {area.programacionActual.numeroDelDia}
                          </div>
                          <div>
                            <strong>Producto:</strong>{" "}
                            {area.programacionActual.producto}
                          </div>
                          <div>
                            <strong>Cantidad:</strong>{" "}
                            {area.programacionActual.cantidad}
                          </div>
                          <div>
                            <strong>Conductor:</strong>{" "}
                            {area.programacionActual.conductor ? (
                              <>
                                <i className="fas fa-user text-secondary me-1"></i>
                                {`${
                                  area.programacionActual.conductor.Nombre1 ||
                                  ""
                                } ${
                                  area.programacionActual.conductor.Apellido1 ||
                                  ""
                                } (${area.programacionActual.conductor.phone})`}
                              </>
                            ) : (
                              "Sin conductor"
                            )}
                          </div>
                          <div>
                            <strong>Confirmador:</strong>{" "}
                            {area.programacionActual.confirmador ? (
                              <>
                                <i className="fas fa-user-check text-success me-1"></i>
                                {`${area.programacionActual.confirmador.user} (${area.programacionActual.confirmador.documento})`}
                              </>
                            ) : (
                              "Sin confirmador"
                            )}
                          </div>
                          <div>
                            <strong>Dirección:</strong>{" "}
                            {area.programacionActual.contacto || ""}
                          </div>
                          <div>
                            <strong>Observación:</strong>{" "}
                            {area.programacionActual.observaciones || ""}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted">
                          No hay programación para esta área.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Asignaciones;
