import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const GenerarSolicitudDespacho = ({ onCreated }) => {
  const [vehiculosList, setVehiculosList] = useState([]);
  const [placa, setPlaca] = useState("");
  const [fechaEstimadaLlegada, setFechaEstimadaLlegada] = useState("");

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
        variables("API") + "/programacion/despachobyconductor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            idVehiculo: vehiculo.idVehiculo,
            fechaEstimadaLlegada,
            
          }),
        }
      );

      const data = await response.json();
      Notificar(data.mensaje, data.status, "normal");

      if (data.status === "success") {
        setPlaca("");
        setFechaEstimadaLlegada("");
        if (onCreated) onCreated();
      }
    } catch (error) {
      Notificar("Error al enviar la solicitud", "error", "normal");
    }
  };

  return (
    <>
      <button
        className="fw-bold text-white btn btn-success col-md-2 mx-1"
        data-bs-toggle="modal"
        data-bs-target="#modalSolicitudDespacho"
      >
        Generar solicitud de despacho
      </button>

      <div
        className="modal fade"
        id="modalSolicitudDespacho"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-transparent border-0">
            <div className="rounded-3 fondo2 p-3 my-3">
              <h2 className="text-white">Solicitud de despacho</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-white fw-bold">
                    Placa del vehículo
                  </label>
                  <input
                    list="vehiculos"
                    className="form-control"
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
                </div>

                <div className="mb-3">
                  <label className="form-label text-white fw-bold">
                    Fecha estimada de llegada
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={fechaEstimadaLlegada}
                    onChange={(e) => setFechaEstimadaLlegada(e.target.value)}
                    required
                  />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Enviar solicitud
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

export default GenerarSolicitudDespacho;
