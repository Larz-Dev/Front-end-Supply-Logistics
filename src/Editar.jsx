import { useState, useEffect } from "react";

import { variables, Notificar } from "./funciones";

const Editar = ({ onClose, cargarPosts }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fecha, setFecha] = useState("");
  const [placa, setPlaca] = useState("");
  const [consecutivo, setConsecutivo] = useState("");
  const [carga, setCarga] = useState("");
  const [muelle, setMuelle] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [tipoCarga, setTipoCarga] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [transportadora, setTransportadora] = useState("");
  const [transportadoraDetails, setTransportadoraDetails] = useState(null);
  const [vehiculosList, setVehiculosList] = useState([]);
  const [serviciosList, setServiciosList] = useState([]);
  const [empleadosList, setEmpleadosList] = useState([]); // Lista de empleados
  const [selectedEmpleados, setSelectedEmpleados] = useState([]); // Empleados seleccionados
  const [empleadoInput, setEmpleadoInput] = useState(""); // Input de búsqueda
  const [observaciones, setObservaciones] = useState("");
  const [valor, setValor] = useState("");

  //const [precio, setPrecio] = useState([]);

  // Fetch data for vehicles and services and load receipt data
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
        //     variables("API") + "/servicio/listing"
        // );

        // Enviar el idRecibo en el cuerpo de la solicitud POST
        const reciboResponse = await fetch(
          variables("API") + `/recibobyid/listing`,
          {
            method: "POST", // Specify the method if needed (GET is default)
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
            },
            body: JSON.stringify({
              idRecibo: sessionStorage.getItem("idRecibo"),
            }), // Reemplaza "mi valor" con el valor real de idRecibo
          }
        );

        const vehiculos = await vehiculosResponse.json();
        //   const servicios = await serviciosResponse.json();
        const reciboData = await reciboResponse.json();

        setVehiculosList(vehiculos);
        // setServiciosList(servicios);

        // Configurar los valores iniciales para la edición

        const formatDateForInput = (fecha) => {
          return new Date(fecha).toISOString().slice(0, 10);
        };

        // Example usage:
        const fechaFormateada = formatDateForInput(reciboData.fecha);
        setFecha(fechaFormateada);
        setTipoCarga(reciboData.tipocarga);
        setCantidad(reciboData.cantidad);
        setPlaca(reciboData.vehiculo.placa);
        setConsecutivo(reciboData.consecutivo);
        setCarga(reciboData.area);
        setObservaciones(reciboData.observaciones);
        setValor(reciboData.valor);

        setSelectedEmpleados(reciboData.empleados);

        if (reciboData.area.startsWith("Distribución -")) {
          const [area, muelleName] = reciboData.area.split(" - ");
          setCarga(area); // "Distribución"
          setMuelle(muelleName); // "Muelle 1"
        } else {
          setCarga(reciboData.area);
          setMuelle(""); // Vacío si no es "Distribución - Muelle X"
        }
        setHoraFin(reciboData.horaFin);
        setHoraInicio(reciboData.horaInicio);
        // setConcepto(reciboData.idServicio);
        //  setPrecio(reciboData.revision);
        setTransportadora(reciboData.idTransportadora);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [sessionStorage.getItem("idRecibo")]);

  // Update transportadora when a placa is selected
  useEffect(() => {
    if (placa) {
      const vehiculoSeleccionado = vehiculosList.find(
        (vehiculo) => vehiculo.placa === placa
      );
      if (vehiculoSeleccionado) {
        setTransportadora(vehiculoSeleccionado.idTransportadora);
        setTransportadoraDetails(vehiculoSeleccionado.transportadora);
      }
    }
  }, [placa, vehiculosList]);

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

  // Update price when a concept/service is selected
  // useEffect(() => {

  // if (concepto) {
  //    const servicioSeleccionado = serviciosList.find(
  //     (servicio) => servicio.idServicio === parseInt(concepto)
  //   );
  //  if (servicioSeleccionado) {
  //    setPrecio(servicioSeleccionado.precio);
  //  }
  // }
  // }, [concepto, serviciosList]);

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
    const formData = new FormData();
    formData.append("fecha", fecha);
    formData.append("placa", placa);
    formData.append("consecutivo", consecutivo);
    formData.append("empleadosST", JSON.stringify(selectedEmpleados)); // Append selected empleados

    formData.append("idRecibo", sessionStorage.getItem("idRecibo"));
    // Verificar el campo de carga para añadir "Distribución - Muelle"
    if (carga === "Distribución" && muelle) {
      formData.append("area", `${carga} - ${muelle}`);
    } else {
      formData.append("area", carga);
    }

    formData.append("horaInicio", horaInicio);
    formData.append("horaFin", horaFin);
    formData.append("valor", valor);
    formData.append("tipocarga", tipoCarga);
    formData.append("cantidad", cantidad);
    formData.append("observaciones", observaciones);

    formData.append(
      "idTransportadora",
      transportadora || selectedTransportadora.idTransportadora
    ); // Transportadora seleccionada automáticamente
    formData.append(
      "idVehiculo",
      vehiculosList.find((vehiculo) => vehiculo.placa === placa)?.idVehiculo
    );
    formData.append("photo", selectedFile);
    formData.append("idUsuario", sessionStorage.getItem("idUsuario"));

    // Realizar solicitud de actualización
    fetch(variables("API") + `/recibo/edit`, {
      method: "PUT", // Specify the method if needed (GET is default)
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        Notificar(
          data.mensaje +
            " / " +
            (data.status === "error"
              ? "Posible identificador repetido"
              : "Exito"),
          data.status,
          "normal"
        );
        cargarPosts(false);
        onClose();
      })
      .catch((error) => {
        Notificar(
          "No se ha podido establecer conexión con el servidor",
          "error",
          "normal"
        );
      });
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      aria-labelledby="editModalLabel"
      aria-modal="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-transparent border-0">
          <div className="rounded-3 fondo2 p-2 my-3 p-3">
            <span href="#" className="d-flex align-items-center">
              <h1 className="mx-2 link-light text-decoration-none text-end">
                Editar recibo
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

                <div>
                  {preview && (
                    <img
                      id="preview"
                      src={preview}
                      alt="Preview"
                      width={500}
                      className="text-white img-fluid rounded"
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
                    value={fecha}
                    onChange={(event) => setFecha(event.target.value)}
                  />
                  <label className=" form-label text-white" htmlFor="placa">
                    Vehiculo
                  </label>
                  <input
                    list="vehiculosList"
                    placeholder="Placa del vehículo"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="placa"
                    id="placa"
                    value={placa}
                    onChange={(event) => setPlaca(event.target.value)}
                  />
                  <datalist id="vehiculosList">
                    {vehiculosList.map((vehiculo) => (
                      <option key={vehiculo.idVehiculo} value={vehiculo.placa}>
                        {" "}
                        {vehiculo.placa +
                          " " +
                          (vehiculo.siglasTransportadora || "Sin definir")}
                      </option>
                    ))}
                  </datalist>
                  <label
                    className=" form-label text-white"
                    htmlFor="consecutivo"
                  >
                    Consecutivo
                  </label>
                  <input
                    type="number"
                    placeholder="Consecutivo"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="consecutivo"
                    id="consecutivo"
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
                    <option value="Bodega de empaque">Bodega de empaque</option>
                    <option value="Estibas">Estibas</option>
                    <option value="Riper">Riper</option>
                  </select>

                  {/* Campo condicional para el nombre del muelle */}
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
                  {/* 
                  <input
                    list="serviciosList"
                    placeholder="Concepto"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    value={
                      concepto
                        ? serviciosList.find(
                            (s) => s.idServicio === parseInt(concepto)
                          )?.nombre
                        : ""
                    }
                    onChange={(event) => setConcepto(event.target.value)}
                  />
                  <datalist id="serviciosList">
                    {serviciosList.map((s) => (
                      <option key={s.idServicio} value={s.idServicio}>
                        {s.nombre + " - " + s.precio}
                      </option>
                    ))}
                  </datalist>
 */}
                  {/*    <input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="precio"
                    id="precio"
                    value={precio}
                    onChange={(event) => setPrecio(event.target.value)}
                    disabled
                  />
 */}
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
                    hora de finalización
                  </label>
                  <input
                    type="time"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="horaFin"
                    id="horaFin"
                    value={horaFin}
                    onChange={(event) => setHoraFin(event.target.value)}
                  />
                  <label className=" form-label text-white" htmlFor="tipoCarga">
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

                  <label className=" form-label text-white" htmlFor="cantidad">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="cantidad"
                    id="cantidad"
                    value={cantidad}
                    onChange={(event) => setCantidad(event.target.value)}
                  />
                  <label className=" form-label text-white" htmlFor="valor">
                    Valor $
                  </label>
                  <input
                    type="number"
                    placeholder="Valor"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="valor"
                    id="valor"
                    value={valor}
                    onChange={(event) => setValor(event.target.value)}
                  />
                  <label
                    className=" form-label text-white"
                    htmlFor="transportadora"
                  >
                    Transportadora
                  </label>
                  <input
                    type="text"
                    placeholder="Transportadora"
                    className="inner-shadow rounded form-control p-3 mb-2"
                    name="transportadora"
                    id="transportadora"
                    value={transportadoraDetails?.nombre || ""}
                    onChange={(event) => setTransportadora(event.target.value)}
                    disabled
                  />
                </div>

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

                  <span className="text-white ">Empleados asociados</span>

                  <div className=" row">
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
                        <i className="fa-solid fa-user"></i>
                        <br />
                        {" " +
                          (empleado.nombre ||
                            empleado.nombre1 + " " + empleado.apellido1)}{" "}
                      </div>
                    ))}
                    <p></p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cerrar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editar;
