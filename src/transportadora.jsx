import React, { useState, useEffect } from "react";
import { variables,Notificar } from "./funciones";


const Transportadora = () => {
  const [transportadoras, setTransportadoras] = useState([]);
  const [formData, setFormData] = useState({
    idTransportadora: "",
    nombre: "",
    siglas: "",
    observaciones: "",
  });
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar las transportadoras según el término de búsqueda
  const filteredTransportadoras = transportadoras.filter(
    (transportadora) =>
      (transportadora.nombre?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (transportadora.siglas?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (transportadora.observaciones?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  // Obtener todas las transportadoras al cargar el componente
  useEffect(() => {
    const fetchTransportadoras = async () => {
      try {
        const response = await fetch(
          variables("API") + "/transportadora/listing",
          {
            method: "GET", // Specify the method if needed (GET is default)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
            },
          }
        );
        const data = await response.json();
        setTransportadoras(data);
      } catch (error) {
        console.error("Error al obtener las transportadoras:", error);
      }
    };

    fetchTransportadoras();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Crear o editar transportadora
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editing) {
        response = await fetch(variables("API") + "/transportadora/edit", {
          method: "PUT", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(variables("API") + "/transportadora/create", {
          method: "POST", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(formData),
        });
      }
      const data = await response.json();
      Notificar(data.mensaje,data.status,"normal")


      // Limpiar el formulario y volver a cargar las transportadoras
      setFormData({
        idTransportadora: "",
        nombre: "",
        siglas: "",
        observaciones: "",
      });
      setEditing(false);
      const responseTransportadoras = await fetch(
        variables("API") + "/transportadora/listing",
        {
          method: "GET", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
        }
      );
      const dataTransportadoras = await responseTransportadoras.json();
      setTransportadoras(dataTransportadoras);
    } catch (error) {
      console.error("Error al guardar la transportadora:", error);
    }
  };

  // Editar transportadora
  const handleEdit = (transportadora) => {
    setFormData(transportadora);
    setEditing(true);
  };

  // Eliminar transportadora
  const handleDelete = async (idTransportadora) => {
    try {
      const response = await fetch(
        variables("API") + "/transportadora/delete",

        {
          method: "DELETE", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({ idTransportadora }), // Enviar el ID de la transportadora a eliminar
        }
      );
      const data = await response.json();
      Notificar(data.mensaje,data.status,"normal")


      const responseTransportadoras = await fetch(
        variables("API") + "/transportadora/listing",
        {
          method: "GET", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
        }
      );
      const dataTransportadoras = await responseTransportadoras.json();
      setTransportadoras(dataTransportadoras);
    } catch (error) {
      console.error("Error al eliminar la transportadora:", error);
    }
  };

  return (
    <div className="col m-3">
      <h2>Gestión de Transportadoras</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control m-2 p-3"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
        <input
          className="form-control m-2 p-3"
          type="text"
          name="siglas"
          value={formData.siglas}
          onChange={handleChange}
          placeholder="Siglas"
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
              <th>Siglas</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransportadoras.map((transportadora) => (
              <tr key={transportadora.idTransportadora}>
                <td>{transportadora.idTransportadora}</td>
                <td>{transportadora.nombre}</td>
                <td>{transportadora.siglas}</td>
                <td>{transportadora.observaciones}</td>
                <td>
                  <button
                    className="btn btn-warning m-1"
                    onClick={() => handleEdit(transportadora)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger m-1"
                    onClick={() =>
                      handleDelete(transportadora.idTransportadora)
                    }
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

export default Transportadora;
