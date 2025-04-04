import React, { useState } from "react";

import logo2 from "./assets/images/logo2.png";
import Fondo from "./assets/images/fondo2.png";

import { variables,Notificar } from "./funciones";

import "./login.css";

const Login = () => {
  const [documento, setdocumento] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(variables("API") + "/usuario/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documento: documento, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        sessionStorage.setItem("user", data.user);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("documentoo", data.documentoo);
        sessionStorage.setItem("rol", data.rol);
        sessionStorage.setItem("idUsuario", data.idUsuario);
        sessionStorage.setItem("token", data.token);

        window.location.href = "/app";
      } else {
    
        Notificar(data.mensaje,"error","normal")

      }
    } catch (error) {
     
      Notificar("No se ha podido establecer conexión con el servidor","error","normal")

    }
  };
  document.body.style.backgroundImage = `url(${Fondo})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";

  return (
    <div
      className="login-container vh-100 p-3"
      style={{ backgroundImage: `url(${Fondo})`, backgroundSize: "cover" }}
    >
      <div className="login-form-container ">
        <div className="logo-container ">
          <img src={logo2} alt="Logo " className="shadow logo" />
        </div>
        <form onSubmit={handleSubmit} className=" ">
          <div className="mb-3">
            <br />
            <br />
            <br />
            <br />
            <h1>Ingresar</h1>
          </div>

          <div className="mb-3">
            <label htmlFor="documento" className="form-label">
              Documento
            </label>
            <input
              type="number"
              className="form-control"
              min={0}
              id="documento"
              value={documento}
              onChange={(e) => setdocumento(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-container">
            <a href="/" className="btn btn-secondary">
              Regresar
            </a>
            <button type="submit" className="btn hover-b">
              Ingresar
            </button>
          </div>
        </form>
        <div className="text-center">
          <a className="linkgris " href="https://github.com/Larz-Dev">Desarrollado por Larz-Dev <i className="fa-brands fa-github"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
