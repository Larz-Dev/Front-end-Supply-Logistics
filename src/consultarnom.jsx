import React, { useState, useRef, useEffect } from "react";
import { variables, Notificar, Cargar } from "./funciones";
import fondo from "./assets/images/flechas.png";
import Chart from "react-apexcharts";

import html2pdf from "html2pdf.js";

import * as XLSX from "xlsx";

import logo from "./assets/images/logo-supply.png";

const Consult = () => {
  // Calculate the range of pages to display

  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datas, setDatas] = useState([]);
  const [Datos, setDatos] = useState([]);
  const [Datos2, setDatos2] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [Posicionrestar, setPosicionrestar] = useState(0);
  const [Consultanomina, setConsultaNomina] = useState([]);
  const [mostrarVentana1, setMostrarVentana1] = useState(true);
  const [tiempoAhora, setTiempoAhora] = useState("");

  const [FechaInicioQ, setFechaInicioQ] = useState([]);
  const [FechaFinQ, setFechaFinQ] = useState([]);

  const [sliderValue, setSliderValue] = useState(0);
  const printSectionRef = useRef();
  const fechas = Consultanomina.map((d) =>
    new Date(d.Fecha).toLocaleDateString()
  );

  const parseHoras = (valor) => {
    const num = parseFloat((valor ?? "").toString().trim());
    return isNaN(num) ? 0 : num;
  };

  // Función para obtener una serie, solo si contiene al menos un valor distinto de cero
  const crearSerie = (nombre, datosRaw) => {
    const datos = datosRaw.map(parseHoras);
    const tieneDatos = datos.some((val) => val !== 0);
    return tieneDatos ? { name: nombre, data: datos } : null;
  };

  // Generar series para gráfico 1 (horas extra)
  const chartSeries1 = [
    crearSerie(
      "Extra Diurna",
      Consultanomina.map((d) => d.Hora_extra_diurna)
    ),
    crearSerie(
      "Extra Nocturna",
      Consultanomina.map((d) => d.Hora_extra_nocturna)
    ),
    crearSerie(
      "Extra Dominical",
      Consultanomina.map((d) => d.Hora_extra_dominical)
    ),
    crearSerie(
      "Extra Festiva",
      Consultanomina.map((d) => d.Hora_extra_festiva)
    ),
    crearSerie(
      "Recargo Festivo",
      Consultanomina.map((d) => d.Recargo_festivo)
    ),
    crearSerie(
      "Recargo Nocturno",
      Consultanomina.map((d) => d.Recargo_nocturno)
    ),
    crearSerie(
      "Recargo Dominical",
      Consultanomina.map((d) => d.Recargo_dominical)
    ),
    crearSerie(
      "Diurna Ordinaria",
      Consultanomina.map((d) => d.Hora_diurna_ordinaria)
    ),
    crearSerie(
      "Descanso Dominical Festivo",
      Consultanomina.map((d) => d.Descarso_dominical_o_festivo)
    ),

    crearSerie(
      "Hora Dominical Diurna Ordinaria",
      Consultanomina.map((d) => d.Hora_dominical_diurna_ordinaria)
    ),
    crearSerie(
      "Hora Nocturna Festival o Dominical",
      Consultanomina.map((d) => d.Hora_nocturna_festival_o_dominical)
    ),
    crearSerie(
      "Hora Extra Diurna Festiva o Dominical",
      Consultanomina.map((d) => d.Hora_extra_diurna_festiva_o_dominical)
    ),
    crearSerie(
      "Hora Extra Nocturna Festiva o Dominical",
      Consultanomina.map((d) => d.Hora_extra_nocturna_festiva_o_dominical)
    ),
  ].filter(Boolean);
  // Generar series para gráfico 2 (recargos y ordinarias)

  // Opciones para ambos gráficos
  const chartOptions1 = {
    chart: { id: "horas-extras-1", type: "bar", height: 350, stacked: true },
    xaxis: { categories: fechas },
    title: {
      text: "Distribución de Horas por Día",
      align: "center",
      style: { color: "#333" },
    },

    legend: {
      show: true, // <-- fuerza que siempre se muestre
      position: "bottom",
      floating: false,
    },
    tooltip: { shared: true, intersect: false },
    dataLabels: {
      enabled: true,
      style: { colors: ["#000"] },
    },
  };

  // Gráfico de horas jornada por día (opcionalmente también puedes ocultar los ceros)

  const handlePrint = () => {
    var element = document.getElementById("print-section");
    var opt = {
      orientation: "landscape",
      margin: 0.2,
      format: "A2",
      filename: datas[1] + ".pdf",
      jsPDF: {
        unit: "mm",
        format: "A2",
        orientation: "landscape",
        compress: true,
      },
      html2canvas: {
        scale: 3, // Aumentar la escala mejora la calidad
        allowTaint: true,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth, // Ajusta al tamaño real del contenido
        windowHeight: element.scrollHeight,
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePrint2 = () => {
    var element = document.getElementById("print-section");

    var opt = {
      margin: 0.2,
      filename:
        "Control de horas (nómina) " +
        Consultanomina[0].Nombre +
        " " +
        Consultanomina[1].Apellido +
        " - " +
        Consultanomina[1].Cedula +
        " - " +
        new Date(Consultanomina[0].Fecha).toLocaleDateString() +
        " - " +
        new Date(
          Consultanomina[Consultanomina.length - 1].Fecha
        ).toLocaleDateString() +
        ".pdf",
      jsPDF: {
        unit: "mm",
        format: "A2",
        orientation: "portrait",
        compress: true,
      },
      html2canvas: {
        scale: 3,
        allowTaint: true,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        overflow: "hidden",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // Controla los saltos
    };

    html2pdf().set(opt).from(element).save();
  };

  // Obtener los datos de la tercera tabla

  // Identify the columns that contain date values

  const handleSubmit = async (e) => {
    setSliderValue(0);
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (id.length < 7) {
      setError("El documento debe tener al menos 7 dígitos");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(variables("API") + "/prenom/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const data = await response.json();
        //45703
        const valoresExcluidos = ["45716", "45703", "45731", "45746"];

        const filteredData = data.map((item) =>
          valoresExcluidos.includes(item) ? "" : item
        );

        setDatas(filteredData);
        OrganizarArreglo(filteredData);

        Notificar(
          "Su pre-nómina se ha consultado con éxito",
          "success",
          "normal"
        );
      } else {
        Notificar(
          "Error, no se ha encontrado este documento",
          "error",
          "normal"
        );
      }
    } catch (error) {
      console.error("Error al consultar la pre-pre-nómina:", error);
      Notificar(
        "Error al consultar la pre-nómina, por favor intente de nuevo o compruebe su conexión a internet",
        "error",
        "normal"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit2 = async (e) => {
    setSliderValue(0);
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (id.length < 7) {
      setError("El documento debe tener al menos 7 dígitos");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(variables("API") + "/nom/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const data = await response.json();

        setConsultaNomina(data);

        Notificar("Su nómina se ha consultado con éxito", "success", "normal");
      } else {
        Notificar(
          "Error, no se ha encontrado este documento",
          "error",
          "normal"
        );
      }
    } catch (error) {
      console.error("Error al consultar la nómina:", error);
      Notificar(
        "Error al consultar la nómina, por favor intente de nuevo o compruebe su conexión a internet",
        "error",
        "normal"
      );
    } finally {
      setLoading(false);
    }
  };

  function OrganizarArreglo(data) {
    let guardarSiguientes = 0;
    let newArreglo = [];
    let columnaActual2 = [];
    let columnaActual = [];
    let iAr = 0;
    let PosicionBono = 0;
    let Retornar = [];
    let Cell = "";
    let posicion = 0;

    data.forEach((element, index) => {
      Cell = element + "";

      if (Cell.includes("-") && Cell.includes("/")) {
        guardarSiguientes = 2;
      }

      if (Cell == "SUELDO BASICO") {
        guardarSiguientes = 4;
      }
      if (Cell == "SUBSIDIO DE TRANSPOR") {
        guardarSiguientes = 4;
      }

      if (Cell == "Vr Hora") {
        guardarSiguientes = 4;
      }

      if (Cell == "Total por Conceptos ") {
        guardarSiguientes = 4;
      }
      if (Cell == "Total por Recibido por consecutivo") {
        guardarSiguientes = 4;
      }

      if (Cell == "RECARGO NOCTURNO") {
        guardarSiguientes = 4;
      }
      if (Cell == "RECARGO DOMINICAL DI") {
        guardarSiguientes = 4;
      }
      if (Cell == "HORA EXTRA NOCTURNA") {
        guardarSiguientes = 4;
      }
      if (Cell == "HORA EXTRA DIURNA DO") {
        guardarSiguientes = 4;
      }
      if (Cell == "HORA EXTRA DIURNA") {
        guardarSiguientes = 4;
      }
      if (Cell == "HORA DOMINICAL DIURN") {
        guardarSiguientes = 4;
      }
      if (Cell == "BONIFICACION NO SALA") {
        PosicionBono = index;
        guardarSiguientes = 4;
      }
      if (Cell == "LICENCIA REMUNERADA") {
        guardarSiguientes = 4;
      }
      if (Cell == "DTO GR. RECORDAR") {
        guardarSiguientes = 4;
      }
      if (Cell == "SALUD") {
        guardarSiguientes = 4;
      }
      if (Cell == "INCAPACIDAD GENERAL") {
        guardarSiguientes = 4;
      }
      if (Cell == "INC EMPRESA OP") {
        guardarSiguientes = 4;
      }
      if (Cell == "PENSION") {
        guardarSiguientes = 4;
      }
      if (Cell == "LICENCIA NO REM") {
        guardarSiguientes = 4;
      }

      if (
        Cell == "BONIFICACION NO SALA" &&
        data[PosicionBono + 2].length != 1
      ) {
        newArreglo.splice(iAr, 2, "");
      }

      if (guardarSiguientes >= 1) {
        guardarSiguientes -= 1;

        if (guardarSiguientes == 1) {
          newArreglo[iAr] = Cell;
        }

        if (guardarSiguientes == 3) {
          if (Cell != "DTO GR. RECORDAR" && Cell != "LICENCIA NO REM") {
            if (Cell == "Total por Conceptos ") {
              setPosicionrestar(iAr);
            }

            //Revisar este
            columnaActual[iAr] = Cell;
          } else {
            columnaActual[iAr] = Cell;

            newArreglo[iAr] = "";
          }
        }
        if (guardarSiguientes == 2) {
          if (posicion == 9) {
            columnaActual2[iAr] = Number(Cell).toFixed(2);
          } else {
            columnaActual2[iAr] = Cell;
          }
        }
      }
      iAr += 1;

      //Establecer las siguientes condiciones

      posicion += 1;
    });
    Retornar.push(newArreglo);
    const datosLimpios = Retornar.filter((dato) => dato !== null)[0].slice(
      1,
      -1
    );
    const arregloConNull = datosLimpios.map((valor) =>
      valor === "" ? null : valor
    );

    const columnasLimpias = columnaActual.filter((columna) => columna !== null);

    setDatos2(columnaActual2);
    setDatos(arregloConNull.slice(1, -1));
    setColumnas(columnasLimpias);
  }

  const getColorPorHora = (horaStr) => {
    if (!horaStr) return ""; // Si no hay valor, no se pinta

    const [hora, minuto] = horaStr.split(":").map(Number);
    const totalMin = hora * 60 + minuto;

    // Asumimos:
    // Día: 05:00 - 13:59
    // Tarde: 14:00 - 21:59
    // Noche: 22:00 - 04:59
    if (totalMin >= 300 && totalMin < 840) return "#FFFA81"; // Día
    if (totalMin >= 840 && totalMin < 1320) return "#FF9C00"; // Tarde
    return "#5F7CD3"; // Noche
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const f = new Date(Date.now());
      const stringfecha =
        f.getDate() +
        "/" +
        (f.getMonth() + 1) +
        "/" +
        f.getFullYear() +
        " " +
        f.getHours() +
        ":" +
        f.getMinutes() +
        ":" +
        f.getSeconds();
      setTiempoAhora(stringfecha);
    }, 1000); // update every 1 second

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="">
      <header className="bg-supply py-3 shadow-sm ">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center ">
            <img
              src={logo}
              alt="Logo We Supply "
              height="70"
              className="me-2 bg-white rounded p-1"
            />
            <span className="fs-4 fw-bold text-white">We Supply</span>
          </div>
        </div>
      </header>
      <div className="container mt-4">
        {/* Botón para cambiar entre ventanas */}
        <div className="text-center mb-3">
          <div className="text-end">
            <a className="linkgris fs-6" href="https://github.com/Larz-Dev">
              Desarrollado por Larz-Dev <i className="fa-brands fa-github"></i>
            </a>
          </div>

          <button
            className={`btn ${
              mostrarVentana1 ? "btn-primary bg-supply" : "btn-secondary"
            } mx-2`}
            onClick={() => setMostrarVentana1(true)}
          >
            Consultar pre-nómina
          </button>
          <button
            className={`btn ${
              !mostrarVentana1 ? "btn-success" : "btn-secondary"
            } mx-2`}
            onClick={() => setMostrarVentana1(false)}
          >
            Consultar cierre de nómina
          </button>
        </div>
      </div>
      <div className="m-3">
        {/* Ventana 1 */}
        {mostrarVentana1 && (
          <div className="ventana1 p-3 border rounded bg-light">
            <h2 className="text-center ">Consultar pre-nómina</h2>

            <div className="row mx-auto">
              <div className="col-sm-4 p-4">
                <br />
                <div className="justificar  bg-success p-3 rounded-4  text-white ">
                  <h5 className="fw-bold ">Instrucciones:</h5>
                  Ingrese su número de documento, luego deslice la barra hasta
                  que se ponga de color verde y presione el botón 'Consultar
                  pre-nómina'
                </div>
              </div>
              <div className="col-sm-4 ">
                <br />
                <div className="  d-flex justify-content-center align-items-center">
                  <h3 className="form-label fw-bold fs-3 text-center">
                    Número de documento
                    <p></p>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="number"
                        className="form-control"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        minLength={6}
                      />
                      {error && <div className="text-danger">{error}</div>}
                      <br />
                      <input
                        type="range"
                        className=" slider-cuadrado "
                        style={{ backgroundImage: `url(${fondo})` }}
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(e.target.value)}
                      />
                      <p></p>
                      <button
                        type="submit"
                        className="form-control col p-1 rounded-4 btn-success btn  fw-bold"
                        disabled={loading || sliderValue !== "100"}
                      >
                        {loading ? "Cargando..." : "Consultar pre-nómina"}
                      </button>
                    </form>
                  </h3>
                </div>
              </div>

              <div className="col-sm-12 ">
                <div>
                  <div className="row p-5">
                    <div className="border col-sm-4 p-3 fw-bold">
                      El valor de "Salud" corresponde al descuento aplicado
                      sobre la nómina del trabajador.
                    </div>
                    <div className="border p-3 col-sm-4 p-3 fw-bold">
                      El valor de "Pensión" corresponde al descuento aplicado
                      sobre la nómina del trabajador.
                    </div>
                    <div className="border p-3 col-sm-4 p-3 fw-bold">
                      "DTO GR. RECORDAR" es un descuento por servicio funerario
                      (solo aplicable a quienes han contratado dicho servicio).
                    </div>

                    <div className="border p-3 col-sm-4 p-3 bg-esta fw-bold">
                      El valor mostrado en el cuadro de fondo verde es el monto
                      que se reflejará en la cuenta.
                    </div>
                    <div className="border p-3 col-sm-4 p-3 bg-esta bg-revisar fw-bold">
                      El valor mostrado en el cuadro de fondo amarillo
                      representa el monto total antes de aplicar los descuentos
                      por salud, pensión y otras razones.
                    </div>
                    <div className="border p-3 col-sm-4 p-3 bg-noesta fw-bold">
                      El valor mostrado en el cuadro de fondo rojo es el total
                      de los descuentos realizados sobre la nómina del
                      trabajador, incluyendo los descuentos por salud, pensión,
                      servicio funerario, etc.
                    </div>
                  </div>
                  <div className="" id="print-section" ref={printSectionRef}>
                    <br />

                    {Datos.length > 0 && (
                      <div>
                        <h2 className="text-center">{datas[1]}</h2>
                        <br />
                        <div className=" d-grid">
                          <div className="border p-3  fw-bold ">{datas[2]}</div>
                          <div className="border p-3  fw-bold ">{datas[3]}</div>
                          <div className="border p-3  fw-bold ">
                            {datas[4] + datas[5]}
                          </div>

                          <div className="border p-3  fw-bold ">
                            {datas[6].slice(0, -1) +
                              " $" +
                              new Intl.NumberFormat().format(datas[7])}
                          </div>
                          <div className="border p-3  fw-bold ">
                            Fecha y hora de exportación de este documento{" ● "}
                            {tiempoAhora}
                          </div>
                        </div>
                        <br />

                        <br />
                      </div>
                    )}
                    <div
                      className=""
                      style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        overflowX: "auto",
                      }}
                    >
                      {Datos.length > 0 && (
                        <table className="table border table-bordered  table-responsive table-striped table-hover m-2">
                          <thead>
                            <tr>
                              {columnas.map((columna, index) => (
                                <td
                                  className="PMayus  bg-supply text-white fw-bold text-center "
                                  key={index}
                                >
                                  {columna.toLowerCase()}
                                </td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {Datos2.map((fila, index) => (
                                <td
                                  className={
                                    Datos2.length - 1 == index
                                      ? "bg-esta"
                                      : Datos2.length - 5 == index
                                      ? "bg-revisar"
                                      : Datos2.length - 4 == index
                                      ? "bg-revisar"
                                      : ""
                                  }
                                  key={index}
                                >
                                  {fila > 999
                                    ? `$ ${new Intl.NumberFormat().format(
                                        fila
                                      )}`
                                    : fila}
                                </td>
                              ))}
                            </tr>

                            <tr>
                              {Datos.map((fila, index) => (
                                <td
                                  className={
                                    Datos.length - 3 == index
                                      ? "bg-noesta"
                                      : Datos.length - 2 == index
                                      ? "bg-noesta"
                                      : ""
                                  }
                                  key={index}
                                >
                                  {index == Posicionrestar
                                    ? `-$ ${new Intl.NumberFormat().format(
                                        fila
                                      )}`
                                    : fila > 999
                                    ? `$ ${new Intl.NumberFormat().format(
                                        fila
                                      )}`
                                    : fila}
                                </td>
                              ))}
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>

                    <div className="justificar  bg-warning fs-3 m-2 p-3 rounded-4  ">
                      <h2 className="fw-bold ">Nota:</h2>
                      Este aplicativo ha sido desarrollado por un aprendiz del
                      SENA como parte de un proyecto de aprendizaje. Por lo
                      tanto, no tiene ninguna relación con We Supply. En caso de
                      presentarse errores, se deberá notificar al aprendiz y no
                      al personal de la empresa.
                    </div>
                  </div>
                  <br />
                  {Datos.length > 0 && (
                    <div className="mx-5">
                      <button
                        className="form-control  p-1 rounded-4 btn-danger btn  fw-bold"
                        onClick={handlePrint}
                      >
                        descargar pre-nómina{" "}
                        <i className="fa-solid fa-file-pdf"></i>
                      </button>
                    </div>
                  )}
                </div>
                <br />
                <br />
              </div>
            </div>
          </div>
        )}

        {/* Ventana 2 */}
        {!mostrarVentana1 && (
          <div className="ventana2 p-3 border rounded bg-light">
            <div className="text-center">
              <h2 className="text-center ">Consultar cierre de nómina</h2>

              <div className="row mx-auto">
                <div className="col-sm-4 p-4">
                  <br />
                  <div className="justificar  bg-success p-3 rounded-4  text-white ">
                    <h5 className="fw-bold ">Instrucciones:</h5>
                    Ingrese su número de documento, luego deslice la barra hasta
                    que se ponga de color verde y presione el botón 'Consultar
                    cierre de nómina'
                  </div>
                </div>
                <div className="col-sm-4 ">
                  <br />
                  <div className="  d-flex justify-content-center align-items-center">
                    <h3 className="form-label fw-bold fs-3 text-center">
                      Número de documento
                      <p></p>
                      <form onSubmit={handleSubmit2}>
                        <input
                          type="number"
                          className="form-control"
                          value={id}
                          onChange={(e) => setId(e.target.value)}
                          minLength={6}
                        />
                        {error && <div className="text-danger">{error}</div>}
                        <br />
                        <input
                          type="range"
                          className=" slider-cuadrado "
                          style={{ backgroundImage: `url(${fondo})` }}
                          min="0"
                          max="100"
                          value={sliderValue}
                          onChange={(e) => setSliderValue(e.target.value)}
                        />
                        <p></p>
                        <button
                          type="submit"
                          className="form-control col p-1 rounded-4 btn-success btn  fw-bold"
                          disabled={loading || sliderValue !== "100"}
                        >
                          {loading
                            ? "Cargando..."
                            : "Consultar cierre de nómina"}
                        </button>
                      </form>
                    </h3>
                  </div>
                </div>
              </div>

              <div className="" id="print-section" ref={printSectionRef}>
                <br />

                {Consultanomina.length > 0 && (
                  <div>
                    <div className=" text-start">
                      <div className="border p-3  fw-bold ">
                        Nombre:{" "}
                        {Consultanomina[0].Nombre +
                          " " +
                          Consultanomina[1].Apellido}
                      </div>
                      <div className="border p-3  fw-bold ">
                        Documento: {Consultanomina[1].Cedula}
                      </div>
                      <div className="border p-3  fw-bold ">
                        Rango de fecha con horas registradas:{" "}
                        {new Date(
                          Consultanomina[0].Fecha
                        ).toLocaleDateString() +
                          " - " +
                          new Date(
                            Consultanomina[Consultanomina.length - 1].Fecha
                          ).toLocaleDateString()}
                      </div>
                      <div className="border p-3  fw-bold ">
                        Fecha y hora de exportación de este documento{" ● "}
                        {tiempoAhora}
                      </div>
                    </div>
                    <br />
                    <br />

                    <br />
                  </div>
                )}

                <div
                  className=""
                  style={{
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  {Consultanomina.length > 0 && (
                    <table className="table border table-bordered table-responsive table-striped table-hover m-2">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Día</th>
                          <th>Código</th>
                          <th>Entrada</th>
                          <th>Salida</th>
                          <th>Jornada</th>
                          <th>Tipo de Turno</th>
                          <th>Hora Diurna Ordinaria</th>
                          <th>Recargo Nocturno</th>
                          <th>Hora Extra Diurna</th>
                          <th>Hora Extra Nocturna</th>
                          <th>Hora Dominical Diurna Ordinaria</th>
                          <th>Hora Nocturna Festival o Dominical</th>
                          <th>Hora Extra Diurna Festiva o Dominical</th>
                          <th>Hora Extra Nocturna Festiva o Dominical</th>
                          <th>Descanso Dominical o Festivo</th>
                          <th>Total de Horas Extra</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Consultanomina.map((item) => (
                          <tr key={item.idNomina}>
                            <td>{new Date(item.Fecha).toLocaleDateString()}</td>
                            <td>{item.Dom_Fest}</td>

                            <td>{item.Codigo_2}</td>
                            <td
                              className=" text-white align-content-center"
                              style={{
                                backgroundColor: getColorPorHora(
                                  item.Hora_entrada
                                ),
                                color: "#000",
                              }}
                            >
                              <span className="bg-black bg-opacity-25 rounded-3 p-1 ">{item.Hora_entrada}</span>
                            </td>
                            <td
                              className=" text-white align-content-center"
                              style={{
                                backgroundColor: getColorPorHora(
                                  item.Hora_salida
                                ),
                                color: "#000",
                              }}
                            >
                                  <span className="bg-black bg-opacity-25 rounded-3 p-1">{item.Hora_salida}</span>
                            </td>
                            <td
                              className=" text-white align-content-center"
                              style={{
                                backgroundColor: getColorPorHora(
                                  item.Horas_jornada
                                ),
                                color: "#fff",
                              }}
                            >
                                <span className="bg-black bg-opacity-25 rounded-3 p-1"> {item.Horas_jornada}</span> 
                            </td>
                            <td>{item.Tipo_turno.trim()}</td>
                            <td>{item.Hora_diurna_ordinaria.trim()}</td>
                            <td>{item.Recargo_nocturno}</td>
                            <td>{item.Hora_extra_diurna.trim()}</td>
                            <td>{item.Hora_extra_nocturna.trim()}</td>
                            <td>
                              {item.Hora_dominical_diurna_ordinaria.trim()}
                            </td>
                            <td>
                              {item.Hora_nocturna_festival_o_dominical.trim()}
                            </td>
                            <td>
                              {item.Hora_extra_diurna_festiva_o_dominical?.trim() ??
                                "-"}
                            </td>
                            <td>
                              {item.Hora_extra_nocturna_festiva_o_dominical.trim()}
                            </td>
                            <td>{item.Descarso_dominical_o_festivo.trim()}</td>
                            <td>{item.Total_horas_extra.trim()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {Consultanomina.length > 0 && (
                  <div>
                    <br />
                    <br />
                    <Chart
                      options={chartOptions1}
                      series={chartSeries1}
                      type="bar"
                      height={500}
                    />
                    <br />
                    <br />
                  </div>
                )}

                <div className="justificar  bg-warning fs-3 m-2 p-3 rounded-4  ">
                  <h2 className="fw-bold ">Nota:</h2>
                  Este aplicativo ha sido desarrollado por un aprendiz del SENA
                  como parte de un proyecto de aprendizaje. Por lo tanto, no
                  tiene ninguna relación con We Supply. En caso de presentarse
                  errores, se deberá notificar al aprendiz y no al personal de
                  la empresa.
                </div>
              </div>
              <br />
              {Consultanomina.length > 0 && (
                <div className="mx-5">
                  <button
                    className="form-control  p-1 rounded-4 btn-danger btn  fw-bold"
                    onClick={handlePrint2}
                  >
                    descargar pre-nómina{" "}
                    <i className="fa-solid fa-file-pdf"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p></p>
      <p></p>
    </div>
  );
};

export default Consult;
