import Fondo from "./assets/images/fondo3.png";
import logo from "./assets/images/logo-supply.png";

import logo1 from "./assets/images/C1.png"; // Primera imagen
import logo2 from "./assets/images/C2.png"; // Segunda imagen
import logo3 from "./assets/images/C3.png"; // Tercera imagen
import { Notificar } from "./funciones";

import ExcelJS from "exceljs";
import { useState, useEffect } from "react";
import { saveAs } from "file-saver";

const Tools = () => {
  const [data, setData] = useState([]);

  const [archivoCabecera, setArchivoCabecera] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  document.body.style.backgroundImage = `url(${Fondo})`;
  document.body.style.backgroundSize = "600%";
  document.body.style.backgroundRepeat = "no-repeat";

  const AdjustColumnWidth = async (worksheet) => {
    worksheet.columns.forEach((column) => {
      const lengths = column.values.map((v) => v.toString().length);
      const maxLength = Math.max(
        ...lengths.filter((v) => typeof v === "number")
      );
      column.width = maxLength;
    });
  };

  const [isFileInputDisabled, setFileInputDisabled] = useState(true);

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    setFileInputDisabled(!date); // Disable file input if no date is selected
  };

  const manejarArchivoReemplazo = async (archivo) => {
    const datos = await cargarDatosExcel(archivo); // Cargar los datos del Excel
    reemplazarTiposVehiculo(datos); // Realizar el reemplazo de tipo de vehículo
  };
  const crearArchivoExcelConReemplazos = async (datos) => {
    const libroTrabajo = new ExcelJS.Workbook();
    let Dia = new Date(selectedDate);
    const fechautc = Dia.getUTCDate();

    const hojaTrabajo = libroTrabajo.addWorksheet(
      "Operaciones " + obtenerNombreMes(Dia.getMonth())
    );

    console.log(datos[0][0]);
    if (
      datos[0][0] != "Fecha" &&
      datos[1][0] != "Placa" &&
      datos[7][0] != "Pago"
    ) {
      Notificar(
        "El documento de excel no coincide con el formato de exportación",
        "error",
        "normal"
      );

      return null;
    } else {
      Notificar(
        "Se ha procesado correctamente el archivo, descargando archivo",
        "success",
        "normal"
      );
    }

    // Agregar los datos al worksheet
    datos.forEach((fila, indiceFila) => {
      hojaTrabajo.addRow(fila); // Añadir fila al worksheet
    });

    // Ajustar el ancho de las columnas

    hojaTrabajo.getColumn(1).width = 15; // Ancho para la columna Fecha
    hojaTrabajo.getColumn(2).width = 20; // Ancho para la columna Placa
    hojaTrabajo.getColumn(3).width = 25; // Ancho para la columna Tipo de Vehículo
    hojaTrabajo.getColumn(4).width = 25; // Ancho para la columna Transportadora
    hojaTrabajo.getColumn(5).width = 20; // Ancho para la columna Tipo de Operación
    hojaTrabajo.getColumn(6).width = 15; // Ancho para la columna No. Recibo
    hojaTrabajo.getColumn(7).width = 15; // Ancho para la columna Valor
    hojaTrabajo.getColumn(8).width = 15; // Ancho para la columna Pago
    hojaTrabajo.getColumn(1).eachCell((celda, rowNumber) => {
      if (rowNumber > 1) {
        // Para evitar que se formatee el encabezado
        celda.numFmt = "dd-mm-yyyy"; // Formato de fecha
      }
    });

    // Formatear la columna de valor (suponiendo que está en la columna 7)
    hojaTrabajo.getColumn(7).eachCell((celda, rowNumber) => {
      if (rowNumber > 1 && celda.text !== "") {
        // Asegurarse de que no sea una celda vacía
        celda.numFmt = '"$"#,##0'; // Formato monetario (con símbolo $)
      }
    });

    hojaTrabajo.eachRow((fila, index) => {
      fila.eachCell((celda, colNumber) => {
        celda.font = { name: "Arial", size: 12 }; // Set font to Arial

        // Centrar tanto horizontal como verticalmente
        celda.alignment = { vertical: "middle", horizontal: "center" };

        if (colNumber >= 9) {
          // Comenzar desde la columna 9 (I)
          celda.value = null; // Limpiar el contenido de la celda
        }
      });
    });

    hojaTrabajo.autoFilter = "A1:H" + datos.length + 1;

    // Activar filtro en todas las columnas del encabezado (A a H)

    // Generar y descargar el archivo Excel
    const bufferExcel = await libroTrabajo.xlsx.writeBuffer();
    const blob = new Blob([bufferExcel], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Extrae el día y el mes
    const Fecha = fechautc + " " + obtenerNombreMes(Dia.getMonth());
    const nombre = "Operaciones " + Fecha + " (Sistema)" + ".xlsx";

    saveAs(blob, nombre);
  };

  const cargarDatosExcel = async (archivo) => {
    return new Promise((resolve, reject) => {
      const libroTrabajo = new ExcelJS.Workbook();
      const lector = new FileReader();

      lector.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          await libroTrabajo.xlsx.load(arrayBuffer); // Cargar el archivo Excel
          const hojaTrabajo = libroTrabajo.worksheets[0]; // Obtener la primera hoja

          const datosJson = [];
          hojaTrabajo.eachRow((fila, numeroFila) => {
            datosJson.push(fila.values.slice(1)); // Excluir el número de fila
          });

          resolve(datosJson);
        } catch (error) {
          reject(error);
        }
      };

      lector.onerror = (error) => {
        reject(error);
      };

      lector.readAsArrayBuffer(archivo); // Leer el archivo como ArrayBuffer
    });
  };

  const reemplazarTiposVehiculo = (datos) => {
    const reemplazosPlacas = {
      JTZ560: "MINIMULA",
      JTZ561: "MINIMULA",
      KNY993: "MINIMULA",
      KNY994: "MINIMULA",
      KNY996: "MINIMULA",
      KNY998: "MINIMULA",
      KNZ002: "MINIMULA",
      KNZ003: "MINIMULA",
      KNZ004: "MINIMULA",
      KNZ005: "MINIMULA",
      KNZ006: "MINIMULA",
      KNZ007: "MINIMULA",
      KNZ008: "MINIMULA",
      JTY456: "SUPERMINIM",
      KNY989: "SUPERMINIM",
      KNY991: "SUPERMINIM",
      KNY995: "SUPERMINIM",
      KNY997: "SUPERMINIM",
      KNY999: "SUPERMINIM",
      KNZ001: "SUPERMINIM",
      KSK426: "MULA",
      KSK427: "MULA",
      KSK428: "MULA",
      KSK429: "MULA",
      KSK456: "MULA",
      LFQ744: "MULA",
      LFQ791: "MULA",
      LFQ793: "MULA",
      LFQ794: "MULA",
      LFQ795: "MULA",
      LTL379: "MULA",
      LTL381: "MULA",
      LTL382: "MULA",
      LTL383: "MULA",
      LTL384: "MULA",
      LTL385: "MULA",
    };

    // Recorrer las filas y reemplazar el tipo de vehículo
    datos.forEach((fila, indice) => {
      const placa = fila[1]; // Columna de placa (suponiendo que es la segunda columna)
      if (reemplazosPlacas[placa]) {
        fila[2] = reemplazosPlacas[placa]; // Reemplazar el tipo de vehículo en la tercera columna
      }

      if (fila[2]) {
        if (fila[2].toUpperCase() == "M") {
          fila[2] = "MULA";
        }
      }
    });

    crearArchivoExcelConReemplazos(datos); // Generar el archivo modificado
  };
  const obtenerNombreMes = () => {
    const nombresMeses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const mes = new Date(Date.now()).getUTCMonth(); // Obtiene el mes (0 - 11)
    return nombresMeses[mes]; // Devuelve el nombre del mes
  };

  // Función para ajustar el ancho de las columnas

  const LeerExcel = async (file) => {
    const data = await readExcel(file); // Ensure that readExcel returns the data
    procesarCabecera(data);
  };
  const readExcel = async (file) => {
    return new Promise((resolve, reject) => {
      const workbook = new ExcelJS.Workbook();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result; // Get the ArrayBuffer
          await workbook.xlsx.load(arrayBuffer); // Load the Excel file from the ArrayBuffer
          const worksheet = workbook.worksheets[0]; // Get the first worksheet

          // Convert worksheet data to a 2D array
          const jsonData = [];
          worksheet.eachRow((row, rowNumber) => {
            jsonData.push(row.values.slice(1)); // slice(1) to remove the first element which is the row number
          });

          resolve(jsonData); // Resolve the promise with the data
        } catch (error) {
          reject(error); // Reject the promise in case of an error
        }
      };

      reader.onerror = (error) => {
        reject(error); // Reject the promise if there's an error reading the file
      };

      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    });
  };
  const procesarCabecera = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Definir ancho y alto de columnas/filas para las imágenes
    worksheet.getColumn(1).width = 25; // Ancho de la columna A
    worksheet.getRow(1).height = 60; // Alto de la fila 1

    // Función para cargar imágenes y devolver el ID de la imagen
    const loadImage = async (imagePath) => {
      const response = await fetch(imagePath); // Cargar imagen como blob
      const buffer = await response.arrayBuffer(); // Convertir la imagen a buffer
      return workbook.addImage({
        buffer,
        extension: "png", // Cambia según el tipo de tu imagen (png, jpeg, etc.)
      });
    };

    // Cargar las tres imágenes
    const imageId1 = await loadImage(logo1);
    const imageId2 = await loadImage(logo2);
    const imageId3 = await loadImage(logo3);

    // Insertar las imágenes en diferentes celdas
    worksheet.addImage(imageId1, {
      tl: { col: 0, row: 0 }, // Imagen en celda A1
      br: { col: 2, row: 1 },
      editAs: "oneCell",
    });

    worksheet.addImage(imageId2, {
      tl: { col: 2, row: 0 }, // Imagen en celda B2
      br: { col: 4, row: 1 },
      editAs: "oneCell",
    });

    worksheet.addImage(imageId3, {
      tl: { col: 4, row: 0 }, // Imagen en celda C3
      br: { col: 8, row: 1 },
      editAs: "oneCell",
    });

    if (
      data[0][0] == "Supervisor" &&
      data[10][0] == "Total transferencia:" &&
      data[11][0] == "Nro"
    ) {
      data[11].forEach((element, index) => {
        worksheet.getRow(5).getCell(index + 1).value = element;
      });
      let count = 1;

      while (data[count + 11] != undefined) {
        if (data[count + 11][11] == "GNL") {
          data[count + 11].forEach((element, index) => {
            worksheet.getRow(5 + count).getCell(index + 1).value = element;
          });
        }

        count += 1;
      }

      // Agregar datos adicionales a otras celdas
      AdjustColumnWidth(worksheet);
      // Generar y descargar el archivo Excel
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      let nowdate =
        new Date().toLocaleDateString() + "-" + new Date().toLocaleTimeString();

      Notificar(
        "Se ha procesado correctamente el archivo, descargando archivo",
        "success",
        "normal"
      );

      saveAs(blob, "Prueba de encabezado-" + nowdate + "xlsx");
    } else {
      Notificar(
        "El documento de excel no coincide con el formato de exportación",
        "error",
        "normal"
      );
    }
  };

  return (
    <>
      {/* Header */}

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
          <a href="/" className="btn btn-success fw-bold btn-lg">
            Regresar
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="d-flex  min-vh-100 flex-column flex-grow-1 bg-black row  bg-opacity-25 ">
        <div className="hero   text-white text-center">
          <div className="container">
            <div className="row px-4 ">
              <h1 className="fw-bold pt-3">
                <span className="fs-3">Insertar cabecera al reporte</span>{" "}
                <i className="fa-regular fa-file-excel fs-1"></i>
              </h1>

              <input
                className="col p-4 rounded-4 btn hover-b fs-2 m-2"
                onChange={(event) => LeerExcel(event.target.files[0])}
                type="file"
                accept=".xlsx"
              />
            </div>
            <br />
            <div className="row px-4 ">
              <h1 className="fw-bold">
                <span className="fs-3">Corregir tipo de vehiculo GNL</span>{" "}
                <i className="fa-regular fa-file-excel fs-1"></i>
              </h1>
              <br />
              <input
                type="date"
                className="col p-4 rounded-4 btn hover-b fs-2 m-2"
                onChange={(event) => {
                  const date = new Date(event.target.value);
                  setSelectedDate(date); // Update selected date
                }}
              />
              <input
                className="col p-4 rounded-4 btn hover-b fs-2 m-2"
                onChange={(event) =>
                  manejarArchivoReemplazo(event.target.files[0])
                }
                type="file"
                accept=".xlsx"
                disabled={!selectedDate} // Disable if no date is selected
              />
            </div>
            <br />
            <div className="row px-4 ">
              <h1 className="fw-bold">
                <span className="fs-3">Comparar Supply contra TMS</span>{" "}
                <i className="fa-regular fa-file-excel fs-1"></i>
              </h1>
              <br />
              <a
                type="date"
                className="col p-4 rounded-4 btn hover-b fs-2 m-2"
                href="/compare"
              >
                Abrir pestaña
              </a>
            </div>

            <div className="cta-buttons mt-4"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
    </>
  );
};

export default Tools;
