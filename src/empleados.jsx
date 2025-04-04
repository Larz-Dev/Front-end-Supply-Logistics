import React, { useState, useEffect } from "react";
import { Notificar, variables } from "./funciones"; // Importa las funciones necesarias

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]); // Almacenamos los empleados
  const [formData, setFormData] = useState({
    idEmpleado: "",
    nombre1: "",
    nombre2: "",
    apellido1: "",
    apellido2: "",
    documento: "",
    tipodocumento: "",
    fechaNacimiento: "",

    estado: 1, // Valor por defecto para el estado, activo
  });
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar los empleados según el término de búsqueda
  const filteredEmpleados = empleados.filter(
    (empleado) =>
      (empleado.nombre1?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (empleado.apellido1?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (empleado.nombre2?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (empleado.apellido2?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (empleado.documento?.toString() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (empleado.cargo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Obtener todos los empleados al cargar el componente
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch(variables("API") + "/empleado/listing", {
          method: "GET", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
        });
        const data = await response.json();
        setEmpleados(data);
      } catch (error) {
        console.error("Error al obtener los empleados:", error);
      }
    };

    fetchEmpleados();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Crear o editar empleado
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        response = await fetch(variables("API") + "/empleado/edit", {
          method: "PUT", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(variables("API") + "/empleado/create", {
          method: "POST", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      // Mostrar Swal con el mensaje de la API
     
    Notificar( data.mensaje +
      " / " +
      (data.status === "error"
        ? "Posible identificador repetido"
        : "Exito"),data.status,"normal")
       

      

      // Limpiar el formulario y volver a cargar los empleados
      setFormData({
        idEmpleado: "",
        nombre1: "",
        nombre2: "",
        apellido1: "",
        apellido2: "",
        documento: "",
        tipodocumento: "",

        fechaNacimiento: "",
        estado: 1, // Reiniciar el estado a activo
      });
      setEditing(false);
      const newResponse = await fetch(variables("API") + "/empleado/listing", {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
      });
      const newData = await newResponse.json();
      setEmpleados(newData);
    } catch (error) {
      console.error("Error al guardar el empleado:", error);
    }
  };

  // Editar empleado
  const handleEdit = (empleado) => {
    setFormData(empleado);
    setEditing(true);
  };

  // Eliminar empleado
  const handleDelete = async (idEmpleado) => {
    try {
      const response = await fetch(variables("API") + "/empleado/delete", {
        method: "DELETE", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ idEmpleado }),
      });

      const data = await response.json();

      // Mostrar Swal con el mensaje de la API
      Notificar( data.mensaje ,data.status,"normal")
         

      const newResponse = await fetch(variables("API") + "/empleado/listing", {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
      });
      const newData = await newResponse.json();
      setEmpleados(newData);
    } catch (error) {
      console.error("Error al eliminar el empleado:", error);
    }
  };

  // Cambiar estado de empleado (activo/inactivo)
  const handleToggleEstado = async (idEmpleado, estado) => {
    try {
      const response = await fetch(variables("API") + "/empleado/estado", {
        method: "POST", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ idEmpleado, estado: estado === 1 ? 0 : 1 }), // Alterna el estado
      });

      const data = await response.json();

      // Mostrar Swal con el mensaje de la API
      Notificar( data.mensaje ,data.status,"normal")
         

      // Actualizar la lista de empleados
      const newResponse = await fetch(variables("API") + "/empleado/listing", {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
      });
      const newData = await newResponse.json();
      setEmpleados(newData);
    } catch (error) {
      console.error("Error al cambiar el estado del empleado:", error);
    }
  };

  return (
    <div className="col m-3">
      <h2>Gestión de Empleados</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Columna 1 */}
          <div className="col-md-6">
            <label className="form-label" htmlFor="nombre1">
              Primer nombre
            </label>
            <input
              className="form-control mb-2 p-3"
              type="text"
              name="nombre1"
              value={formData.nombre1}
              onChange={handleChange}
              placeholder="Primer Nombre (Obligatorio)"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="nombre2">
              Segundo nombre
            </label>
            <input
              className="form-control mb-2 p-3"
              type="text"
              name="nombre2"
              value={formData.nombre2}
              onChange={handleChange}
              placeholder="Segundo Nombre"
            />
          </div>
        </div>

        <div className="row">
          {/* Columna 2 */}
          <div className="col-md-6">
            <label className="form-label" htmlFor="apellido1">
              Primer apellido
            </label>
            <input
              className="form-control mb-2 p-3"
              type="text"
              name="apellido1"
              value={formData.apellido1}
              onChange={handleChange}
              placeholder="Primer Apellido (Obligatorio)"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="apellidos1">
              Segundo apellido
            </label>
            <input
              className="form-control mb-2 p-3"
              type="text"
              name="apellido2"
              value={formData.apellido2}
              onChange={handleChange}
              placeholder="Segundo Apellido "
            />
          </div>
        </div>

        <div className="row">
          {/* Columna 3 */}
          <div className="col-md-6">
            <label className="form-label" htmlFor="documento">
              Documento
            </label>
            <input
              className="form-control mb-2 p-3"
              type="number"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              placeholder="Número de Documento"
              required
            />
          </div>

          <div className="col-md-6"></div>
        </div>

        <div className="row"></div>

        <button
          className={"btn m-1 " + (editing ? "btn-success" : "btn-primary")}
          type="submit"
        >
          {editing ? "Actualizar" : "Crear"}
        </button>
      </form>

      <p></p>
     

      <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control mb-3"
        />
      <div style={{ maxHeight: "250px", overflowY: "auto", overflowX: "auto" }}>
   
     
        <table
          className="table table-responsive table-striped table-hover"
          cellSpacing="1"
          cellPadding="1"
          width="300"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Documento</th>
              <th>Estado</th>

              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpleados.map((empleado) => (
              <tr key={empleado.idEmpleado}>
                <td>{empleado.idEmpleado}</td>
                <td>
                  {empleado.nombre1} {empleado.nombre2}
                </td>
                <td>
                  {empleado.apellido1} {empleado.apellido2}
                </td>
                <td>{empleado.documento}</td>
                <td>
                  <button
                    className={`btn m-1 ${
                      empleado.estado === 1 ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() =>
                      handleToggleEstado(empleado.idEmpleado, empleado.estado)
                    }
                  >
                    {empleado.estado === 1 ? "Activo" : "Inactivo"}
                  </button>
                </td>

                <td>
                  <button
                    className="btn btn-warning m-1"
                    onClick={() => handleEdit(empleado)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger m-1"
                    onClick={() => handleDelete(empleado.idEmpleado)}
                  >
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

export default Empleados;
