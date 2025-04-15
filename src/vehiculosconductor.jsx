import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Vehiculo = () => {
  const [vehiculos, setVehiculos] = useState([]);

  const [formData, setFormData] = useState({
    idVehiculo: "",
    placa: "",
    tipo: "",
  });

  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      if (data) {
        setVehiculos(data);
      }
    } catch (error) {
      Notificar(
        "No se ha podido establecer conexión con el servidor",
        "error",
        "normal"
      );
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? variables("API") + "/vehiculo/editbyconductor"
        : variables("API") + "/vehiculo/createbyconductor";
      const method = editing ? "PUT" : "POST";

      const dataToSend = {
        ...formData,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      Notificar(data.mensaje, data.status, "normal");

      if (data.status === "success") {
        setFormData({
          idVehiculo: "",
          placa: "",
          tipo: "",
        });
        setEditing(false);
        fetchVehiculos();
      }
    } catch (error) {
      Notificar("Error al guardar el vehículo", "error", "normal");
    }
  };

  const handleEdit = (vehiculo) => {
    setFormData({
      idVehiculo: vehiculo.idVehiculo,
      placa: vehiculo.placa,
      tipo: vehiculo.tipo,
    });
    setEditing(true);
  };

  const handleDelete = async (idVehiculo) => {
    try {
      const response = await fetch(
        variables("API") + "/vehiculo/deletebyconductor",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ idVehiculo }),
        }
      );
      const data = await response.json();
      Notificar(data.mensaje, data.status, "normal");
      if (data.status === "success") fetchVehiculos();
    } catch (error) {
      Notificar("Error al eliminar el vehículo", "error", "normal");
    }
  };

  const filteredVehiculos = vehiculos.filter(
    (vehiculo) =>
      (vehiculo.placa?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (vehiculo.tipo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="col m-3">
      <h2>Gestión de Vehículos</h2>

      {/* FORM */}
      {vehiculos.length < 2 && (
        <form onSubmit={handleSubmit}>
          <input
            className="form-control m-2 p-3"
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            placeholder="Placa"
            required
          />
          <input
            list="tipo-options"
            className="form-control m-2 p-3"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            placeholder="Seleccione o ingrese el tipo"
            required
          />
          <datalist id="tipo-options">
            <option value="Mula" />
            <option value="Sencillo" />
            <option value="Turbo" />
            <option value="Turbo 350" />
            <option value="Turbo 600" />
          </datalist>

          <button
            className={`btn m-1 ${editing ? "btn-success" : "btn-primary"}`}
            type="submit"
          >
            {editing ? "Actualizar" : "Añadir"}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-3"
      />

      {/* VEHICULOS TABLE */}
      <div style={{ maxHeight: "250px", overflowY: "auto", overflowX: "auto" }}>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehiculos.map((vehiculo) => (
              <tr key={vehiculo.idVehiculo}>
                <td>{vehiculo.idVehiculo}</td>
                <td>{vehiculo.placa}</td>
                <td>{vehiculo.tipo}</td>
                <td>
                  {/* 
  <button
    className="btn btn-warning m-1"
    onClick={() => handleEdit(vehiculo)}
  >
    Editar
  </button>
*/}
                  <button
                    className="btn btn-danger m-1"
                    onClick={() => handleDelete(vehiculo.idVehiculo)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vehiculo;
