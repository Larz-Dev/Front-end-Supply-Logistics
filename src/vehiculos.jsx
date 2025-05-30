import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Vehiculo = () => {
  const [vehiculos, setVehiculos] = useState([]);

  const [formData, setFormData] = useState({
    idVehiculo: "",
    placa: "",
    tipo: "",
    idConductor: "", // nuevo campo
  });
  const [conductorInputValue, setConductorInputValue] = useState("");

  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10); // Number of items per page
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [freeText, setFreeText] = useState("");
  const [conductoresList, setConductoresList] = useState([]);
  const [selectedConductor, setSelectedConductor] = useState(null);

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

  useEffect(() => {
    fetchConductores();
  }, []);

  const fetchConductores = async () => {
    try {
      const res = await fetch(variables("API") + "/conductor/listing", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setConductoresList(data);
    } catch (error) {
      Notificar("Error al cargar conductores", "error", "normal");
    }
  };

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

  // Fetch vehiculos whenever the page or index changes
  useEffect(() => {
    fetchVehiculos();
  }, [indexOfFirstPost, indexOfLastPost]);

  // Handle form change and select transportadora
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  // Edit and delete handlers
  const handleEdit = (vehiculo) => {
    const selected = conductoresList.find(
      (c) => c.idConductor === vehiculo.idConductor
    );

    setSelectedConductor(selected || null);
    setConductorInputValue(
      selected ? `${selected?.Nombre1} ${selected?.Nombre2}` : ""
    );

    setFormData({
      idVehiculo: vehiculo.idVehiculo,
      placa: vehiculo.placa,
      tipo: vehiculo.tipo,
      idConductor: vehiculo.conductor.idConductor, // Esto es correcto, deberías asegurarte de que se actualice correctamente
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

        <input
          name="conductor"
          type="text"
          className="form-control m-2 p-3"
          placeholder="Seleccione conductor"
          list="conductoresList"
          value={conductorInputValue}
          onChange={(e) => {
            const input = e.target.value;
            setConductorInputValue(input);

            // Buscar coincidencias parciales
            const selected = conductoresList.find((c) => {
              const fullName = `${c?.Nombre1 || "Sin conductor"} ${
                c?.Nombre2 || ""
              }`;
              return fullName.toLowerCase().includes(input.toLowerCase());
            });

            setSelectedConductor(selected || null);

            if (selected) {
              setFormData((prev) => ({
                ...prev,
                idConductor: selected.idConductor,
              }));
            }
          }}
          onBlur={() => {
            // Si al perder foco el valor no es válido, limpiamos idConductor
            const match = conductoresList.find((c) => {
              const fullName = `${c.Nombre1 || "Sin conductor"} ${
                c.Nombre2 || ""
              }`;
              return (
                fullName.toLowerCase() === conductorInputValue.toLowerCase()
              );
            });

            if (!match) {
              setFormData((prev) => ({
                ...prev,
                idConductor: "",
              }));
            }
          }}
        />

        <datalist id="conductoresList">
          {conductoresList.map((c) => (
            <option
              key={c.idConductor}
              value={`${c?.Nombre1 || "Sin conductor"} ${c?.Nombre2 || ""}`}
            >
              {c.documento}
            </option>
          ))}
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
              <th>Tipo</th>
              <th>Conductor</th>
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
                  {vehiculo?.conductor?.Nombre1 || "Sin conductor"}{" "}
                  {vehiculo?.conductor?.Nombre2 || ""}
                </td>
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
