import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [formData, setFormData] = useState({
    idUsuario: "",
    email: "",
    documento: "",
    rol: "",
    user: "",
    password: "",
    estado: 1,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar los usuarios según el término de búsqueda
  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      (usuario.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (usuario.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (usuario.documento?.toString() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (usuario.rol === 1
        ? "Administrador"
        : usuario.rol === 2
        ? "Auxiliar"
        : "Otro"
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch(variables("API") + "/usuario/listing", {
          method: "GET", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
        });
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };
    fetchUsuarios();
  }, []);

  const handleProfileFetch = (idUsuario, refresh = false) => {
    if (!userProfiles[idUsuario] || refresh) {
      fetch(variables("API") + `/usuario/profile`, {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ idUsuario }),
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setUserProfiles((prevProfiles) => ({
            ...prevProfiles,
            [idUsuario]: url,
          }));
          setPreview(url);
        })
        .catch((error) => console.error("Error al cargar la imagen:", error));
    } else {
      setPreview(userProfiles[idUsuario]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
    setPreview(URL.createObjectURL(selectedImage));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append("email", formData.email);
    dataToSend.append("user", formData.user);
    dataToSend.append("documento", formData.documento);
    dataToSend.append("password", formData.password || "");
    dataToSend.append("estado", formData.estado);
    dataToSend.append("rol", formData.rol);

    if (image) {
      dataToSend.append("photo", image);
    }

    try {
      let response;
      if (editing) {
        dataToSend.append("idUsuario", formData.idUsuario);
        response = await fetch(variables("API") + "/usuario/edit", {
          method: "PUT", // Specify the method if needed (GET is default)
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: dataToSend,
        });
      } else {
        response = await fetch(variables("API") + "/usuario/create", {
          method: "POST", // Specify the method if needed (GET is default)
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: dataToSend,
        });
      }

      const data = await response.json();
      Notificar(data.mensaje, data.status, "normal");

      setFormData({
        idUsuario: "",
        email: "",
        documento: "",
        user: "",
        password: "",
        estado: 1,
      });
      setImage(null);
      setPreview(null);
      setEditing(false);
      document.getElementById("imageInput").value = null;
      document.getElementById("imgPreview").src = null;

      const newResponse = await fetch(variables("API") + "/usuario/listing", {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
      });
      const newData = await newResponse.json();
      setUsuarios(newData);

      if (editing && image) {
        // Forzar actualización de imagen en userProfiles
        handleProfileFetch(formData.idUsuario, true);
      }
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
    }
  };

  const handleEdit = (usuario) => {
    setFormData(usuario);
    setEditing(true);
    handleProfileFetch(usuario.idUsuario); // Cargar o usar imagen de perfil al editar
  };

  const handleToggleEstado = async (idUsuario, estado) => {
    try {
      const nuevoEstado = estado === 1 ? 0 : 1;

      const response = await fetch(variables("API") + "/usuario/estado", {
        method: "POST", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },

        body: JSON.stringify({ idUsuario, estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.status === "success") {
        Notificar(data.mensaje, "success", "normal");

        setUsuarios((prevUsuarios) =>
          prevUsuarios.map((usuario) =>
            usuario.idUsuario === idUsuario
              ? { ...usuario, estado: nuevoEstado }
              : usuario
          )
        );
      } else {
        Notificar(data.mensaje, "error", "normal");
      }
    } catch (error) {
      Notificar(
        "Error al cambiar el estado del usuario, intente más tarde",
        "error",
        "normal"
      );
    }
  };

  const handleDelete = async (idUsuario) => {
    try {
      const response = await fetch(variables("API") + "/usuario/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idUsuario: idUsuario }),
      });
      const data = await response.json();

      Notificar(data.mensaje, data.status, "normal");

      const newResponse = await fetch(variables("API") + "/usuario/listing", {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
      });
      const newData = await newResponse.json();
      setUsuarios(newData);
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  return (
    <div className="col m-3">
      <h2>Gestión de Usuarios</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <label className="form-label" htmlFor="user">
              Usuario
            </label>
            <input
              className="form-control mb-2 p-3"
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="Usuario"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="email">
              Correo
            </label>
            <input
              className="form-control mb-2 p-3"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo Electrónico"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="documento">
              Numero de Documento
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

          <div className="col-md-6">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              className="form-control mb-2 p-3"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
            />
          </div>
          <label className="form-label" htmlFor="rol">
            Rol
          </label>
          <div className="col-md-6">
            <select
              className="form-control mb-2 p-3"
              type="number"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              placeholder="Rol"
              required
            >
              <option value="">Seleccione un rol</option>
              <option value="1">Administrador</option>
              <option value="2">Auxiliar</option>
            </select>
          </div>
        </div>
        <label className="form-label" htmlFor="photo">
          Imagen de perfil
        </label>
        <input
          name="photo"
          type="file"
          id="imageInput"
          className="form-control mb-2 p-3"
          accept="image/*"
          onChange={handleImageChange}
        />
        {preview && (
          <img
            src={preview}
            id="imgPreview"
            alt="Previsualización"
            className="img-fluid mt-2 rounded-circle"
            style={{ width: "100px", height: "100px" }}
          />
        )}

        <button
          className={"btn m-1 " + (editing ? "btn-success" : "btn-primary")}
          type="submit"
        >
          {editing ? "Actualizar" : "Crear"}
        </button>
        <p></p>
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
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Usuario</th>
              <th>Documento</th>
              <th>Estado</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.idUsuario}>
                <td>{usuario.idUsuario}</td>
                <td>{usuario.email}</td>
                <td>{usuario.user}</td>
                <td>{usuario.documento}</td>
                <td>
                  <button
                    className={`btn m-1 ${
                      usuario.estado === 1 ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() =>
                      handleToggleEstado(usuario.idUsuario, usuario.estado)
                    }
                  >
                    {usuario.estado === 1 ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td>
                  <td>
                    {" "}
                    {usuario.rol === 1
                      ? "Administrador"
                      : usuario.rol === 2
                      ? "Auxiliar"
                      : "Otro"}
                  </td>
                </td>
                <td>
                  <button
                    className="btn btn-warning m-1"
                    onClick={() => handleEdit(usuario)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger m-1"
                    onClick={() => handleDelete(usuario.idUsuario)}
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

export default Usuarios;
