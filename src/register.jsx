import { useState } from "react";
import Swal from "sweetalert2";
import Fondo from "./assets/images/fondo2.png";
import { variables } from "./funciones";

const RegisterConductor = () => {
  document.body.style.backgroundImage = `url(${Fondo})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    documento: "",
    Nombre1: "",
    Nombre2: "",
    Apellido1: "",
    Apellido2: "",
    email: "",
    phone: "",
    password: "",
    transportadorasugerida: "",
  });

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData();

    for (const key in formData) {
      form.append(key, formData[key]);
    }

    if (image) form.append("photo", image);

    try {
      const res = await fetch(variables("API") + "/conductor/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: form,
      });

      const data = await res.json();

      Swal.fire({
        position: "top-end",
        icon: data.status === "success" ? "success" : "error",
        title: data.mensaje,
        showConfirmButton: false,
        timer: 1500,
      });

      if (data.status === "success") {
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "No se pudo conectar con el servidor",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <div className="overflow-hidden d-flex justify-content-center align-items-center">
      <div className="row d-flex justify-content-center">
        <div className="col-12 text-center p-5">
          <h1 className="text-white fw-bold fs-1">Registro de Conductores</h1>
        </div>

        <h1 className="text-white col-5 d-flex justify-content-center align-items-center">
          <div className="col">
            Registrate y gestione sus asignaciones fácilmente.
          </div>
        </h1>

        <div className="card mt-3 col-5">
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <h3 className="mb-3">Formulario de Registro</h3>

              <div className="row">
                <div className="col">
                  <div className="form-group mb-2">
                    <label>Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Nombre1"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-2">
                    <label>Documento</label>
                    <input
                      type="number"
                      className="form-control"
                      name="documento"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-2">
                    <label>Teléfono</label>
                    <input
                      type="number"
                      className="form-control"
                      name="phone"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      required
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col">
                  <div className="form-group mb-2">
                    <label>Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      name="Apellido1"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-2">
                    <label>Transportadora</label>
                    <input
                      type="text"
                      className="form-control"
                      name="transportadorasugerida"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label>Foto de perfil (opcional)</label>
                    <p> </p>
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />

                      {preview ? (
                        <img
                          src={preview}
                          className="rounded-circle"
                          style={{ width: "80px", height: "80px" }}
                          alt="preview"
                        />
                      ) : (
                        <div
                          className="rounded-circle"
                          style={{
                            backgroundColor: "#ccc",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <i
                            className="fas fa-camera"
                            style={{ fontSize: "20px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-end">
                <a href="/login" className="btn btn-secondary  me-2">
                  Regresar
                </a>
                <button type="submit" className="btn btn-primary">
                  Registrate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterConductor;
