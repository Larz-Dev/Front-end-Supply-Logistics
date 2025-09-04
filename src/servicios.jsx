import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    idServicio: "",
    nombre: "",
    valor: "",
    areas: "",
  });
  const [editing, setEditing] = useState(false);
const grupoA = ["1", "2"];
const grupoB = ["3", "4"];

const haySeleccionGrupo = (grupo) =>
  formData.areas.split("").some((id) => grupo.includes(id));
  useEffect(() => {
    fetchServicios();
    fetchAreas();
  }, []);

  const fetchServicios = async () => {
    try {
      const res = await fetch(variables("API") + "/servicio/listing", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!data.servicios || data.servicios.length === 0) {
        Notificar("No se encontraron servicios registrados.", "error", "normal");
      }
      setServicios(data.servicios || []);
    } catch (err) {
      console.error("Error al obtener los servicios:", err);
      Notificar("Error al obtener los servicios.", "error", "normal");
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await fetch(variables("API") + "/programacion/areas", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!data.areas || data.areas.length === 0) {
        Notificar("No se encontraron áreas disponibles.", "error", "normal");
      }
      setAreas(data.areas || []);
    } catch (err) {
      console.error("Error al obtener las áreas:", err);
      Notificar("Error al obtener las áreas.", "error", "normal");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleAreaToggle = (id) => {
  const selectedId = id.toString();
  let currentIds = formData.areas.split("").filter(Boolean);

  if (currentIds.includes(selectedId)) {
    // Deseleccionar
    currentIds = currentIds.filter((i) => i !== selectedId);
  } else {
    // Seleccionar
    currentIds.push(selectedId);
  }

  setFormData((prev) => ({ ...prev, areas: currentIds.sort().join("") }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editing
      ? variables("API") + "/servicio/edit"
      : variables("API") + "/servicio/create";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      Notificar(data.mensaje, data.status, "normal");
      setFormData({ idServicio: "", nombre: "", valor: "", areas: "" });
      setEditing(false);
      fetchServicios();
    } catch (err) {
      console.error("Error al guardar el servicio:", err);
      Notificar("Error al guardar el servicio.", "error", "normal");
    }
  };

  const handleEdit = (servicio) => {
    setFormData({
      idServicio: servicio.idServicio,
      nombre: servicio.nombre,
      valor: servicio.valor,
      areas: servicio.areas || "",
    });
    setEditing(true);
  };

  const handleDelete = async (idServicio) => {
    try {
      const res = await fetch(variables("API") + "/servicio/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ idServicio }),
      });
      const data = await res.json();
      Notificar(data.mensaje, data.status, "normal");
      fetchServicios();
    } catch (err) {
      console.error("Error al eliminar el servicio:", err);
      Notificar("Error al eliminar el servicio.", "error", "normal");
    }
  };

  return (
    <div className="col m-3">
      <h2>Gestión de Servicios</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control m-2 p-3"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre del Servicio"
          required
        />
        <input
          className="form-control m-2 p-3"
          type="number"
          name="valor"
          value={formData.valor}
          onChange={handleChange}
          placeholder="Valor"
          required
        />
        <div className="m-2">
          <label><strong>Áreas:</strong></label>
          <div className="d-flex flex-wrap">
        {areas.map((area) => {
  const id = area.idArea.toString();
  const seleccionadoGrupoA = haySeleccionGrupo(grupoA);
  const seleccionadoGrupoB = haySeleccionGrupo(grupoB);

  const disabled =
    (grupoA.includes(id) && seleccionadoGrupoB) ||
    (grupoB.includes(id) && seleccionadoGrupoA);

  return (
    <div key={area.idArea} className="form-check me-3">
      <input
        className="form-check-input"
        type="checkbox"
        checked={formData.areas.includes(id)}
        disabled={disabled}
        onChange={() => handleAreaToggle(area.idArea)}
        id={`area-${area.idArea}`}
      />
      <label className="form-check-label" htmlFor={`area-${area.idArea}`}>
        {area.nombre}
      </label>
    </div>
  );
})}

          </div>
        </div>
        <button className={"btn m-1 " + (editing ? "btn-success" : "btn-primary")} type="submit">
          {editing ? "Actualizar" : "Crear"}
        </button>
      </form>

      <div className="mt-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Valor</th>
              <th>Áreas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.idServicio}>
                <td>{servicio.idServicio}</td>
                <td>{servicio.nombre}</td>
                <td>{servicio.valor}</td>
                <td>
                  {servicio.areas
                    ? servicio.areas
                        .split("")
                        .map((id) =>
                          areas.find((a) => a.idArea.toString() === id)?.nombre || `[Área ${id} no encontrada]`
                        )
                        .join(", ")
                    : <span className="text-muted">Sin áreas</span>}
                </td>
                <td>
                  <button className="btn btn-warning btn-sm m-1" onClick={() => handleEdit(servicio)}>
                    Editar
                  </button>
                  <button className="btn btn-danger btn-sm m-1" onClick={() => handleDelete(servicio.idServicio)}>
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

export default Servicios;
