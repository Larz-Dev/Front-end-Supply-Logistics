import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const CrearProgramacion = ({ onCreated }) => {
  const [vehiculosList, setVehiculosList] = useState([]);
  const [placa, setPlaca] = useState("");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [fechaEstimadaLlegada, setFechaEstimadaLlegada] = useState("");
  const [contacto, setContacto] = useState("");

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
        variables("API") + "/programacion/createbyconductor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            idVehiculo: vehiculo.idVehiculo,
            producto,
            cantidad,
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
        setProducto("");
        setCantidad("");
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
        className="fw-bold text-white btn btn-success col-md-2 mx-auto"
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
              <div className=" fs-4 p-3  m-3 bg-body rounded-2">Al enviar una solicitud, esta le será notificada al sistema para comprobar la disponibilidad de recuros para aternderlo adecuadamente.</div>
              <form onSubmit={handleSubmit}>
                <div className="row px-3 text-center">
                  <div className="col-md-6 p-2">
                    <label className="form-label text-white">Placa</label>
                    <input
                      list="vehiculos"
                      className="form-control p-3"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      required
                    />
                    <datalist id="vehiculos">
                      {vehiculosList.map((v) => (
                        <option key={v.idVehiculo} value={v.placa}>
                          {v.tipo}
                        </option>
                      ))}
                    </datalist>

                    <label className="form-label text-white">Producto</label>
                    <input
                      type="text"
                      className="form-control p-3"
                      value={producto}
                      onChange={(e) => setProducto(e.target.value)}
                      required
                    />

                    <label className="form-label text-white">Cantidad</label>
                    <input
                      type="number"
                      className="form-control p-3"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6 p-2">
                    <label className="form-label text-white">
                      Fecha Salida
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control p-3"
                      value={fechaSalida}
                      onChange={(e) => setFechaSalida(e.target.value)}
                      required
                    />

                    <label className="form-label text-white">
                      Fecha Estimada Llegada
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control p-3"
                      value={fechaEstimadaLlegada}
                      onChange={(e) => setFechaEstimadaLlegada(e.target.value)}
                      required
                    />

                    <label className="form-label text-white">Dirección</label>
                    <input
                      type="text"
                      className="form-control p-3"
                      value={contacto}
                      onChange={(e) => setContacto(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 mt-3">
                    <label className="form-label text-white">
                      Observaciones
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Crear programación
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

export default CrearProgramacion;
