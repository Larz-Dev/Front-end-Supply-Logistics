

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cabecera from "./cabecera.jsx";
import Publicar from "./publicar.jsx";
import {
  Validarsesion,
  Actualizar,
  variables,
  Notificar,
} from "./funciones.jsx";

import loadingPost from "./assets/images/PostLoading.gif";
import loadingProfile from "./assets/images/ProfileLoading.gif";

import ImageMaximizer from "./maximizer.jsx";
import Sidebar from "./sidebar.jsx";
import * as XLSX from "xlsx";
import EditarRecibo from "./Editar.jsx";
function App() {
  Validarsesion();
  document.body.style = "background: #dee2e6;";

  const [posts, setPosts] = useState([]);
  const [images, setImages] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [idUsuario, setIdusuario] = useState("");
  const [idRecibo, setIdRecibo] = useState("");
  const [idReciboToEdit, setIdReciboToEdit] = useState("");
  const [rangoInicio, setRangoInicio] = useState("");
  const [rangoFin, setRangoFin] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [postsPerPage] = useState(10); // Número de publicaciones por página
  const [totalPosts, setTotalPosts] = useState(0); // Total de publicaciones

  const openEditModal = (idRecibo) => {
    setIdReciboToEdit(idRecibo);
    sessionStorage.setItem("idRecibo", idRecibo);
  };

  const closeEditModal = () => {
    setIdReciboToEdit("");
  };
  async function exportar(modo) {
    if (modo === "filtro") {
      exportToExcel();
    }
    if (modo === "todo") {
      // Wait for cargarTodos() to complete before calling exportToExcel
      const success = await cargarTodos();
    }
  }

  async function exportToExcel() {
    const data = filteredPosts.map((post) => {
      // Create an array of empleados information
      const empleados =
        post.empleados && post.empleados.length > 0
          ? post.empleados.map(
              (empleado) =>
                `${empleado.nombre1} ${empleado.nombre2 || ""} ${
                  empleado.apellido1
                } ${empleado.apellido2 || ""} - ${empleado.documento}`
            )
          : ["No hay empleados asignados."];
      const stringEmpleados = empleados.join(", ");

      return {
        Fecha: new Date(post.fecha).toLocaleDateString("en-US", {
          timeZone: "UTC",
        }),
        "Hora Inicial": post.horaInicio,
        "Hora Final": post.horaFin,
        Tiempo: PostComponent(post), // Save as a fraction of a day for duration format
        Placa: post.vehiculo.placa,
        Transportadora: post.vehiculo.transportadora.siglas,
        "Tipo de Vehiculo": post.vehiculo.tipo,
        "Tipo de Carga": post.tipocarga,
        Cantidad: post.cantidad,
        Area: post.area,
        Consecutivo: post.consecutivo,
        Encargados: stringEmpleados,
        Observaciones: post.observaciones,
      };
    });

    // Create the Excel sheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Apply duration format to the `Tiempo` column
    const tiempoColumnIndex = Object.keys(data[0]).indexOf("Tiempo");
    data.forEach((_, index) => {
      const cellAddress = XLSX.utils.encode_cell({
        r: index + 1,
        c: tiempoColumnIndex,
      });
      if (ws[cellAddress]) {
        ws[cellAddress].z = "[h]:mm"; // Sets the format to display as a duration in hours and minutes
      }
    });

    // Export workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    XLSX.writeFile(wb, `Recibos-${new Date().toLocaleDateString()} .xlsx`);
  }

  async function cargarTodos() {
    try {
      const response = await fetch(variables("API") + "/recibo/listing", {
        method: "GET", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
      });
      const data = await response.json();

      // Check if data is an array (i.e., posts were found)
      if (Array.isArray(data)) {
        setPosts(data);
        return true; // Indicate success
      } else {
        Notificar("No se han encontrado recibos", "error", "normal");
        return false;
      }
    } catch (error) {
      // Handle any errors that occur during fetch
      Notificar(
        "Error al obtener los datos, compruebe la conexión a internet",
        "error",
        "normal"
      );
      return false;
    }
  }

  useEffect(() => {
    cargarPosts(false);
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  useEffect(() => {
    if (indexOfFirstPost !== undefined && indexOfLastPost !== undefined) {
      fetch(variables("API") + "/recibo/listingbypagination", {
        method: "POST", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          inicio: indexOfFirstPost,
          fin: indexOfLastPost,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.recibos)) {
            setPosts(data.recibos);
            cargarPosts(true);
            setTotalPosts(data.total); // Usa el valor `total` de la respuesta
          }
        })
        .catch((error) => {
          Notificar(
            "No se ha podico establecer conexión con el servidor",
            "error",
            "normal"
          );
        });
    }
  }, [indexOfFirstPost, indexOfLastPost, currentPage]);

  // Total de páginas
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Funciones para cambiar de página
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  useEffect(() => {
    if (rangoInicio && rangoFin) {
      // Realizar la consulta solo cuando ambas fechas están seleccionadas
      fetch(variables("API") + "/recibo/listingbydate", {
        method: "POST", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          inicio: rangoInicio,
          fin: rangoFin,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          Notificar(
            data.mensaje || "Consulta realizada con éxito",
            "success",
            "normal"
          );

          // Llama a una función para actualizar los datos si es necesario
          if (Array.isArray(data)) {
            //Guardar el objeto de publicaciones si se han encontrado
            setPosts(data);
            cargarPosts(true);
          }
        })
        .catch((error) => {
          Notificar(
            "No se ha podido establecer conexión con el servidor",
            "error",
            "normal"
          );
        });
    }
  }, [rangoInicio, rangoFin]); // Ejecuta cuando rangoInicio o rangoFin cambien

  useEffect(() => {
    if (posts.length > 0) {
      CargarImagenes();
    }
  }, [posts]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    cargarPosts(false);
  };

  function cargarPosts(date) {
    if (date == false) {
      fetch(variables("API") + "/recibo/listingbypagination", {
        method: "POST", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          inicio: indexOfFirstPost,
          fin: indexOfLastPost,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          //Condicional para comprobar si se han encontrado publicaciones
          if (Array.isArray(data.recibos)) {
            //Guardar el objeto de publicaciones si se han encontrado
            setPosts(data.recibos);
          } else {
            Notificar(
              data.mensaje || "No se han podido cargar los recibos",
              data.status || "error",
              "normal"
            );
          }
        })
        .catch((error) => {
          //Si no ha recibido respuestas mostrar un error
          Notificar(error.messaje || "Error inesperado", "error", "normal");
        });
    }
    //Consltar las publicaciones de la API
  }
  async function cargarTodos() {
    await fetch(variables("API") + "/recibo/listing", {
      method: "GET", // Specify the method if needed (GET is default)
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
      },
    })
      .then((response) => response.json())
      .then((data) => {
        //Condicional para comprobar si se han encontrado publicaciones
        if (Array.isArray(data)) {
          //Guardar el objeto de publicaciones si se han encontrado
          setPosts(data);
        } else {
          Notificar(
            data.mensaje || "Error al cargar los datos",
            "error",
            "normal"
          );
        }
      })
      .catch((error) => {
        //Si no ha recibido respuestas mostrar un error

        Notificar(error.message, "error", "normal");
      });
    return true;
    //Consltar las publicaciones de la API
  }

  function CargarImagenes() {
    posts.forEach((post) => {
      // Consultar las imágenes de cada publicación en base al objeto de publicaciones utilizando el ID de la publicación
      fetch(variables("API") + `/recibo/image/`, {
        method: "POST", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        // Enviar la información que requiere la ruta en JSON
        body: JSON.stringify({
          idRecibo: post.idRecibo,
        }),
      })
        .then((response) => {
          // Verificar si la respuesta es exitosa
          if (!response.ok) {
            return null; // Retornar null si no se encuentra la imagen
          }
          return response.blob();
        })
        // Recibir la respuesta como tipo blob si es que existe
        .then((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            // Crear un objeto que almacena las imágenes dependiendo de su id de publicación
            setImages((images) => ({ ...images, [post.idRecibo]: url }));
          } else {
            // Si blob es null, asignar null como valor
            setImages((images) => ({ ...images, [post.idRecibo]: null }));
          }
        })
        // Capturar y mostrar errores
        .catch((error) => Notificar(error.message, "error", "normal"));

      if (!userProfiles[post.idUsuario]) {
        fetch(variables("API") + `/usuario/profile`, {
          method: "POST", // Specify the method if needed (GET is default)
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({
            idUsuario: post.idUsuario,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return null;
            }
            return response.blob();
          })
          .then((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setUserProfiles((userProfiles) => ({
                ...userProfiles,
                [post.idUsuario]: url,
              }));
            } else {
              setUserProfiles((userProfiles) => ({
                ...userProfiles,
                [post.idUsuario]: null,
              }));
            }
          })
          .catch((error) => console.error(error));
      }
      // Consultar los comentarios por el ID de la publicación
    });
  }

  const filteredPosts = posts.filter((post) => {
    return (
      // Búsqueda por Fecha
      (post.fecha
        ? new Date(post.fecha).toLocaleDateString("en-US", { timeZone: "UTC" })
        : ""
      )
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Hora Inicial
      (post.horaInicio || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Hora Final
      (post.horaFin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Placa
      (post.vehiculo?.placa || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Transportadora
      (post.vehiculo?.transportadora?.siglas || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Tipo de Vehículo
      (post.vehiculo?.tipo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Tipo de Carga
      (post.tipocarga || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Cantidad
      (post.cantidad || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Área
      (post.area || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Búsqueda por Consecutivo
      (post.consecutivo ? post.consecutivo.toString() : "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const PostComponent = (post) => {
    // Function to calculate duration from horaInicio and horaFin
    const horaInicio = new Date(`1970-01-01T${post.horaInicio}Z`);
    let horaFin = new Date(`1970-01-01T${post.horaFin}Z`);

    // If horaFin is earlier than horaInicio, assume it's on the next day
    if (horaFin < horaInicio) {
      horaFin.setDate(horaFin.getDate() + 1); // Add one day to horaFin
    }

    // Calculate the time difference in minutes
    const totalMinutes = (horaFin - horaInicio) / (1000 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Format as a readable string
    return `${hours}:${minutes} `;
  };

  return (
    <>
      <div className="row">
        <Cabecera></Cabecera>

        <div className="col-md-3  d-flex flex-column p-3 bg-light">
          <Sidebar></Sidebar>
        </div>

        <div
          className="col-md-9 "
          style={{
            maxHeight: "1000px",
            height: "100vh",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <div className="  justify-content-md-center mt-3">
            {" "}
            <div className=" row  mx-4 py-1">
              <button
                className="btn  btn-success "
                onClick={() => {
                  exportar("filtro");
                }}
              >
                Exportar Excel
              </button>
            </div>
            <div className=" row  mx-4 py-1">
              <button
                className="btn  btn-warning "
                onClick={() => {
                  exportar("todo");
                }}
              >
                Cargar todos
              </button>
            </div>
            <div className=" d-flex align-items-center m-3 ">
              Entre
              <input
                type="date"
                placeholder="Inicio"
                className="inner-shadow rounded form-control mx-2 py-3"
                name="inicio"
                id="inicio"
                value={rangoInicio}
                onChange={(event) => setRangoInicio(event.target.value)}
              />
              y
              <input
                type="date"
                placeholder="Fin"
                className="inner-shadow rounded form-control mx-2 py-3"
                name="fin"
                id="fin"
                value={rangoFin}
                onChange={(event) => setRangoFin(event.target.value)}
              />
            </div>
            <div className=" d-flex align-items-center m-3">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Buscar por transportadora, placa, área, o concepto"
                className="inner-shadow rounded form-control mx-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <p></p>

          <div className="m-3">
            {filteredPosts.map((post, index) => (
              <div key={index} className="">
                <div className="px-1  rounded-3 bg-body pb-1 ">
                  <div className="row pt-2 text-decoration-none"></div>

                  <div className="row  px-3">
                    <div className="col-8 fs-4 text-start">
                      <img
                        src={userProfiles[post.idUsuario] || loadingProfile}
                        className="rounded-circle align-bottom"
                        width="50"
                        height="50"
                      />
                      <span className="mx-2 fs-4 ">
                        {post.usuario.user + " - "}
                        <span className="fs-6">
                          {new Date(post.fecha).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                          })}
                        </span>
                      </span>
                      / Factura - {post.consecutivo} -
                      {" " +
                        (post.vehiculo?.transportadora?.siglas ||
                          "Sin Transportadora")}
                    </div>

                    <div className="col text-end">
                      <div className=" ">
                        {(sessionStorage.getItem("idUsuario") ==
                          post.idUsuario ||
                          sessionStorage.getItem("rol") == 1) && (
                          <span>
                            <a
                              className="btn btn-danger fw-bold my-2"
                              data-bs-toggle="modal"
                              data-bs-target="#deletePostModal"
                              onClick={() => setIdRecibo(post.idRecibo)} // Aquí se usa setIdRecibo
                            >
                              <i className="fa-solid fa-trash"></i>
                            </a>

                            <button
                              className="btn btn-warning  mx-2 fw-bold my-2"
                              onClick={() => openEditModal(post.idRecibo)}
                            >
                              Editar
                            </button>
                          </span>
                        )}
                        <span>
                          <button
                            className="btn hover-b  fw-bold  my-2"
                            data-bs-toggle="collapse"
                            data-bs-target={"#collapseRecibo" + post.idRecibo}
                            role="button"
                          >
                            ▼
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="collapse "
                    id={"collapseRecibo" + post.idRecibo}
                  >
                    <div className=" fs-5 row p-3">
                      <div className="col-md-4">
                        <p>
                          <strong>Fecha:</strong>

                          {new Date(post.fecha).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                          })}
                        </p>
                        <p>
                          <strong>Placa:</strong> {post.vehiculo.placa}
                        </p>
                        <p>
                          <strong>Area:</strong> {post.area}
                        </p>
                        <p>
                          <strong>Tipo de vehiculo:</strong>{" "}
                          {post.vehiculo.tipo}
                        </p>
                        <p>
                          <strong>Tipo de carga:</strong> {post.tipocarga}
                          <br />
                          <span className="fs-6">
                            Cantidad: {post.cantidad}
                            {post.tipocarga === "Granel" && ` Pacas`}
                          </span>
                        </p>
                        <p>
                          <span className="fs-2">Valor: {post.valor}$</span>
                        </p>
                      </div>
                      <div className="col-md-4">
                        <p>
                          <strong>PNC: </strong>
                          {post.consecutivo}
                        </p>
                        {/*
                        <p>
                          <strong>Concepto:</strong> {post.servicio.nombre}
                        </p>
                        */}
                        {/* <p>
                         <strong>Valor:</strong> ${post.revision}
                        </p> */}

                        <p>
                          <strong>Transportadora:</strong>{" "}
                          {post.vehiculo?.transportadora?.siglas ||
                            "Sin Transportadora"}
                        </p>
                        <p>
                          <strong>Hora de inicio:</strong> {post.horaInicio}
                        </p>
                        <p>
                          <strong>Hora de finalización:</strong> {post.horaFin}
                        </p>

                        <p>
                          <strong>Duración:</strong> {PostComponent(post)}
                        </p>

                        <div>
                          <strong>Empleados:</strong>
                          {post.empleados && post.empleados.length > 0 ? (
                            post.empleados.map((empleado) => (
                              <div key={empleado.idEmpleado}>
                                <span className="fs-6">
                                  {empleado.nombre1} {empleado.nombre2}{" "}
                                  {empleado.apellido1} {empleado.apellido2} -{" "}
                                  {empleado.documento}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span>No hay empleados asignados.</span>
                          )}
                        </div>
                        <p></p>
                      </div>
                      <div className="col-md-4">
                        <ImageMaximizer
                          src={images[post.idRecibo] || loadingPost}
                          altText="Descripción de la imagen"
                        />

                        <p>
                          <br />
                          <strong>Observaciones: </strong>

                          <div className="inner-shadow p-3 rounded-3">
                            {post.observaciones}
                          </div>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p></p>
              </div>
            ))}

            {idReciboToEdit && (
              <EditarRecibo
                idRecibo={idReciboToEdit}
                onClose={closeEditModal}
                cargarPosts={cargarPosts}
              />
            )}

            <div className="pagination text-center d-flex justify-content-center">
              <button
                onClick={goToPreviousPage}
                className="btn btn-primary"
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              {Array.isArray(Array(totalPages)) && totalPages > 0 ? (
                [...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={
                      (currentPage === i + 1 ? "active" : "") +
                      " btn btn-outline-primary mx-1"
                    }
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                <div className="p-2">No hay páginas para mostrar</div> // Texto opcional si no hay páginas
              )}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="btn btn-primary"
              >
                Siguiente
              </button>
            </div>
            <br />
            <br />
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deletePostModal"
        tabIndex="-1"
        aria-labelledby="deletePostModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content fondo2 text-white">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="deletePostModalLabel">
                Atención
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Estas seguro de eliminar este recibo?
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  // Send POST request to delete the post
                  fetch(variables("API") + `/recibo/delete`, {
                    method: "POST", // Specify the method if needed (GET is default)
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${sessionStorage.getItem(
                        "token"
                      )}`, // Include the token in the Authorization header
                    },
                    body: JSON.stringify({ idRecibo: idRecibo }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      Notificar(data.mensaje, data.status, "normal");

                      document
                        .getElementById("deletePostModal")
                        .classList.remove("show");
                      document
                        .getElementById("deletePostModal")
                        .setAttribute("aria-hidden", "true");
                      document.querySelector(".modal-backdrop").remove();
                      setPosts([]);
                      cargarPosts(false);
                    })
                    .catch((error) => {
                      Notificar(
                        "No se ha podido establecer conexión con el servidor",
                        "error",
                        "normal"
                      );
                    });
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <Publicar cargarPosts={cargarPosts}></Publicar>
    </>
  );
}

export default App;
