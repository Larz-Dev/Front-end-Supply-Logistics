import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Vehiculo = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [transportadoras, setTransportadoras] = useState([]);
  const [formData, setFormData] = useState({
    idVehiculo: "",
    placa: "",
    transportadora: "",
    tipo: "",
  });
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10); // Number of items per page
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [freeText, setFreeText] = useState("");

  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  // Calculate the range of pages to display
  const maxButtons = 10;
  const halfMaxButtons = Math.floor(maxButtons / 2);
  let startPage = Math.max(1, currentPage - halfMaxButtons);
  let endPage = Math.min(totalPages, currentPage + halfMaxButtons);

  if (endPage - startPage < maxButtons - 1) {
    if (startPage === 1) {
      endPage = Math.min(maxButtons, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxButtons + 1);
    }
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  // Fetch paginated vehiculos
  const fetchVehiculos = async () => {
    try {
      const response = await fetch(
        variables("API") + "/vehiculo/listingbypagination",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            inicio: indexOfFirstPost,
            fin: indexOfLastPost,
          }),
        }
      );
      const data = await response.json();
      if (data.vehiculos) {
        setVehiculos(data.vehiculos);
        setTotalPosts(data.total); // Update total number of items
      }
    } catch (error) {
      Notificar(
        "No se ha podido establecer conexión con el servidor",
        "error",
        "normal"
      );
    }
  };

  const handleOptionChange = (e) => {
    const selectedType = e.target.value;
    setFormData({
      ...formData,
      tipo: selectedType, // Update the tipo in formData
    });
  };

  const handleFreeTextChange = (event) => {
    setFreeText(event.target.value);
  };

  // Fetch transportadoras on component mount
  useEffect(() => {
    const fetchTransportadoras = async () => {
      try {
        const response = await fetch(
          variables("API") + "/transportadora/listing",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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

  // Fetch vehiculos whenever the page or index changes
  useEffect(() => {
    fetchVehiculos();
  }, [indexOfFirstPost, indexOfLastPost]);

  // Handle form change and select transportadora
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleTransportadoraSelect = (event) => {
    const selectedTransportadoraName = event.target.value;
  
    // Find the selected transportadora by its name
    const selectedTransportadora = transportadoras.find(
      (t) => t.nombre === selectedTransportadoraName
    );
  
    if (selectedTransportadora) {
      // Update formData with the selected transportadora's id and name
      setFormData({
        ...formData,
        transportadora: selectedTransportadora.nombre, // Set the name of the transportadora
        idTransportadora: selectedTransportadora.idTransportadora, // Set the idTransportadora directly
      });
    } else {
      // If no transportadora is found, reset the transportadora fields
      setFormData({
        ...formData,
        transportadora: "", // Reset the name
        idTransportadora: null, // Reset the id
      });
    }
  };
  const goToJumpPage = () => {
    const newPage = currentPage + 30;
    if (newPage <= totalPages) {
      setCurrentPage(newPage);
    } else {
      setCurrentPage(totalPages); // Jump to the last page if it exceeds total pages
    }
  };
  const goToJumpBackPage = () => {
    const newPage = currentPage - 30;
    if (newPage >= 1) {
      setCurrentPage(newPage);
    } else {
      setCurrentPage(1); // Jump to the first page if it goes below 1
    }
  };

  // Submit handler for create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? variables("API") + "/vehiculo/edit"
        : variables("API") + "/vehiculo/create";
      const method = editing ? "PUT" : "POST";

      const dataToSend = {
        ...formData,
        idTransportadora:
          formData.idTransportadora === "" ? null : formData.idTransportadora, // Set to null if it's an empty string
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
          idTransportadora: "",
          tipo: "",
        });
        setEditing(false);
        fetchVehiculos();
      }
    } catch (error) {
      Notificar("Error al guardar el vehículo", "error", "normal");
    }
  };

  // Edit and delete handlers
  const handleEdit = (vehiculo) => {
    setFormData({
      idVehiculo: vehiculo.idVehiculo,
      placa: vehiculo.placa,
      transportadora: vehiculo.transportadora?.nombre || "", // Set the name of the transportadora
      idTransportadora: vehiculo.transportadora?.idTransportadora || "", // Set the idTransportadora
      tipo: vehiculo.tipo,
    });
    setEditing(true);
  };
  const handleDelete = async (idVehiculo) => {
    try {
      const response = await fetch(variables("API") + "/vehiculo/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ idVehiculo }),
      });
      const data = await response.json();
      Notificar(data.mensaje, data.status, "normal");
      if (data.status === "success") fetchVehiculos();
    } catch (error) {
      Notificar("Error al eliminar el vehículo", "error", "normal");
    }
  };

  // Filtrar los vehículos según el término de búsqueda
  const filteredVehiculos = vehiculos.filter(
    (vehiculo) =>
      (vehiculo.placa?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (vehiculo.transportadora?.nombre?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (vehiculo.tipo?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="col m-3">
      <h2>Gestión de Vehículos</h2>
      {/* Form */}
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
  list="transportadoras"
  className="form-control m-2 p-3"
  name="transportadora"
  onChange={handleTransportadoraSelect}
  value={formData.transportadora || ""} // Show the name of the selected transportadora
  placeholder="Seleccionar Transportadora"
/>
        <datalist id="transportadoras">
          {transportadoras.map((t) => (
            <option key={t.idTransportadora} value={t.nombre} />
          ))}
        </datalist>
        <input
          list="tipo-options"
          className="form-control m-2 p-3"
          name="tipo"
          value={formData.tipo} // Bind to tipo for custom input
          onChange={handleOptionChange} // Update tipo on change
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
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Placa</th>
              <th>Transportadora</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehiculos.map((vehiculo) => (
              <tr key={vehiculo.idVehiculo}>
                <td>{vehiculo.idVehiculo}</td>
                <td>{vehiculo.placa}</td>
                <td>{vehiculo.transportadora?.nombre || "Sin asignar"}</td>
                <td>{vehiculo.tipo}</td>
                <td>
                  <button
                    className="btn btn-warning m-1"
                    onClick={() => handleEdit(vehiculo)}
                  >
                    Editar
                  </button>
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

        {/* Pagination */}
      </div>

      <div className="   text-center  justify-content-center">
        <div className="col">
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
            <button
              key={startPage + i}
              onClick={() => goToPage(startPage + i)}
              className={
                (currentPage === startPage + i ? "active" : "") +
                " btn btn-outline-primary mx-1 my-2"
              }
            >
              {startPage + i}
            </button>
          ))}
        </div>

        <button
          onClick={goToJumpBackPage}
          disabled={currentPage - 30 < 1}
          className="btn btn-secondary mx-1"
        >
          -30
        </button>
        <button
          onClick={goToPreviousPage}
          className="btn btn-primary  mx-1"
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="btn btn-primary  mx-1"
        >
          Siguiente
        </button>

        {/* Jump 50 Pages Button */}
        <button
          onClick={goToJumpPage}
          disabled={currentPage + 30 > totalPages}
          className="btn btn-secondary mx-1"
        >
          30+
        </button>
      </div>

      <br />
    </div>
  );
};

export default Vehiculo;
