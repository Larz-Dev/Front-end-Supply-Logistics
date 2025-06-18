import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";

const Recursos = () => {
  const [recursos, setRecursos] = useState({
    totalMontacargas: 0,
    totalAuxiliares: 0,
    montacargasActuales: 0,
    auxiliaresActuales: 0,
    montacargasEnUso: 0,
    auxiliaresEnUso: 0,
  });

  const [formData, setFormData] = useState({
    totalMontacargas: "",
    totalAuxiliares: "",
  });

  const fetchRecursos = async () => {
    try {
      const res = await fetch(variables("API") + "/programacion/recursos", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.status !== "error") {
        setRecursos(data.recurso);
        setFormData({
          totalMontacargas: data.recurso.totalMontacargas,
          totalAuxiliares: data.recurso.totalAuxiliares,
        });
      } else {
        Notificar("No se pudo obtener los recursos", "error", "normal");
      }
    } catch (err) {
      Notificar("Error al consultar recursos", "error", "normal");
    }
  };

  useEffect(() => {
    fetchRecursos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setFormData({ ...formData, [name]: numericValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        variables("API") + "/programacion/actualizarrecursos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      Notificar(data.mensaje, data.status, "normal");
      if (data.status === "success") fetchRecursos();
    } catch (err) {
      Notificar("Error al actualizar los recursos", "error", "normal");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Recursos</h2>

      <div className="row mt-4 ">
        <div className="col-md-6 ">
          <div className="card shadow-sm border-info mb-3">
            <div className="card-header bg-info text-white">
              <i className="fas fa-user me-2"></i> Auxiliares
            </div>
            <div className="card-body">
              <p><strong>Total:</strong> {recursos.totalAuxiliares}</p>
              <p><strong>Disponibles:</strong> {recursos.auxiliaresActuales}</p>
              <p><strong>En uso:</strong> {recursos.auxiliaresEnUso}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-primary mb-3">
            <div className="card-header bg-primary text-white">
              <i className="fas fa-truck me-2"></i> Montacargas
            </div>
            <div className="card-body">
              <p><strong>Total:</strong> {recursos.totalMontacargas}</p>
              <p><strong>Disponibles:</strong> {recursos.montacargasActuales}</p>
              <p><strong>En uso:</strong> {recursos.montacargasEnUso}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <h4>Actualizar Totales</h4>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">🦺 Total de Auxiliares</label>
            <input
              type="text"
              name="totalAuxiliares"
              value={formData.totalAuxiliares}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">🚜 Total de Montacargas</label>
            <input
              type="text"
              name="totalMontacargas"
              value={formData.totalMontacargas}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-success mt-2">
          Actualizar Totales
        </button>
      </form>
    </div>
  );
};

export default Recursos;
