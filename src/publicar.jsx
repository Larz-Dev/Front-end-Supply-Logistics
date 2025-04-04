import { useState, useEffect } from "react";

import { variables, Notificar } from "./funciones";

const Publicar = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fecha, setFecha] = useState("");
  const [placa, setPlaca] = useState("");
  const [consecutivo, setConsecutivo] = useState("");
  const [carga, setCarga] = useState("");
  const [concepto, setConcepto] = useState("");
  const [precio, setPrecio] = useState("");

  const [cantidad, setCantidad] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");

  const [transportadora, setTransportadora] = useState("");
  const [transportadoraDetails, setTransportadoraDetails] = useState(null);
  const [vehiculosList, setVehiculosList] = useState([]);
  const [serviciosList, setServiciosList] = useState([]);
  const [horaInicio, setHoraInicio] = useState([]);
  const [horaFin, setHoraFin] = useState([]);
  const [transportadoraList, setTransportadoraList] = useState([]);
  const [selectedTransportadora, setSelectedTransportadora] = useState(null);
  const [muelle, setMuelle] = useState(null);
  const [empleadosList, setEmpleadosList] = useState([]); // Lista de empleados
  const [selectedEmpleados, setSelectedEmpleados] = useState([]); // Empleados seleccionados
  const [empleadoInput, setEmpleadoInput] = useState(""); // Input de búsqueda
  const [observaciones, setObservaciones] = useState("");
  const [valor, setValor] = useState("");
  // Fetching the data for vehiculos, servicios, and usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const empleadosResponse = await fetch(
          variables("API") + "/empleado/listingwork",
          {
            method: "GET", // Specify the method if needed (GET is default)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
            },
          }
        );
        const empleados = await empleadosResponse.json();
        setEmpleadosList(empleados);

        const vehiculosResponse = await fetch(
          variables("API") + "/vehiculo/listing",
          {
            method: "GET", // Specify the method if needed (GET is default)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
            },
          }
        );
        // const serviciosResponse = await fetch(
        // variables("API") + "/servicio/listing"
        // );
        const transportadoraResponse = await fetch(
          variables("API") + "/transportadora/listing",
          {
            method: "GET", // Specify the method if needed (GET is default)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
            },
          }
        );

        const vehiculos = await vehiculosResponse.json();
        //  const servicios = await serviciosResponse.json();
        const transportadora = await transportadoraResponse.json();

        setVehiculosList(vehiculos);
        //    setServiciosList(servicios);
        setTransportadoraList(transportadora);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Actualiza la transportadora cuando se selecciona una placa
  useEffect(() => {
    if (placa) {
      const vehiculoSeleccionado = vehiculosList.find(
        (vehiculo) => vehiculo.placa === placa
      );
      if (vehiculoSeleccionado) {
        setTransportadora(vehiculoSeleccionado.idTransportadora);
        setTransportadoraDetails(vehiculoSeleccionado.transportadora); // Guardamos los detalles de la transportadora
      }
    }
  }, [placa, vehiculosList]);

  // Actualiza el precio cuando se selecciona un concepto
  useEffect(() => {
    //   if (concepto) {
    //     const servicioSeleccionado = serviciosList.find(
    //     (servicio) => servicio.idServicio === parseInt(concepto)
    //   );
    //  if (servicioSeleccionado) {
    //     setPrecio(servicioSeleccionado.precio); // Establecemos el precio del servicio
    //   }
    //  }
  }, [concepto, serviciosList]);

  // Handle empleado selection and removal

  // Handle empleado selection and removal
  const handleEmpleadoSelection = (idEmpleado, nombre) => {
    if (
      selectedEmpleados.some((empleado) => empleado.idEmpleado === idEmpleado)
    ) {
      setSelectedEmpleados(
        selectedEmpleados.filter(
          (empleado) => empleado.idEmpleado !== idEmpleado
        )
      ); // Remove empleado
    } else {
      setSelectedEmpleados([...selectedEmpleados, { idEmpleado, nombre }]); // Add empleado
    }
    setEmpleadoInput(""); // Clear the input after selection
  };

  const handleEmpleadoInputChange = (e) => {
    setEmpleadoInput(e.target.value); // Update the input as the user types
  };

  const handleEmpleadoInputBlur = () => {
    // Al perder foco, verificar si el input tiene un valor válido
    if (empleadoInput.trim() !== "") {
      // Buscar si el empleado existe en la lista
      const empleado = empleadosList.find(
        (empleado) =>
          `${empleado.nombre1} ${empleado.apellido1}`.toLowerCase() ===
          empleadoInput.trim().toLowerCase()
      );
      if (empleado) {
        handleEmpleadoSelection(
          empleado.idEmpleado,
          `${empleado.nombre1} ${empleado.apellido1}`
        );
      } else {
        setEmpleadoInput(""); // Limpiar el input si no se encuentra coincidencia
      }
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  };

  const handlePlacaChange = (event) => {
    const value = event.target.value;
    setPlaca(value);

    if (value.trim() === "") {
      // Si la placa está vacía, borrar la transportadora seleccionada
      setTransportadora("");
      setTransportadoraDetails(null);
    } else {
      // Si la placa no está vacía, buscar la transportadora asociada
      const vehiculoSeleccionado = vehiculosList.find(
        (vehiculo) => vehiculo.placa === value
      );
      if (vehiculoSeleccionado) {
        setTransportadora(vehiculoSeleccionado.idTransportadora);
        setTransportadoraDetails(vehiculoSeleccionado.transportadora);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("fecha", fecha);
    formData.append("placa", placa);
    formData.append("consecutivo", consecutivo);

    if (carga == "Distribución") {
      formData.append("area", carga + " - " + muelle);
    } else {
      formData.append("area", carga);
    }

    // formData.append("idServicio", concepto); // Enviar el id del servicio
    //formData.append("revision", precio);
    formData.append("horaInicio", horaInicio);
    formData.append("observaciones", observaciones);

    formData.append("horaFin", horaFin);
    formData.append("tipocarga", tipoCarga);
    formData.append("valor", valor);
    formData.append(
      "idTransportadora",
      transportadora || selectedTransportadora.idTransportadora
    ); // Transportadora seleccionada automáticamente
    formData.append(
      "idVehiculo",
      vehiculosList.find((vehiculo) => vehiculo.placa === placa)?.idVehiculo
    ); // Enviar idVehiculo
    formData.append("photo", selectedFile);
    formData.append("idUsuario", sessionStorage.getItem("idUsuario"));
    formData.append("cantidad", cantidad);
    formData.append("empleados", JSON.stringify(selectedEmpleados)); // Append selected empleados

    // Send the form data to your API
    fetch(variables("API") + "/recibo/create", {
      method: "POST", // Specify the method if needed (GET is default)
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
      },

      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        Notificar(data.mensaje, "success", "normal");

        props.cargarPosts(false);
      })
      .catch((error) => {
        Notificar(
          "No se ha podido establecer conexió con el servidor",
          "error",
          "normal"
        );
      });
  };

  return (
    <>
      <button
        className="flotante position-fixed bg-supply m-4"
        data-bs-toggle="modal"
        data-bs-target="#post"
      >
        <i className="fa-solid fa-plus"></i>
      </button>

      <div
        className="modal fade"
        id="post"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content bg-transparent border-0 ">
            <div className="rounded-3 fondo2 p-2 my-3 p-3">
              <span href="#" className="d-flex align-items-center text-end">
                <h1 className="mx-2 link-light text-decoration-none">
                  Registrar recibo
                </h1>
              </span>

              <form onSubmit={handleSubmit}>
                <div className="row px-3 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-white fondo3 inner-shadow rounded p-3"
                    name="photo"
                    id="photo"
                  />
                  <p></p>
                  <div className="">
                    {preview && (
                      <img
                        id="preview"
                        src={preview}
                        alt="Preview"
                        width={500}
                        className="text-white img-fluid rounded "
                      />
                    )}
                  </div>

                  <div className="col-6 p-3">
                    <label className=" form-label text-white" htmlFor="fecha">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="fecha"
                      id="fecha"
                      required
                      value={fecha}
                      onChange={(event) => setFecha(event.target.value)}
                    />

                    {/* Transportadora */}

                    <label
                      className=" form-label text-white"
                      htmlFor="transportadora"
                    >
                      Transportadora
                    </label>
                    <input
                      name="transportadora"
                      type="text"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      value={
                        transportadoraDetails
                          ? transportadoraDetails.nombre
                          : ""
                      }
                      list="transportadoraList"
                      onChange={(e) => {
                        const selected = transportadoraList.find(
                          (transportadora) =>
                            transportadora.nombre === e.target.value
                        );
                        setTransportadoraDetails(
                          selected?.nombre || e.target.value
                        );
                        setSelectedTransportadora(selected || null);
                      }}
                    />
                    <datalist id="transportadoraList">
                      {transportadoraList.map((s) => (
                        <option key={s.idTransportadora} value={s.nombre}>
                          {s.siglas}
                        </option>
                      ))}
                    </datalist>

                    {/* Input para la transportadora */}
                    <label
                      className=" form-label text-white"
                      htmlFor="consecutivo"
                    >
                      Consecutivo
                    </label>
                    <input
                      type="number"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="consecutivo"
                      id="consecutivo"
                      required
                      value={consecutivo}
                      onChange={(event) => setConsecutivo(event.target.value)}
                    />

                    <label className=" form-label text-white" htmlFor="carga">
                      Area
                    </label>
                    <select
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="carga"
                      id="carga"
                      required
                      value={carga}
                      onChange={(event) => setCarga(event.target.value)}
                    >
                      <option value="">Seleccione un área</option>
                      <option value="Biopacol">Biopacol</option>
                      <option value="Materia Prima">Materia Prima</option>
                      <option value="Distribución">Distribución</option>
                      <option value="Bodega de empaque">
                        Bodega de empaque
                      </option>
                      <option value="Estibas">Estibas</option>
                    </select>

                    {carga === "Distribución" && (
                      <div>
                        <label
                          className=" form-label text-white"
                          htmlFor="muelle"
                        >
                          Muelle
                        </label>

                        <select
                          className="inner-shadow rounded form-control p-3 mb-2"
                          name="muelle"
                          id="muelle"
                          required
                          value={muelle}
                          onChange={(event) => setMuelle(event.target.value)}
                        >
                          <option value="">Seleccione un muelle</option>
                          <option value="Muelle 1">Muelle 1</option>
                          <option value="Muelle 2">Muelle 2</option>
                          <option value="Muelle 3">Muelle 3</option>
                          <option value="Muelle 4">Muelle 4</option>
                          <option value="Muelle 5">Muelle 5</option>
                          <option value="Muelle 6">Muelle 6</option>
                          <option value="Muelle 7">Muelle 7</option>
                          <option value="Muelle 8">Muelle 8</option>
                          <option value="Muelle 9">Muelle 9</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="col-6 p-3">
                    <label className=" form-label text-white" htmlFor="placa">
                      Placa
                    </label>
                    <input
                      list="vehiculosList"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="placa"
                      id="placa"
                      required
                      value={placa}
                      onChange={handlePlacaChange}
                    />
                    <datalist id="vehiculosList">
                      {vehiculosList.map((vehiculo) => (
                        <option
                          key={vehiculo.idVehiculo}
                          value={vehiculo.placa}
                        >
                          {vehiculo.tipo +
                            " / " +
                            (vehiculo.transportadora?.siglas || "Sin asignar")}
                        </option>
                      ))}
                    </datalist>

                    <label
                      className=" form-label text-white"
                      htmlFor="horaInicio"
                    >
                      Hora de inicio
                    </label>

                    <input
                      type="time"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="horaInicio"
                      id="horaInicio"
                      value={horaInicio}
                      onChange={(event) => setHoraInicio(event.target.value)}
                    />
                    <label className=" form-label text-white" htmlFor="horaFin">
                      Hora de finalización
                    </label>
                    <input
                      type="time"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="horaFin"
                      id="horaFin"
                      value={horaFin}
                      onChange={(event) => setHoraFin(event.target.value)}
                    />

                    <label className=" form-label text-white" htmlFor="horaFin">
                      Tipo de carga
                    </label>
                    <select
                      type="text"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="tipoCarga"
                      id="tipoCarga"
                      required
                      value={tipoCarga}
                      onChange={(event) => setTipoCarga(event.target.value)}
                    >
                      <option value="">Seleccione el tipo de carga</option>
                      <option value="Granel">Granel</option>
                      <option value="Estibas">Estibas</option>
                    </select>

                    <label
                      className=" form-label text-white"
                      htmlFor="cantidad"
                    >
                      Cantidad
                    </label>
                    <input
                      type="number"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="cantidad"
                      id="cantidad"
                      required
                      value={cantidad}
                      onChange={(event) => setCantidad(event.target.value)}
                    />

                    <label className=" form-label text-white" htmlFor="valor">
                      Valor $
                    </label>
                    <input
                      type="number"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="valor"
                      id="valor"
                      required
                      value={valor}
                      onChange={(event) => setValor(event.target.value)}
                    />
                  </div>

                  {/* Buscar y agregar empleados */}

                  <div className="px-3">
                    <label
                      className="form-label text-white"
                      htmlFor="observaciones"
                    >
                      Observaciones
                    </label>
                    <textarea
                      type="text"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      name="observaciones"
                      id="observaciones"
                      value={observaciones}
                      onChange={(event) => setObservaciones(event.target.value)}
                    />

                    <label className="form-label text-white" htmlFor="empleado">
                      Buscar empleados
                    </label>
                    <input
                      list="empleadosList"
                      id="empleado"
                      className="inner-shadow rounded form-control p-3 mb-2"
                      value={empleadoInput}
                      onChange={handleEmpleadoInputChange}
                      onBlur={handleEmpleadoInputBlur} // Verificar al perder foco
                    />
                    <datalist id="empleadosList">
                      {empleadosList
                        .filter(
                          (empleado) =>
                            empleado.nombre1
                              .toLowerCase()
                              .includes(empleadoInput.toLowerCase()) ||
                            empleado.apellido1
                              .toLowerCase()
                              .includes(empleadoInput.toLowerCase())
                        )
                        .map((empleado) => (
                          <option
                            key={empleado.idEmpleado}
                            value={`${empleado.nombre1} ${empleado.apellido1}`}
                            onClick={() =>
                              handleEmpleadoSelection(
                                empleado.idEmpleado,
                                `${empleado.nombre1} ${empleado.apellido1}`
                              )
                            }
                          >
                            {empleado.documento}
                          </option>
                        ))}
                    </datalist>

                    {/* Empleados seleccionados */}

                    <label
                      className="form-label text-white"
                      htmlFor="empleadosSeleccionados"
                    >
                      Empleados asociados
                    </label>
                    <div className="row">
                      {selectedEmpleados.map((empleado) => (
                        <div
                          key={empleado.idEmpleado}
                          className=" btn col-md-3 align-content-center fs-6  bg-primary  text-white m-1 p-1"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleEmpleadoSelection(
                              empleado.idEmpleado,
                              empleado.nombre
                            )
                          } // Remove on click
                        >
                          <i className="fa-solid fa-user"></i> <br />{" "}
                          {empleado.nombre}{" "}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p></p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    Cerrar
                  </button>
                  <p></p>
                  <button type="submit" className="btn btn-primary">
                    Registrar
                  </button>
                  <p></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Publicar;
