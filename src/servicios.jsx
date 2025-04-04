import React, { useState, useEffect } from "react";
import { variables,Notificar } from "./funciones";


const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const [formData, setFormData] = useState({
    idServicio: "",
    nombre: "",
    precio: "",
    observaciones: "",
  });
  const [editing, setEditing] = useState(false);

  // Obtener todos los servicios al cargar el componente
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await fetch(variables("API") + "/servicio/listing",{

          method: 'GET', // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          }}); // Asegúrate de que esta ruta sea correcta
        const data = await response.json();
        setServicios(data);
      } catch (error) {
        console.error("Error al obtener los servicios:", error);
      }
    };

    fetchServicios();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Crear o editar servicio
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        response = await fetch(variables("API") + "/servicio/edit",{

          method: 'PUT', // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(variables("API") + "/servicio/create",{

          method: 'POST', // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      // Mostrar Swal con el mensaje de la API
      Notificar(data.mensaje,data.status,"normal")


      // Limpiar el formulario y volver a cargar los servicios
      setFormData({
        idServicio: "",
        nombre: "",
        precio: "",
        observaciones: "",
      });
      setEditing(false);
      const newResponse = await fetch(variables("API") + "/servicio/listing",{

        method: 'GET', // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        }});
      const newData = await newResponse.json();
      setServicios(newData);
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
    }
  };

  // Editar servicio
  const handleEdit = (servicio) => {
    setFormData(servicio);
    setEditing(true);
  };

  // Eliminar servicio
  const handleDelete = async (idServicio) => {
    try {
      const response = await fetch(variables("API") + "/servicio/delete",{

        method: 'DELETE', // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ idServicio }), // Enviar el ID del servicio a eliminar
      });

      const data = await response.json();

      // Mostrar Swal con el mensaje de la API
      Notificar(data.mensaje,data.status,"normal")


      const newResponse = await fetch(variables("API") + "/servicio/listing",{

        method: 'GET', // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        }});
      const newData = await newResponse.json();
      setServicios(newData);
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
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
          name="precio"
          value={formData.precio}
          onChange={handleChange}
          placeholder="Precio"
          required
        />
        <input
          className="form-control m-2 p-3"
          type="text"
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          placeholder="Observaciones"
        />
        <button className={"btn m-1 " + (editing ? 'btn-success' : 'btn-primary')} type="submit">
          {editing ? 'Actualizar' : 'Crear'}
        </button>
      </form>
      <p></p>
      <div style={{ maxHeight: "250px", overflowY: "auto",overflowX: "auto" }}>
  <table className="table table-responsive table-striped table-hover" cellSpacing="1" cellPadding="1" width="300">
     <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <tr key={servicio.idServicio}>
              <td>{servicio.idServicio}</td>
              <td>{servicio.nombre}</td>
              <td>{servicio.precio}</td>
              <td>{servicio.observaciones}</td>
              <td>
                <button className="btn btn-warning m-1" onClick={() => handleEdit(servicio)}>Editar</button>
                <button className="btn btn-danger m-1" onClick={() => handleDelete(servicio.idServicio)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <br />
    </div>
  );
};

export default Servicios;
