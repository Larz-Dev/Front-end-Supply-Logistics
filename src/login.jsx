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
        sessionStorage.setItem("documento", data.documento);
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


        sessionStorage.setItem("documento", data.conductor.documento);
        sessionStorage.setItem("estado", data.conductor.estado);
        sessionStorage.setItem("idConductor", data.conductor.idConductor);
        sessionStorage.setItem(
          "idTransportadora",
          data.conductor.idTransportadora
        );
        sessionStorage.setItem(
          "transportadora",
          data.conductor.transportadora?.nombre ||
            data.conductor.transportadorasugerida + "(Por confirmar)"
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
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.height = "100vh";
  document.body.style.margin = "0";

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
              <br />
            <h1>Ingresar</h1>
          </div>

          <div className="input-group mb-3">
    <span className="input-group-text" id="documento-addon">
      <i className="fa-regular fa-id-card"></i>
    </span>
    <input
      type="number"
      className="form-control"
      placeholder="Documento"
      aria-label="Documento"
      aria-describedby="documento-addon"
      value={documento}
      onChange={(e) => setdocumento(e.target.value)}
      required
      min={0}
    />
  </div>

  <div className="input-group mb-3">
    <span className="input-group-text" id="password-addon">
      <i className="fa-solid fa-key"></i>
    </span>
    <input
      type="password"
      className="form-control"
      placeholder="Contraseña"
      aria-label="Contraseña"
      aria-describedby="password-addon"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    
  </div>
          <div className="button-container row">
            <button type="submit" className="btn hover-b mb-1">
              Ingresar
            </button>
     <p></p>
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
