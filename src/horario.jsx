import React, { useState, useEffect } from "react";
import { variables, Notificar, Cargar } from "./funciones";
import * as ExcelJS from "exceljs";
import * as XLSX from "xlsx";

import { numberToDate } from "xlsx-populate/lib/dateConverter";
import logo from "./assets/images/logo-supply.png";

const Horario = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10); // Number of items per page
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [freeText, setFreeText] = useState("");
  const [dataExcel1, setExcel1] = useState([]);

  const [filteredExcel, setFilteredExcel] = useState([]);
  const [isExcelLoaded, setIsExcelLoaded] = useState(false);
  const [FechaSupplyInicio, setFechaSupplyInicio] = useState(0);
  const [FechaSupplyFin, setFechaSupplyFin] = useState(0);

  const [HoraSupplyInicio, setHoraSupplyInicio] = useState("");
  const [HoraSupplyFin, setHoraSupplyFin] = useState("");
  const [columnNames, setcolumnNames] = useState([]);

  // Calculate the range of pages to display

  const LeerExcel = async (file) => {
    const data = await readExcel(file); // Ensure that readExcel returns the data
    const sheetNames = Object.keys(data.Sheets); // Get all sheet names as an array
    const sheetIndex = 0; // Replace with the desired index

    if (sheetIndex < sheetNames.length) {
      const sheetName = sheetNames[sheetIndex]; // Get the sheet name at the specified index
      await TranscribirExcel(data.Sheets[sheetName]); // Access the sheet by its name
      setIsExcelLoaded(true); // Set the state to true after loading the Excel
    } else {
      console.error(`Sheet index ${sheetIndex} does not exist.`);
    }
  };

  const TranscribirExcel = async (sheet) => {
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON array

    if (
      (jsonData[0][0] == "CODIGO",
      jsonData[0][1] == "NOMBRE",
      jsonData[0][2] == "HORA INGRESO")
    ) {
      Notificar(
        "Correcto, Planilla de We Supply aceptada",
        "success",
        "normal"
      );
      Cargar(true);
      let cutJson = jsonData.slice(1, jsonData.length);

      setExcel1(cutJson);
      Cargar(false);
    }

    if (
      (jsonData[0][0] == "QR",
      jsonData[0][1] == "Operación",
      jsonData[0][2] == "Company")
    ) {
      if (FechaSupplyFin != "" && FechaSupplyInicio != "") {
        Notificar("Correcto, Hoja de horario aceptada", "success", "normal");
        Cargar(true);
        let cutJson = []; // Array to store filtered rows
        let count = 0; // Optional: Count of filtered rows

        const estado = "Estado";
        const newColumnNames = [estado, ...jsonData[0]];
        setcolumnNames(newColumnNames);

        for (let i = 0; i < jsonData.length; i++) {
          //  console.log(        StringDateToExcelDate(FechaSupplyInicio) + " > " + jsonData[i][44] + " < " +  StringDateToExcelDate(FechaSupplyFin)  );

          if (
            (jsonData[i][44] >= StringDateToExcelDate(FechaSupplyInicio) &&
              jsonData[i][44] <= StringDateToExcelDate(FechaSupplyFin)) ||
            (jsonData[i][22] >= StringDateToExcelDate(FechaSupplyInicio) &&
              jsonData[i][22] <= StringDateToExcelDate(FechaSupplyFin))
          ) {
            // Push the entire row into cutJson
            cutJson.push(jsonData[i]);
          }
        }

        count = 0;

        for (let i = 0; i < cutJson.length; i++) {
          const placa = cutJson[i][5];

          for (let e = 0; e < dataExcel1.length; e++) {
            if (
              placa
                .toLowerCase()
                .replace("-", "")
                .replace(" ", "")
                .includes(
                  dataExcel1[e][3]
                    .toLowerCase()
                    .replace("-", "")
                    .replace(" ", "")
                )
            ) {
              cutJson[i][48] = "Sí está";
            }

            if (cutJson[i][48] == null) {
              let errores = esPrediccion(placa, dataExcel1[e][3]);

              if (errores == 0) {
                errores = esPermutacion(placa, dataExcel1[e][3]);
              }

              if (errores >= 1) {
                cutJson[i][48] =
                  "Posible error de placa: " + dataExcel1[e][3] + " > " + placa;
              }
            }
          }
        }
      } else {
        Notificar(
          "Se requiere ingresar el archivo de We Supply",
          "error",
          "normal"
        );
      }
    }
  };

  function esPermutacion(placa1, placa2) {
    let diferencias = 0;
    // Validación de que las placas tienen la misma longitud
    if (placa1.length !== placa2.length) {
      return false;
    }

    // Validación de que las placas tienen los mismos caracteres pero en diferente orden
    const placa1Ordenada = placa1.split("").sort().join("");
    const placa2Ordenada = placa2.split("").sort().join("");
    if (placa1Ordenada === placa2Ordenada) {
      diferencias = 1;
    }
    return diferencias;
  }

  function esPrediccion(placa1, placa2) {
    let diferencias = 0;
    for (let i = 0; i < placa1.length; i++) {
      if (placa1[i] !== placa2[i]) {
        diferencias++;
        if (diferencias > 1) {
          return false;
        }
      }
    }
    return diferencias === 1;
  }

  const TransformStringDate = (StringDate) => {
    // Define the datetime format
    const datetimeFormat = "dd/MM/yyyy hh:mm:ss a";

    // Parse the datetime string
    const dateParts = StringDate.split(" ");
    const date = dateParts[0].split("/");
    const time = dateParts[1].split(":");
    const ampm = dateParts[2];

    // Create a new Date object
    const year = parseInt(date[2]);
    const month = parseInt(date[1]) - 1; // Months are 0-based in JavaScript
    const day = parseInt(date[0]);
    let hour = parseInt(time[0]);
    const minute = parseInt(time[1]);
    const second = parseInt(time[2]);

    // Adjust the hour based on AM/PM
    if (ampm === "p. m." && hour !== 12) {
      hour += 12;
    } else if (ampm === "a. m." && hour === 12) {
      hour = 0;
    }

    // Create the Date object
    const dateObject = new Date(year, month, day, hour, minute, second);

    return dateObject;
  };

  const readExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        resolve(workbook);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRows = isExcelLoaded
    ? dataExcel1.filter((row) =>
        row.some((cell) => cell.toString().includes(searchTerm))
      )
    : [];

  function ExcelDateToJSDate(date) {
    let fecha = new Date(Math.round((date - 25569) * 86400 * 1000));
    let result =
      fecha.getUTCDate() +
      "/" +
      (fecha.getUTCMonth() + 1) +
      "/" +
      fecha.getUTCFullYear();
    return isNaN(fecha.getTime()) ? "" : result;
  }

  function ExcelDateToJSTime(date) {
    let hora = new Date(Math.round((date - 25569) * 86400 * 1000));
    let result =
      hora.getUTCHours() +
      ":" +
      hora.getUTCMinutes() +
      ":" +
      hora.getUTCSeconds();
    return isNaN(hora.getTime()) ? "" : result;
  }

  const generateThirdTable = () => {
    if (!isExcelLoaded || !dataExcel1.length) return [];

    // Crear un diccionario para almacenar el estado de cada placa

    // Extender los registros de dataExcel1 y intercambiar la primera y última columna
    const thirdTable = []

      .map((row) => {
        // Agregar condicionales aquí

        if (
          (row[4] == "PT" ||
            row[4] == "MP" ||
            row[4] == "GR" ||
            row[4] == "EM" ||
            row[4] == "PC") &&
          (row[1] == "CARGUE PT NACIONAL" ||
            row[1] == "DESCARGUE ESTIBAS" ||
            row[1] == "CARGUE BIOPACOL" ||
            row[1] == "DESCARGUE BIOPACOL" ||
            row[1] == "DESCARGUE EMPAQUE" ||
            row[1] == "DESCARGUE MP" ||
            row[1] == "DESCARGUE PULPA" ||
            row[1] == "DESCARGUE DEVOLUCIONES" ||
            row[1] == "CARGUE DESPERDICIO MADERA")
        ) {
          const extendedRow = [row[48], ...row]; // Copiar la fila original
          for (let i = extendedRow.length; i < 48; i++) {
            extendedRow.push(""); // Agregar columnas vacías si es necesario
          }

          return extendedRow;
        } else {
          // Si no se cumple la condición, devuelve null o un valor vacío
          return null;
        }
      })
      .filter((row) => row !== null); // Eliminar filas vacías
    Cargar(false);
    return thirdTable;
  };

  // Obtener los datos de la tercera tabla
  const thirdTableData = generateThirdTable();

  const dateColumns = [16, 20, 24, 25, 26, 28, 29, 31, 45];

  for (let i = 0; i < thirdTableData.length; i++) {
    for (let e = 0; e < dateColumns.length; e++) {
      if (
        ExcelDateToJSDate(thirdTableData[i][dateColumns[e]]).includes(
          "Invalid "
        )
      ) {
        thirdTableData[i][dateColumns[e]] = "";
      } else {
        thirdTableData[i][dateColumns[e]] =
          ExcelDateToJSDate(thirdTableData[i][dateColumns[e]]) +
          " " +
          ExcelDateToJSTime(thirdTableData[i][dateColumns[e]]);
      }
    }
  }

  const [searchTerm3, setSearchTerm3] = useState("");

  const filteredThirdTable = thirdTableData.filter((row) => {
    const rowValues = row.join(" ").toLowerCase();

    return rowValues.includes(searchTerm3.toLowerCase());
  });

  const handleDownloadExcel = async () => {
    Cargar(true);
    const filteredData = filteredThirdTable.map((row) => {
      const newRow = [...row];
      delete newRow[49]; // Eliminar la columna 49
      return newRow;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("SUPPLY");

    // Add column names as the first row
    worksheet.addRow(columnNames);

    // Add data
    worksheet.addRows(filteredData);

    // Aplicar colores a la primera columna
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Ignorar la primera fila (columnas)
        const cell = row.getCell(1); // Obtener la primera columna
        const value = cell.value;

        if (value === "No está") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1F1F" }, // Color de fondo para "No está"
          };
          cell.font = {
            bold: true, // Negrita
          };
        } else if (value === "Sí está") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "19BC0F" }, // Color de fondo para "Sí está"
          };
          cell.font = {
            bold: true, // Negrita
          };
        } else if (value === "Predicción") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD33D" }, // Color de fondo para "Predicción"
          };
          cell.font = {
            bold: true, // Negrita
          };
        } else if (value.includes("Posible error de placa")) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1F1F" }, // Color de fondo para "Posible error de placa"
          };
          cell.font = {
            bold: true, // Negrita
          };
        }
      }
    });

    // Autoajustar el tamaño de las columnas
    const columnLengths = [];
    for (let i = 0; i < filteredData[0].length; i++) {
      let maxLength = 0;
      for (let j = 0; j < filteredData.length; j++) {
        const cellValue = filteredData[j][i];
        const cellLength = cellValue?.toString().length;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      }
      columnLengths.push(maxLength);
    }

    for (let i = 0; i < columnLengths.length; i++) {
      worksheet.getColumn(i + 1).width =
        columnLengths[i] < 10 ? 10 : columnLengths[i] + 2;
    }

    worksheet.autoFilter = {
      from: "A1",
      to: `${String.fromCharCode(65 + columnNames.length - 1)}${
        filteredData.length + 1
      }`,
      filters: columnNames.map((columnName, columnIndex) => ({
        column: columnIndex + 1,
        criteria: null,
      })),
    };

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a blob from the buffer
    const data = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create a URL for the blob
    const url = URL.createObjectURL(data);

    // Create an anchor element to download the file
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "Aplicativo SENA - Supply vs TMS - " +
      ExcelDateToJSDate(StringDateToExcelDate(FechaSupplyInicio)) +
      " - " +
      ExcelDateToJSDate(StringDateToExcelDate(FechaSupplyFin)) +
      ".xlsx";
    a.click();
    Cargar(false);
  };
  // Identify the columns that contain date values

  function StringDateToExcelDate(dateString) {
    // Parse the date string into a JavaScript Date object
    const dateParts = dateString.split(" ");
    const date = dateParts[0].split("-");
    const time = dateParts[1].split(":");

    // Create a new Date object
    const jsDate = new Date(
      Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2])
    );

    // Convert the JavaScript Date object to an Excel date number
    const excelDate = jsDate.getTime() / (1000 * 60 * 60 * 24) + 25569;

    return excelDate;
  }

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
          <a href="/tools" className="btn btn-success fw-bold btn-lg">
            Regresar
          </a>
        </div>
      </header>

      <div className="col m-3">
        <div className="row">
          <div className="col-4"></div>
          <div className="col-4 text-center">
            <h3>
              <p>Comparar documentos contables</p>
              (TMS - We Supply Software)
            </h3>
          </div>
          <div className="col-4">
            <div className="text-end mx-5">
              <a className="linkgris fs-6" href="https://github.com/Larz-Dev">
                Desarrollado por Larz-Dev{" "}
                <i className="fa-brands fa-github"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="border-bottom my-3"></div>

        <div className="row">
          <div className="col-12 ">
            <h3>Adjuntar documento 1 </h3>
            <input
              type="file"
              className="form-control col p-4 rounded-4 btn hover-b m-2"
              onChange={(event) => LeerExcel(event.target.files[0])}
            />

            {FechaSupplyFin != "" && FechaSupplyInicio != "" && (
              <div className="text-center">
                <br />
                <span className="fs-3">
                  De{" "}
                  <span>
                    {ExcelDateToJSDate(
                      StringDateToExcelDate(FechaSupplyInicio)
                    )}
                  </span>{" "}
                  a{" "}
                  <span>
                    {ExcelDateToJSDate(StringDateToExcelDate(FechaSupplyFin))}
                  </span>
                </span>
                <p></p>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control mb-3"
                  disabled={!isExcelLoaded} // Disable the input until Excel is loaded
                />
              </div>
            )}

            <div
              style={{
                maxHeight: "700px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th className="bg-supply border-0 text-white">Codigo</th>
                    <th className="bg-supply border-0 text-white">Nombre</th>
                    <th className="bg-supply border-0 text-white">
                      Hora ingreso
                    </th>

                    <th className="bg-supply border-0 text-white">
                      Hora Salida
                    </th>
                    <th className="bg-supply border-0 text-white">Refuerso</th>
                    <th className="bg-supply border-0 text-white">Cargo</th>
                    <th className="bg-supply border-0 text-white">
                      Observación
                    </th>
                    <th className="bg-supply border-0 text-white">Turno</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{ExcelDateToJSTime(row[2])}</td>
                      <td>{ExcelDateToJSTime(row[2])}</td>
                      <td className={row[4] != null ? " bg-warning" : ""}>
                        {row[4]}
                      </td>
                      <td>{row[5]}</td>
                      <td>{row[6]}</td>
                      <td>{row[7]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
            </div>
          </div>

          <div className="col-12 mt-5">
            <span className="fs-3">
              Documendo (TMS) Filtrado (We Supply){" "}
              <button
                className="btn btn-success text-white fw-bold fs-3"
                onClick={handleDownloadExcel}
                disabled={!isExcelLoaded} // Disable the button until Excel is loaded
              >
                Descargar como Excel -{" "}
                <i className="fa-regular fa-file-excel "> </i>
              </button>
            </span>
            <br />
            <br />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm3}
              onChange={(e) => setSearchTerm3(e.target.value)}
              className="form-control mb-3"
              disabled={!isExcelLoaded} // Disable the input until Excel is loaded
            />
          </div>
        </div>

        <p></p>

        <br />
      </div>
    </div>
  );
};

export default Horario;
