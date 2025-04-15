import React, { useState } from "react";
import logo2 from "./assets/images/logo2.png";
import Fondo from "./assets/images/fondo2.png";
import { variables, Notificar } from "./funciones";
import "./login.css";

const Login = () => {
  const [documento, setdocumento] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Primer intento: /usuario/login
      let response = await fetch(variables("API") + "/usuario/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documento, password }),
      });

      let data = await response.json();

      if (data.status === "success") {
        sessionStorage.setItem("user", data.user);
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("documentoo", data.documentoo);
        sessionStorage.setItem("rol", data.rol);
        sessionStorage.setItem("idUsuario", data.idUsuario);
        sessionStorage.setItem("token", data.token);
        window.location.href = "/app";
        return;
      }

      // Segundo intento: /conductor/login
      response = await fetch(variables("API") + "/conductor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documento, password }),
      });

      data = await response.json();

      if (data.status === "success") {
        sessionStorage.setItem(
          "user",
          data.conductor.Nombre1 + " " + data.conductor.Apellido1
        );
        sessionStorage.setItem("email", data.conductor.email);
        sessionStorage.setItem("rol", data.rol);
        sessionStorage.setItem("idUsuario", data.conductor.idConductor);
        sessionStorage.setItem("token", data.token);

        // Store additional name variables
        sessionStorage.setItem("Apellido1", data.conductor.Apellido1);
        sessionStorage.setItem("Apellido2", data.conductor.Apellido2);
        sessionStorage.setItem("Nombre1", data.conductor.Nombre1);
        sessionStorage.setItem("Nombre2", data.conductor.Nombre2);
        sessionStorage.setItem("phone", data.conductor.phone);
        // Store additional variables

        sessionStorage.setItem("documento", data.conductor.documento);
        sessionStorage.setItem("estado", data.conductor.estado);
        sessionStorage.setItem("idConductor", data.conductor.idConductor);
        sessionStorage.setItem(
          "idTransportadora",
          data.conductor.idTransportadora
        );

        window.location.href = "/appconductor";
        return;
      }

      // Si ninguno funciona, mostrar error
      Notificar(data.mensaje || "Credenciales incorrectas", "error", "normal");
    } catch (error) {
      Notificar(
        "No se ha podido establecer conexión con el servidor",
        "error",
        "normal"
      );
    }
  };

  // Fondo
  document.body.style.backgroundImage = `url(${Fondo})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";

  return (
    <div
      className="login-container vh-100= p-3"
      style={{ backgroundImage: `url(${Fondo})`, backgroundSize: "cover" }}
    >
      <div className="login-form-container">
        <div className="logo-container">
          <img src={logo2} alt="Logo" className="shadow logo" />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <br />
            <br />
            <br />
            <br />
            <h1>Ingresar</h1>
          </div>

          <div className="">
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
          <div className="button-container row">
            <button type="submit" className="btn hover-b mb-1">
              Ingresar
            </button>
            <span className="text-center">o</span>
            <a href="/register" className="btn hover-b ">
              Registrate como conductor
            </a>

            <div className=" border-bottom my-3"></div>
            <a href="/" className="btn btn-secondary mb-1">
              Regresar
            </a>
            <div className="text-center ">
              <a className="linkgris " href="https://github.com/Larz-Dev">
                Desarrollado por Larz-Dev{" "}
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
