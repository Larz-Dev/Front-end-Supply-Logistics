import React, { useEffect, useState } from "react";
import { variables, Notificar } from "./funciones";

const ColaProgramaciones = () => {
  const [programacionesPorArea, setProgramacionesPorArea] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programacionSeleccionada, setProgramacionSeleccionada] =
    useState(null);
  const [subareas, setSubareas] = useState([]);
  const [subareaSeleccionada, setSubareaSeleccionada] = useState("");

  useEffect(() => {
    fetchColaProgramaciones();
  }, []);

  const fetchColaProgramaciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(variables("API") + "/programacion/Cola", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (!res.ok)
        throw new Error("Error al obtener la cola de programaciones");
      const data = await res.json();
      setProgramacionesPorArea(data.programacionesPorArea || []);
    } catch (error) {
      Notificar(error.message, "error", "normal");
    }
    setLoading(false);
  };

  const abrirModal = async (programacion) => {
    setProgramacionSeleccionada(programacion);
    setSubareaSeleccionada("");

    if (!programacion?.idArea) return;

    try {
      const res = await fetch(
        variables("API") + "/programacion/listarsubareas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ idArea: programacion.idArea }),
        }
      );

      const data = await res.json();
      if (data.status !== "success") throw new Error(data.mensaje);
      setSubareas(data.subareas || []);
    } catch (error) {
      Notificar(
        "Error al cargar subáreas: " + error.message,
        "error",
        "normal"
      );
    }
  };

  const añadirACola = async () => {
    if (!subareaSeleccionada || !programacionSeleccionada) {
      Notificar("Selecciona una subárea válida", "error", "normal");
      return;
    }

    try {
      const res = await fetch(variables("API") + "/programacion/addCola", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          idProgramacion: programacionSeleccionada.idProgramacion,
          idArea: programacionSeleccionada.idArea,
          idSubarea: subareaSeleccionada,
        }),
      });

      const data = await res.json();
      if (data.status !== "success") throw new Error(data.mensaje);

      Notificar("Añadido correctamente a la cola", "success", "normal");

      // Cerrar el modal y refrescar
      document.querySelector("#modalDetalle .btn-close")?.click();
      fetchColaProgramaciones();
    } catch (error) {
      Notificar(
        "Error al añadir a la cola: " + error.message,
        "error",
        "normal"
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📌 Programaciones confirmadas por área</h2>

      {loading && <p className="fw-bold">Cargando datos...</p>}

      <div className="row">
        {programacionesPorArea.map((area) => (
          <div key={area.idArea} className="col-md-4 mb-4">
            <div className="card border-success shadow-sm h-100">
              <div className="card-header bg-success text-white text-center">
                <h5 className="mb-0">{area.nombre}</h5>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Conductor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {area.programaciones.map((p, index) => (
                      <tr
                        key={p.idProgramacion}
                        data-bs-toggle="modal"
                        data-bs-target="#modalDetalle"
                        onClick={() => abrirModal(p)}
                        style={{ cursor: "pointer" }}
                        className={p.estado === 2 ? "fw-bold" : ""}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <span
                            className={
                              p.tipo === 1
                                ? "bg-success badge"
                                : "bg-primary badge"
                            }
                          >
                            {p.tipo === 1 ? "Despacho" : "Recepción"}
                          </span>
                        </td>
                        <td>
                          {`${p.conductor?.Nombre1 || ""} ${
                            p.conductor?.Apellido1 || ""
                          }`}
                          <br />
                          {p.tipo === 0 ? (
                            <span className="text-muted small">
                              {p?.servicio?.nombre || "—"} - {p?.servicio?.valor?.toLocaleString("es-CO") + " $"  || "—"}{" "}
                            </span>
                          ) : (
                            <span className={`text-muted small`}>
                              {new Date(p.fechaAsignada )
                                            .toISOString()
                                            .slice(0, 16)
                                            .replace("T", " ")}
                            </span>
                          )}

                          {p.estado === 2 && (
                            <>
                              <span className="badge bg-danger">Retrasado</span>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal fijo sin animaciones */}
      <div
        className="modal fade"
        id="modalDetalle"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">📋 Detalles de la programación</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              {programacionSeleccionada ? (
                <>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Tipo:</strong>{" "}
                        {programacionSeleccionada.tipo === 1
                          ? "Despacho"
                          : "Recepción"}
                      </p>
                      <p>
                        <strong>Servicio:</strong>{" "}
                        {programacionSeleccionada?.servicio?.nombre || "—"}
                      </p>
                      <p>
                        <strong>Valor:</strong>{" "}
                        {programacionSeleccionada?.servicio?.valor?.toLocaleString("es-CO") + " $"  || "—"}
                      </p>
                      <p>
                        <strong>Contacto:</strong>{" "}
                        {programacionSeleccionada.contacto || "—"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Conductor:</strong>{" "}
                        {`${
                          programacionSeleccionada.conductor?.Nombre1 || ""
                        } ${
                          programacionSeleccionada.conductor?.Apellido1 || ""
                        } (${programacionSeleccionada.conductor?.phone || ""})`}
                      </p>
                      <p>
                        <strong>Confirmador:</strong>{" "}
                        {`${
                          programacionSeleccionada.confirmador?.user || "—"
                        } (${
                          programacionSeleccionada.confirmador?.documento || ""
                        })`}
                      </p>
                      <p>
                        <strong>Fecha asignada:</strong>{" "}
                        {new Date(
                          programacionSeleccionada.fechaAsignada
                           )
                                            .toISOString()
                                            .slice(0, 16)
                                            .replace("T", " ")
                      }
                      </p>
                      <p>
                        <strong>Observaciones:</strong>{" "}
                        {programacionSeleccionada.observaciones || "—"}
                      </p>
                    </div>
                  </div>

                  <hr />
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-bold">Subárea</label>
                      <select
                        className="form-select"
                        value={subareaSeleccionada || ""}
                        onChange={(e) =>
                          setSubareaSeleccionada(Number(e.target.value))
                        }
                      >
                        <option value="">Selecciona una subárea</option>
                        {subareas.map((s) => (
                          <option key={s.idSubarea} value={s.idSubarea}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4 mb-3 d-flex align-items-end">
                      <button
                        className="btn btn-success w-100"
                        onClick={añadirACola}
                      >
                        Añadir a cola
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p>No hay programación seleccionada</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColaProgramaciones;
