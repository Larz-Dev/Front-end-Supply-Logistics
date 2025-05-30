import React, { useEffect, useState } from "react";
import { variables, Notificar } from "./funciones";

const Conductores = () => {
  const [conductores, setConductores] = useState([]);
  const [transportadoraList, setTransportadoraList] = useState([]);
  const [transportadoraDetails, setTransportadoraDetails] = useState(null);
  const [selectedTransportadora, setSelectedTransportadora] = useState(null);
  const [formData, setFormData] = useState({
    Nombre1: "",
    Apellido1: "",
    Nombre2: "",
    Apellido2: "",
    documento: "",
    email: "",
    phone: "",
    idTransportadora: "",
    password: "",
    estado: 1,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [idEliminar, setIdEliminar] = useState(null);


  const filteredConductores = conductores.filter((c) =>
    `${c.nombres} ${c.apellidos} ${c.documento} ${c.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );


  useEffect(() => {
    const botonEliminar = document.getElementById("confirmarEliminarBtn");
    if (botonEliminar) {
      botonEliminar.onclick = () => {
        if (idEliminar !== null) {
          handleDelete(idEliminar);
          // Cierra el modal manualmente
          const modalElement = bootstrap.Modal.getInstance(document.getElementById('confirmarEliminarModal'));
          modalElement?.hide();
        }
      };
    }
  }, [idEliminar]);
  


  useEffect(() => {
    fetchConductores();
    fetchTransportadoras();
  }, []);

  const fetchConductores = async () => {
    const res = await fetch(variables("API") + "/conductor/listing", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setConductores(data);
  };

  const fetchTransportadoras = async () => {
    const res = await fetch(variables("API") + "/transportadora/listing", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setTransportadoraList(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const img = e.target.files[0];
    setImage(img);
    setPreview(URL.createObjectURL(img));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      dataToSend.append(key, value)
    );

    if (editing && formData.idConductor) {
      dataToSend.append("idConductor", formData.idConductor);
    }

    if (image) dataToSend.append("photo", image);
    if (selectedTransportadora)
      dataToSend.set(
        "idTransportadora",
        selectedTransportadora.idTransportadora
      );

    const url = editing
      ? variables("API") + "/conductor/edit"
      : variables("API") + "/conductor/create";

    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: dataToSend,
    });

    const data = await res.json();
    Notificar(data.mensaje, data.status, "normal");

    setFormData({
      idConductor: "",
      Nombre1: "",
      Apellido1: "",
      Nombre2: "",
      Apellido2: "",
      documento: "",
      email: "",
      phone: "",
      idTransportadora: "",
      password: "",
      estado: 1,
    });
    setImage(null);
    setPreview(null);
    setEditing(false);
    setTransportadoraDetails(null);
    setSelectedTransportadora(null);

    fetchConductores();
  };

  const handleEdit = (conductor) => {
    const selected = transportadoraList.find(
      (t) => t.idTransportadora === conductor.idTransportadora
    );

    setTransportadoraDetails(selected || null);
    setSelectedTransportadora(selected || null);
    setFormData({
      ...conductor,
      idTransportadora:
        selected?.idTransportadora || conductor.idTransportadora,
    });

    setEditing(true);
  };

  const handleDelete = async (idConductor) => {
    const res = await fetch(variables("API") + "/conductor/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({ idConductor }),
    });
    const data = await res.json();
    Notificar(data.mensaje, data.status, "normal");
    fetchConductores();
  };

  const handleToggleEstado = async (idConductor, estado) => {
    const nuevoEstado = estado === 1 ? 0 : 1;
    const res = await fetch(variables("API") + "/conductor/estado", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({ idConductor, estado: nuevoEstado }),
    });
    const data = await res.json();
    Notificar(data.mensaje, data.status, "normal");
    fetchConductores();
  };

  return (
    <div className="container p-3">
      <h2>Gestión de Conductores</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          {[
            ["Nombre1", "Primer nombre", "Primer nombre (Obligatorio)"],
            ["Nombre2", "Segundo nombre", "Segundo nombre"],
            ["Apellido1", "Primer apellido", "Primer apellido (Obligatorio)"],
            ["Apellido2", "Segundo apellido", "Segundo apellido"],
            ["documento", "Documento", "Número de documento"],
            ["phone", "Teléfono", "Número de contacto"],
            ["email", "Correo", "Correo electrónico"],
            ["password", "Contraseña", "Contraseña"],
          ].map(([name, label, placeholder]) => (
            <div className="col-md-6" key={name}>
              <label>{label}</label>
              <input
                type={
                  name === "email"
                    ? "email"
                    : name === "password"
                    ? "password"
                    : "text"
                }
                className="form-control mb-2 p-3"
                name={name}
                placeholder=""
                value={formData[name]}
                onChange={handleChange}
                required={
                  name !== "password" &&
                  name !== "Nombre2" &&
                  name !== "Apellido2"
                }
              />
            </div>
          ))}

          <div className="col-md-6">
            <label>Transportadora</label>
            <input
              name="transportadora"
              type="text"
              className="form-control mb-2 p-3"
              placeholder="Nombre de la transportadora"
              value={
                transportadoraDetails?.nombre ||
                transportadoraList.find(
                  (t) => t.idTransportadora === formData.idTransportadora
                )?.nombre ||
                ""
              }
              list="transportadoraList"
              onChange={(e) => {
                const selected = transportadoraList.find(
                  (t) => t.nombre === e.target.value
                );
                setTransportadoraDetails(
                  selected || { nombre: e.target.value }
                );
                setSelectedTransportadora(selected || null);
                if (selected) {
                  setFormData({
                    ...formData,
                    idTransportadora: selected.idTransportadora,
                  });
                }
              }}
            />
            <datalist id="transportadoraList">
              {transportadoraList.map((t) => (
                <option key={t.idTransportadora} value={t.nombre}>
                  {t.siglas}
                </option>
              ))}
            </datalist>
          </div>

      {/*  <div className="col-md-6">
            <label>Foto de perfil</label>
            <input
              type="file"
              accept="image/*"
              className="form-control mb-2 p-3"
              onChange={handleImageChange}
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="img-fluid mt-2 rounded-circle"
                style={{ width: "100px", height: "100px" }}
              />
            )}
          </div> */}
        </div>

        <button className={`btn ${editing ? "btn-success" : "btn-primary"}`}>
          {editing ? "Actualizar" : "Crear"}
        </button>
      </form>

      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        className="form-control mt-3 mb-2"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Transportadora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConductores.map((c) => (
              <tr key={c.idConductor}>
                <td>{c.idConductor}</td>
                <td>
                  {c.nombres} {c.apellidos}
                </td>
                <td>{c.documento}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>
                  {c.transportadora?.nombre ||
                    String(c.transportadorasugerida || "") + " (por confirmar)"}
                </td>
                <td>
                  <button
                    className={`btn ${
                      c.estado === 1 ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() => handleToggleEstado(c.idConductor, c.estado)}
                  >
                    {c.estado === 1 ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-warning m-1"
                    onClick={() => handleEdit(c)}
                  >
                    Editar
                  </button>
                  <button
  className="btn btn-danger m-1"
  data-bs-toggle="modal"
  data-bs-target="#confirmarEliminarModal"
  onClick={() => setIdEliminar(c.idConductor)}
>
  Eliminar
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal fade" id="confirmarEliminarModal" tabIndex="-1" aria-labelledby="confirmarEliminarModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="confirmarEliminarModalLabel">Confirmar eliminación</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div className="modal-body">
        ¿Estás seguro que deseas eliminar este conductor?
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" className="btn btn-danger" id="confirmarEliminarBtn">Eliminar</button>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Conductores;
