import { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const CrearSolicitud = ({ onCreated }) => {
  const [vehiculosList, setVehiculosList] = useState([]);
  const [serviciosList, setServiciosList] = useState([]);
  const [placa, setPlaca] = useState("");
  const [nombreServicio, setNombreServicio] = useState("");

  const [fechaSalida, setFechaSalida] = useState("");
  const [fechaEstimadaLlegada, setFechaEstimadaLlegada] = useState("");
  const [contacto, setContacto] = useState("");
  const servicioSeleccionado = serviciosList.find(
    (s) => s.nombre === nombreServicio
  );
  const idServicio = servicioSeleccionado?.idServicio || "";

  const valorFormateado =
    (servicioSeleccionado?.valor?.toLocaleString("es-CO") || 0) + "$" || "";

  const [observaciones, setObservaciones] = useState("");

  const fetchVehiculos = async () => {
    try {
      const response = await fetch(
        variables("API") + "/vehiculo/listingbyconductor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      setVehiculosList(data);
    } catch (error) {
      Notificar("No se pudo cargar la lista de vehículos", "error", "normal");
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await fetch(variables("API") + "/servicio/listing", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      console.log(data);
      setServiciosList(data.servicios);
    } catch (error) {
      Notificar("No se pudo cargar la lista de servicios", "error", "normal");
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vehiculo = vehiculosList.find((v) => v.placa === placa);
    if (!vehiculo) {
      Notificar("Placa no válida", "error", "normal");
      return;
    }

    try {
      const response = await fetch(
        variables("API") + "/programacion/CrearSolicitud",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            idVehiculo: vehiculo.idVehiculo,
            idServicio,

            fechaSalida,
            fechaEstimadaLlegada,
            contacto,
            estado: 0,
            observaciones,
          }),
        }
      );

      const data = await response.json();
      Notificar(data.mensaje, data.status, "normal");

      if (data.status === "success") {
        // Limpiar campos
        setPlaca("");
        setNombreServicio("");

        setFechaSalida("");
        setFechaEstimadaLlegada("");
        setContacto("");

        setObservaciones("");
        if (onCreated) onCreated();
      }
    } catch (error) {
      Notificar("Error al crear la programación", "error", "normal");
    }
  };

  return (
    <>
      <button
        className="fw-bold text-white btn btn-success col-md-2  mx-1"
        data-bs-toggle="modal"
        data-bs-target="#modalProgramacion"
      >
        Generar solicitud
      </button>

      <div
        className="modal fade"
        id="modalProgramacion"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content bg-transparent border-0">
            <div className="rounded-3 fondo2 p-2 my-3 p-3">
              <h2 className="text-white">Enviar Solicitud</h2>
              <div className=" fs-5 p-1  m-3 bg-body rounded-2">
                Al enviar una solicitud, esta le será notificada al sistema para
                comprobar la disponibilidad de recuros para aternderlo
                adecuadamente.
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row px-3 text-center">
                  {/* Columna izquierda */}
                  <div className="col-md-6 p-2">
                    {/* Placa */}
                    <label className="form-label text-white fw-bold">
                      <i className="fa-solid fa-car me-2"></i> Placa
                    </label>
                    <div className="input-group mb-3">
                      <input
                        list="vehiculos"
                        className="form-control"
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value)}
                        required
                      />
                    </div>
                    <datalist id="vehiculos">
                      {vehiculosList.map((v) => (
                        <option key={v.idVehiculo} value={v.placa}>
                          {v.tipo}
                        </option>
                      ))}
                    </datalist>
                    {/* Producto */}
                    <label className="form-label text-white fw-bold">
                      <i className="fa-solid fa-box-open me-2"></i> Servicio
                    </label>
                    <div className="input-group mb-1">
                      <input
                        type="text"
                        list="servicios"
                        className="form-control"
                        value={nombreServicio}
                        onChange={(e) => setNombreServicio(e.target.value)}
                        required
                      />
                    </div>
                    <datalist id="servicios">
                      {serviciosList.map((v) => (
                        <option key={v.idServicio} value={v.nombre}>
                          {v.valor}
                        </option>
                      ))}
                    </datalist>
                    {valorFormateado && (
                      <div className="text-white fw-bold mt-4">
                        Valor del servicio:{" "}
                        <span className="fs-2"> {valorFormateado}</span>
                      </div>
                    )}
                  </div>

                  {/* Columna derecha */}
                  <div className="col-md-6 p-2">
                    {/* Fecha de salida */}
                    <label className="form-label text-white fw-bold">
                      <i className="fa-solid fa-calendar-day me-2"></i> Fecha
                      Salida
                    </label>
                    <div className="input-group mb-3">
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={fechaSalida}
                        onChange={(e) => setFechaSalida(e.target.value)}
                        required
                      />
                    </div>

                    {/* Fecha Estimada de Llegada */}
                    <label className="form-label text-white fw-bold">
                      <i className="fa-solid fa-calendar-check me-2"></i> Fecha
                      Estimada Llegada
                    </label>
                    <div className="input-group mb-3">
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={fechaEstimadaLlegada}
                        onChange={(e) =>
                          setFechaEstimadaLlegada(e.target.value)
                        }
                        required
                      />
                    </div>

                    {/* Dirección o contacto */}
                    <label className="form-label text-white fw-bold">
                      <i className="fa-solid fa-map-marker-alt me-2"></i>{" "}
                      Dirección de contacto
                    </label>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control"
                        value={contacto}
                        onChange={(e) => setContacto(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="col-12 mt-3">
                    <label className="form-label text-white fw-bold">
                      <i className="fa-regular fa-comment me-2"></i>{" "}
                      Observaciones
                    </label>
                    <div className="input-group mb-3">
                      <textarea
                        className="form-control"
                        rows={3}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-paper-plane me-2"></i> Crear
                    programación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CrearSolicitud;
