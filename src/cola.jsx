import React, { useEffect, useState } from "react";
import { variables, Notificar } from "./funciones";

const TurnosAsignados = () => {
  const [areas, setAreas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [programacionSeleccionada, setProgramacionSeleccionada] =
    useState(null);
  const [modalTipo, setModalTipo] = useState(""); // "cancelar" o "turnar"
  const [montacargas, setMontacargas] = useState(0);
  const [auxiliares, setAuxiliares] = useState(0);
  const [modalFinalizar, setModalFinalizar] = useState(null); // guarda la programación a finalizar
  const [comentarioFinal, setComentarioFinal] = useState(""); // comentario final opcional
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  useEffect(() => {
    fetchAreasConTurnos();
  }, []);

  const finalizarProgramacion = async () => {
    if (!modalFinalizar?.idProgramacion) {
      return Notificar("Programación no válida", "error", "normal");
    }

    try {
      const res = await fetch(variables("API") + "/programacion/finish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          idProgramacion: modalFinalizar.idProgramacion,
          fechaFinServicio: fechaFin,
          fechaInicioServicio: fechaInicio,
          estado: 4,
          observacionessistema: comentarioFinal.trim(),
        }),
      });
      setFechaFin("");
      setFechaInicio("");
      setComentarioFinal("");

      document.querySelector("#finishPostModal .btn-close")?.click();
      fetchAreasConTurnos(); // recargar datos
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        Notificar(data.mensaje || "Error al finalizar", "error", "normal");
      } else {
        Notificar("Programación finalizada", "success", "normal");
      }
    } catch (error) {
      Notificar(error.message, "error", "normal");
    }
  };

  const abrirModalFinalizar = (programacion) => {
    setModalFinalizar(programacion);
    setComentarioFinal(""); // limpiar comentario
  };

  const fetchAreasConTurnos = async () => {
    setLoading(true);
    try {
      const res = await fetch(variables("API") + "/programacion/Turnos", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.areas)
        throw new Error(data.mensaje || "Error al cargar datos");

      setAreas(data.areas);
      setResumen({
        recurso: data.recurso || {},
        totalAreas: data.totalAreas || 0,
      });
    } catch (error) {
      Notificar(error.message, "error", "normal");
    }
    setLoading(false);
  };

  const abrirModal = (programacion, tipo, idTurno) => {
    setProgramacionSeleccionada({ ...programacion, idTurno });
    setModalTipo(tipo);
    setMontacargas(0);
    setAuxiliares(0);
  };

  const ejecutarAccion = async () => {
    const { idTurno } = programacionSeleccionada || {};
    if (!idTurno) return Notificar("ID de turno inválido", "error", "normal");

    const endpoint =
      modalTipo === "cancelar"
        ? "/programacion/cancelCola"
        : "/programacion/turnar";

    const payload = {
      idTurno,
      ...(modalTipo === "turnar" && {
        montacargasAsignados: parseInt(montacargas),
        auxiliaresAsignados: parseInt(auxiliares),
      }),
    };

    try {
      const res = await fetch(variables("API") + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        Notificar(data.mensaje, "error", "normal");
      } else {
        Notificar(data.mensaje, "success", "normal");
      }

      document.querySelector("#modalAccion .btn-close")?.click();
      fetchAreasConTurnos();
    } catch (error) {
      Notificar(error.message, "error");
    }
  };

  const tipoTexto = (tipo) => {
    if (tipo == 0) return "Recepción";
    if (tipo == 1) return "Despacho";
    return "No definido";
  };

  const formatearFecha = (fechaISO) => {
    try {
      return new Date(fechaISO).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Turnos asignados por subárea</h2>

      {loading && <p className="fw-bold">Cargando datos...</p>}

      {resumen && (
        <div className="alert alert-info d-flex flex-wrap justify-content-between align-items-center mb-4 shadow-sm">
          <div>
            <strong>Áreas registradas:</strong> {resumen.totalAreas}
          </div>
          <div>
            <strong>Montacargas:</strong> {resumen.recurso.montacargasActuales}{" "}
            / {resumen.recurso.totalMontacargas}
            <i className="fas fa-truck text-primary ms-2"></i>
          </div>
          <div>
            <strong>Auxiliares:</strong> {resumen.recurso.auxiliaresActuales} /{" "}
            {resumen.recurso.totalAuxiliares}
            <i className="fas fa-user text-info ms-2"></i>
          </div>
        </div>
      )}

      <div className="row">
        {areas.map((area) => (
          <div key={area.idArea} className="col-md-4 m-0 px-1 mb-2">
            <div className="card shadow-sm h-100 border-dark">
              <div className="card-header bg-dark text-white">
                <h5 className="mb-0">{area.nombre}</h5>
                <small
                  className={
                    (area.tipo == 0 ? "bg-primary" : "bg-success") + " badge"
                  }
                >
                  Tipo: <b>{tipoTexto(area.tipo)}</b>
                </small>
              </div>
              <div className="mx-2 mt-2">
                {area.subareas.length > 0 ? (
                  area.subareas.map((sub) => (
                    <div key={sub.idSubarea}>
                      <h6 className="text-secondary">{sub.nombre}</h6>
                      {sub.turnosSubarea?.length > 0 ? (
                        [...sub.turnosSubarea]
                          .sort(
                            (a, b) =>
                              new Date(a.programacion?.fechaAsignada) -
                              new Date(b.programacion?.fechaAsignada)
                          )
                          .map((turno, index) => {
                            const prog = turno.programacion;
                            const tipoProg = prog?.tipo;
                            const collapseId = `collapseTurno-${
                              prog?.idProgramacion || index
                            }`;

                            return (
                              <div
                                key={index}
                                className="border rounded p-1 mb-2 bg-light"
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="text-dark">
                                    Turno:{" "}
                                    <small className="fw-bold fs-5">
                                      {turno.turno || "Por asignar "}
                                    </small>
                                    {" | "}
                                    <span className="small text-mute text-nowrap">
                                      Fecha asignada:{" "}
                                      {new Date(prog?.fechaAsignada)
                                        .toISOString()
                                        .slice(0, 16)
                                        .replace("T", " ")}
                                    </span>
                                    <div className="text-end">
                                      <span className=" mx-1">
                                        {turno.auxiliaresAsignados}
                                      </span>
                                      <i className="fas fa-user text-info "></i>
                                      <span className=" mx-1">
                                        {" "}
                                        {turno.montacargasAsignados}
                                      </span>
                                      <i className="fas fa-truck text-primary "></i>
                                    </div>
                                    <div className="d-flex justify-content-end mt-2">
                                      <button
                                        className="btn btn-sm btn-outline-primary "
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#${collapseId}`}
                                        aria-expanded="false"
                                        aria-controls={collapseId}
                                      >
                                        Más
                                      </button>
                                      {turno.turno != null && (
                                        <a
                                          className="btn text-white btn-sm bg-supply mx-1"
                                          data-bs-toggle="modal"
                                          data-bs-target="#finishPostModal"
                                          onClick={() =>
                                            abrirModalFinalizar(prog)
                                          }
                                        >
                                          Finalizar
                                        </a>
                                      )}
                                      {turno.turno == undefined && (
                                        <div>
                                          {" "}
                                          <button
                                            className="btn btn-sm btn-success mx-1"
                                            type="button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalAccion"
                                            onClick={() =>
                                              abrirModal(
                                                prog,
                                                "turnar",
                                                turno.idTurno
                                              )
                                            }
                                          >
                                            Turnar
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            type="button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#modalAccion"
                                            onClick={() =>
                                              abrirModal(
                                                prog,
                                                "cancelar",
                                                turno.idTurno
                                              )
                                            }
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="collapse mt-2" id={collapseId}>
                                  <div className="card card-body p-2">
                                    {tipoProg !== 1 && prog?.producto && (
                                      <div>
                                        <strong>Producto:</strong>{" "}
                                        {prog.producto}
                                      </div>
                                    )}
                                    {tipoProg !== 1 && prog?.cantidad && (
                                      <div>
                                        <strong>Cantidad:</strong>{" "}
                                        {prog.cantidad}
                                      </div>
                                    )}
                                    {prog?.fechaAsignada && (
                                      <div>
                                        <strong>Fecha asignada:</strong>{" "}
                                        <i className="fas fa-calendar-alt text-warning me-1"></i>
                                        {new Date(prog.fechaAsignada )
                                            .toISOString()
                                            .slice(0, 16)
                                            .replace("T", " ")}
                                      </div>
                                    )}
                                    {prog?.conductor && (
                                      <div>
                                        <strong>Conductor:</strong>{" "}
                                        <i className="fas fa-user text-secondary me-1"></i>
                                        {`${prog.conductor.Nombre1 || ""} ${
                                          prog.conductor.Apellido1 || ""
                                        } (${prog.conductor.phone})`}
                                      </div>
                                    )}
                                    {prog?.confirmador && (
                                      <div>
                                        <strong>Confirmador:</strong>{" "}
                                        <i className="fas fa-user-check text-success me-1"></i>
                                        {`${prog.confirmador.user} (${prog.confirmador.documento})`}
                                      </div>
                                    )}
                                    {prog?.observaciones && (
                                      <div>
                                        <strong>Observación:</strong>{" "}
                                        {prog.observaciones}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-muted">No hay turnos para hoy.</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted">Sin subáreas registradas.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}

      <div
        className="modal fade"
        id="finishPostModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">✅ Finalizar programación</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              {modalFinalizar ? (
                <>
                  <p>
                    ¿Estás seguro que deseas <b>finalizar</b> esta programación?
                  </p>
                  <ul className="list-group mb-3">
                    <li className="list-group-item">
                      <b>Conductor:</b> {modalFinalizar.conductor?.Nombre1}{" "}
                      {modalFinalizar.conductor?.Apellido1}
                    </li>
                    {modalTipo != 0 && (
                      <div>
                        <li className="list-group-item">
                          <b>Producto:</b> {modalFinalizar.producto || "N/A"}
                        </li>
                        <li className="list-group-item">
                          <b>Cantidad:</b> {modalFinalizar.cantidad || "N/A"}
                        </li>
                      </div>
                    )}
                    <li className="list-group-item">
                      <b>Fecha asignada:</b>{" "}
                      {formatearFecha(modalFinalizar.fechaAsignada)}
                    </li>
                    <li className="list-group-item">
                      <b>Tipo:</b>{" "}
                      <span
                        className={`badge ${
                          modalFinalizar.tipo === 0
                            ? "bg-primary"
                            : "bg-success"
                        }`}
                      >
                        {tipoTexto(modalFinalizar.tipo)}
                      </span>
                    </li>
                  </ul>

                  <div className="mb-3">
                    <label className="form-label">
                      📅 Fecha de inicio del servicio
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      📅 Fecha de fin del servicio
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      📝 Comentario final (opcional)
                    </label>
                    <textarea
                      className="form-control"
                      value={comentarioFinal}
                      onChange={(e) => setComentarioFinal(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <p>Cargando información de la programación...</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
              <button
                className="btn btn-success"
                onClick={finalizarProgramacion}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <div
        className="modal fade"
        id="modalAccion"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">
                {modalTipo === "cancelar"
                  ? "❌ Cancelar programación"
                  : "✅ Turnar programación"}
              </h5>
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
                  <p>
                    ¿Estás seguro que deseas <b>{modalTipo}</b> esta
                    programación?
                  </p>
                  <ul className="list-group mb-3">
                    {programacionSeleccionada.tipo === 0 && (
                      <>
                        <li className="list-group-item">
                          <b>Producto:</b>{" "}
                          {programacionSeleccionada.producto || "N/A"}
                        </li>
                        <li className="list-group-item">
                          <b>Cantidad:</b>{" "}
                          {programacionSeleccionada.cantidad || "N/A"}
                        </li>
                      </>
                    )}
                    <li className="list-group-item">
                      <b>Conductor:</b>{" "}
                      {programacionSeleccionada.conductor
                        ? `${programacionSeleccionada.conductor.Nombre1} ${programacionSeleccionada.conductor.Apellido1}`
                        : "N/A"}
                    </li>
                    <li className="list-group-item">
                      <b>Fecha:</b>{" "}
                      {new Date(programacionSeleccionada.fechaAsignada )
                                            .toISOString()
                                            .slice(0, 16)
                                            .replace("T", " ")}
                    </li>
                    <li className="list-group-item">
                      <b>Tipo:</b>{" "}
                      <span
                        className={`badge ${
                          programacionSeleccionada.tipo === 0
                            ? "bg-primary"
                            : "bg-success"
                        }`}
                      >
                        {programacionSeleccionada.tipo === 0
                          ? "Recepción"
                          : "Despacho"}
                      </span>
                    </li>
                    {programacionSeleccionada.observacion && (
                      <li className="list-group-item">
                        <b>Observación:</b>{" "}
                        {programacionSeleccionada.observacion}
                      </li>
                    )}
                    {programacionSeleccionada.observacionsistema && (
                      <li className="list-group-item">
                        <b>Observación del sistema:</b>{" "}
                        {programacionSeleccionada.observacionsistema}
                      </li>
                    )}
                  </ul>

                  {modalTipo === "turnar" && resumen?.recurso && (
                    <div className="border rounded p-3 shadow-sm bg-light">
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <strong>Montacargas disponibles:</strong>{" "}
                          {Math.max(
                            0,
                            resumen.recurso.montacargasActuales - montacargas
                          )}{" "}
                          / {resumen.recurso.totalMontacargas}
                          <i className="fas fa-truck text-primary ms-2"></i>
                        </div>
                        <div>
                          <strong>Auxiliares disponibles:</strong>{" "}
                          {Math.max(
                            0,
                            resumen.recurso.auxiliaresActuales - auxiliares
                          )}{" "}
                          / {resumen.recurso.totalAuxiliares}
                          <i className="fas fa-user text-info ms-2"></i>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Asignar montacargas
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max={resumen.recurso.montacargasActuales}
                          value={montacargas}
                          onChange={(e) =>
                            setMontacargas(Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Asignar auxiliares</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max={resumen.recurso.auxiliaresActuales}
                          value={auxiliares}
                          onChange={(e) =>
                            setAuxiliares(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>Cargando datos del turno...</p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
              <button
                className={`btn ${
                  modalTipo === "cancelar" ? "btn-danger" : "btn-success"
                }`}
                onClick={ejecutarAccion}
                disabled={
                  modalTipo === "turnar" &&
                  (montacargas < 0 ||
                    auxiliares < 0 ||
                    montacargas > resumen?.recurso?.montacargasActuales ||
                    auxiliares > resumen?.recurso?.auxiliaresActuales)
                }
              >
                {modalTipo === "cancelar" ? "Cancelar" : "Turnar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnosAsignados;
