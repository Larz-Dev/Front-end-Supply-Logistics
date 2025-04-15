// RegisterConductor.jsx
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

  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      body.append(key, val);
    });
    if (photo) body.append("photo", photo);

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
        setPhoto(null);
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
              <div className="col-md-6 mb-3">
                <label>Foto del conductor</label>
                <input type="file" name="photo" className="form-control" accept="image/*" onChange={handlePhotoChange} />
              </div>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-success">
                Registrar conductor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterConductor;
