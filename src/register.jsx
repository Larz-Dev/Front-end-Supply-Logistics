import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Fondo from "./assets/images/fondo2.png";
import { variables } from "./funciones";
import logo from "./assets/images/Logo.png";

const RegisterConductor = () => {
  useEffect(() => {
    document.body.style.backgroundImage = `url(${Fondo})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.height = "100vh";
    document.body.style.margin = "0";
  }, []);

  const [formData, setFormData] = useState({
    documento: "",
    Nombre1: "",
    Nombre2: "",
    Apellido1: "",
    Apellido2: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    transportadorasugerida: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validación de número de documento y contraseñas
    if (formData.documento.length < 7) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El número de documento debe tener al menos 7 dígitos.",
      });
      return;
    }

    if (formData.password.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }

    try {
      const res = await fetch(variables("API") + "/conductor/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: form,
      });

      const data = await res.json();

      if (data.status === "success") {
        Swal.fire({
          title: "¡Registro exitoso!",
          text: "¡Bienvenido! ¿Cómo prefieres continuar?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Sitio Web",
          cancelButtonText: "Bot de WhatsApp",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#25D366",
          html: `   <div class="text-center" style="display: flex; justify-content: space-between; align-items: center;">
  <p class="mt-2 mb-0 p-2 justificar my-1 fw-bold" style="flex: 1;">Si deseas acceder a la plataforma con mayor visibilidad y comodidad, puedes hacerlo desde la página web.</p>
  <p class="mt-2 mb-0 p-2 justificar my-1 fw-bold" style="flex: 1;">Si prefieres un proceso más rápido y directo, puedes continuar a través de nuestro chatbot en WhatsApp.</p>
</div> `,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.open(
              "https://wa.me/573012500115?text=Hola%20deseo%20empezar%20a%20usar%20la%20aplicaci%C3%B3n,%20por%20qu%C3%A9%20deber%C3%ADa%20comenzar?",
              "_blank"
            );
          }

          // Limpiar los campos después de la acción de la alerta
          setFormData({
            documento: "",
            Nombre1: "",
            Nombre2: "",
            Apellido1: "",
            Apellido2: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            transportadorasugerida: "",
          });
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: data.mensaje,
          showConfirmButton: false,
          timer: 1500,
        });
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
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div
          className="col-md-6 d-flex flex-column align-items-center text-white order-1 order-md-0 bg-body"
          style={{ minHeight: "100vh" }}
        >
          <div className="mt-auto mb-auto text-center px-4">
            <img
              src={logo}
              alt="Logo"
              className="mb-1 bg- border-2 border p-2 rounded"
              style={{ width: "200px" }}
            />
            <h1 className="fw-bold text-dark">We Supply APP</h1>
            <div className="border-bottom"></div>
            <p className="fs-2 fw-bold text-dark">
              Regístrate y gestiona tus viajes y programaciones de forma
              sencilla.
            </p>
          </div>
        </div>

        <div className="col-md-6 d-flex justify-content-center align-items-center order-0 order-md-1">
          <div
            className="bg-white p-3 rounded shadow-lg w-100 mx-3 my-5"
            style={{ maxWidth: "500px" }}
          >
            <h3 className="mb-2 text-center">Formulario de Registro</h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-1">
                <label className="form-label fw-bold">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="Nombre1"
                  value={formData.Nombre1}
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  name="Apellido1"
                  value={formData.Apellido1}
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Documento</label>
                <input
                  type="number"
                  className="form-control"
                  name="documento"
                  value={formData.documento}
                  required
                  onChange={handleChange}
                  minLength="5"
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Teléfono</label>
                <input
                  type="number"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  required
                  onChange={handleChange}
                  minLength="8"
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="mb-1">
                <label className="form-label fw-bold">Transportadora</label>
                <input
                  type="text"
                  className="form-control"
                  name="transportadorasugerida"
                  value={formData.transportadorasugerida}
                  onChange={handleChange}
                />
              </div><p></p>
              <div className="d-flex justify-content-between gap-2 mb-3">
                <a href="/login" className="btn btn-secondary w-50">
                  Regresar
                </a>
                <button type="submit" className="btn btn-primary w-50">
                  Registrarse
                </button>
              </div>
              <div className="d-grid">
                <a
                  href="https://wa.me/573012500115?text=Hola%20deseo%20empezar%20a%20usar%20la%20aplicaci%C3%B3n,%20por%20qu%C3%A9%20deber%C3%ADa%20comenzar?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  <i className="fab fa-whatsapp me-2"></i> Contactar por
                  WhatsApp
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterConductor;
