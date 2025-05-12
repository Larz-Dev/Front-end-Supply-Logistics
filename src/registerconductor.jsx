import React, { useState } from "react";
import { variables, Notificar } from "./funciones.jsx";

const RegisterConductor = () => {
  const [formData, setFormData] = useState({
    documento: "",
    Nombre1: "",
    Nombre2: "",
    Apellido1: "",
    Apellido2: "",
    email: "",
    phone: "",
    idTransportadora: "",
    password: "",
  });

  // const [photo, setPhoto] = useState(null); // Comentado: ya no se usará la foto

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /*
  // Comentado: ya no se usa la carga de foto
  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      body.append(key, val);
    });

    // if (photo) body.append("photo", photo); // Comentado: no se sube la foto

    try {
      const res = await fetch(variables("API") + "/conductor/crear", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body,
      });

      const data = await res.json();
      if (data.status === "success") {
        Notificar(data.mensaje, "success", "normal");
        setFormData({
          documento: "",
          Nombre1: "",
          Nombre2: "",
          Apellido1: "",
          Apellido2: "",
          email: "",
          phone: "",
          idTransportadora: "",
          password: "",
        });
        // setPhoto(null); // Comentado: no hay foto que limpiar

        const modal = new bootstrap.Modal(document.getElementById("registroExitosoModal"));
        modal.show();
      } else {
        Notificar(data.mensaje, "error", "normal");
      }
    } catch (err) {
      Notificar("Error de red al crear conductor", "error", "normal");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4>Registrar nuevo conductor</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Documento</label>
                <input type="number" name="documento" className="form-control" required value={formData.documento} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Teléfono</label>
                <input type="number" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Primer nombre</label>
                <input type="text" name="Nombre1" className="form-control" required value={formData.Nombre1} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Segundo nombre</label>
                <input type="text" name="Nombre2" className="form-control" value={formData.Nombre2} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Primer apellido</label>
                <input type="text" name="Apellido1" className="form-control" required value={formData.Apellido1} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Segundo apellido</label>
                <input type="text" name="Apellido2" className="form-control" value={formData.Apellido2} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Correo</label>
                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Contraseña</label>
                <input type="password" name="password" className="form-control" required value={formData.password} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label>Transportadora (ID)</label>
                <input type="number" name="idTransportadora" className="form-control" required value={formData.idTransportadora} onChange={handleChange} />
              </div>

              {/* Comentado: campo de foto ya no es necesario */}
              {/*
              <div className="col-md-6 mb-3">
                <label>Foto del conductor</label>
                <input type="file" name="photo" className="form-control" accept="image/*" onChange={handlePhotoChange} />
              </div>
              */}
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-success">
                Registrar conductor
              </button>
            </div>
              <a
                href="https://wa.me/573001112223?text=Hola,%20me%20acabo%20de%20registrar%20como%20conductor"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                
                Contactar por WhatsApp
                    <i className="fa-solid fa-whatsapp"></i>
              </a>
          </form>
        </div>
      </div>

      {/* Modal de confirmación */}
      <div className="modal fade" id="registroExitosoModal" tabIndex="-1" aria-labelledby="registroExitosoLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="registroExitosoLabel">Registro exitoso</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              El conductor fue registrado exitosamente. ¿Qué deseas hacer ahora?
            </div>
            <div className="modal-footer">
             
              <a
                href="https://wa.me/573001112223?text=Hola,%20me%20acabo%20de%20registrar%20como%20conductor"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                
                Contactar por WhatsApp
                    <i className="fa-solid fa-whatsapp"></i>
              </a>
              <a href="/login" className="btn btn-primary">Ir a Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterConductor;
