import Swal from "sweetalert2";
import loading from "./assets/images/spinner.gif";

export function Cerrarsesion() {
  sessionStorage.clear();
  location.reload();
}
export function Validarsesion() {
  if (sessionStorage.getItem("email") == null) {
    window.location.href = "/";
  }
}

export function Actualizar(estado) {
  console.log(estado);
  let reload;
  if (estado == true || estado == false) {
    reload = estado;
  }
  return reload;
}

export function Notificar(mensaje, icono, modo) {
  if (modo == "normal") {
    Swal.fire({
      position: "top-end",
      icon: icono,
      title: mensaje,
      showConfirmButton: false,
      timer: 1500,
    });
  }
}

export function Cargar(mostrar) {
  if (mostrar) {
    Swal.fire({
      title: "",
      html: `<img class="img-fluid" src="${loading}" alt="Cargando..." />`,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: "rgba(0,0,0,0.4)",
    });
  } else {
    Swal.close();
  }
}

export function variables(nombreVariable) {
  let respuesta = "";
  if (nombreVariable == "API") {
    respuesta = "https://back-end-supply-logistics-camiones-2c4m.onrender.com";
    //"https://back-end-supply-logistics-camiones-2c4m.onrender.com"
    //"http://localhost:3000"
    //"http://localhost:3000"
    "https://back-end-supply-logistics-camiones-2c4m.onrender.com"
 //"http://10.177.1.211:3000"
    //"https://back-end-supply-logistics-camiones-2c4m.onrender.com"

  }
  return respuesta;
}

export default { Cerrarsesion, Validarsesion };
