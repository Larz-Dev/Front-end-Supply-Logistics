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
    ("https://back-end-supply-logistics-camiones-2c4m.onrender.com");
    //"http://10.177.1.211:3000"
    //"https://back-end-supply-logistics-camiones-2c4m.onrender.com"
  }
  return respuesta;
}

// Retorna el texto descriptivo del estado
export const getEstadoTexto = (estado) => {
  switch (estado) {
    case 0:
      return "Por confirmar";
    case 1:
      return "En curso";
    case 2:
      return "Retraso";
    case 3:
      return "Cancelado";
    case 4:
      return "Finalizado";
    case 5:
      return "Todos";
    case 6:
      return "Cancelado por conductor";
    case 7:
      return "Solicitud confirmada (Esperando asignación)";
    case 8:
      return "Area confirmada (Esperando turno)";
    default:
      return "";
  }
};

// Retorna la clase CSS de Bootstrap según el estado
export const getEstadoClase = (estado) => {
  switch (estado) {
    case 0:
      return "bg-info";
    case 1:
      return "bg-primary";
    case 2:
      return "bg-warning";
    case 3:
      return "bg-danger";
    case 6:
      return "bg-danger";
    case 4:
      return "bg-success";
    case 5:
      return "bg-dark";
    case 7:
      return "bg-primary";
    case 8:
      return "bg-supply";
    default:
      return "";
  }
};

export default { Cerrarsesion, Validarsesion };
