import React, { useState, useEffect } from "react";
import { variables, Notificar } from "./funciones";
import * as ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { numberToDate } from "xlsx-populate/lib/dateConverter";
import logo from "./assets/images/logo-supply.png";
const Compare = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10); // Number of items per page
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [freeText, setFreeText] = useState("");
  const [dataExcel1, setExcel1] = useState([]);
  const [dataExcel2, setExcel2] = useState([]);
  const [filteredExcel, setFilteredExcel] = useState([]);
  const [isExcelLoaded, setIsExcelLoaded] = useState(false);
  const [FechaSupplyInicio, setFechaSupplyInicio] = useState(0);
  const [FechaSupplyFin, setFechaSupplyFin] = useState(0);

  const [HoraSupplyInicio, setHoraSupplyInicio] = useState("");
  const [HoraSupplyFin, setHoraSupplyFin] = useState("");

  const columnNames = [
    "Estado",
    "Nro",
    "Estado",
    "Dep.",
    "Fecha",
    "Or. o Dest.",
    "Placa",
    "Remolque",
    "Tipo de Vehiculo",
    "Transportadora",
    "Tipo de Operación",
    "Estimado Arribo",
    "Fecha y Hora Arribo",
    "Estado Arribo",
    "Estimado Ingreso",
    "Fecha y Hora Ingreso",
    "Estado Ingreso",
    "Estimado Ubicación",
    "Fecha y Hora Ubicación",
    "Estado Ubicación",
    "Estimado Inicio",
    "Fecha y Hora Inicio",
    "Estado Inicio",
    "Estimado Fin",
    "Fecha y Hora Fin",
    "Estado Fin",
    "Estimado Verificación",
    "Fecha y Hora Verificación",
    "Estado Verificación",
    "Estimado Salida",
    "Fecha y Hora Salida",
    "Estado Salida",
    "Nro. Aux.",
    "Cêdula Auxiliar1",
    "Auxiliar1",
    "Cêdula Auxiliar2",
    "Auxiliar2",
    "Cêdula Auxiliar3",
    "Auxiliar3",
    "Cêdula Auxiliar4",
    "Auxiliar4",
    "Cêdula Auxiliar5",
    "Auxiliar5",
    "Cêdula Auxiliar6",
    "Auxiliar6",
    "Cêdula Auxiliar7",
    "Auxiliar7",
    "Cêdula Auxiliar8",
    "Auxiliar8",
    "Cêdula Auxiliar9",
    "Auxiliar9",
    "Cêdula Auxiliar10",
    "Auxiliar10",
    "Cêdula Auxiliar11",
    "Auxiliar11",
    "Cêdula Auxiliar12",
    "Auxiliar12",
    "Contenido",
    "Nro. De Remisión",
    "Tipo Recibo",
    "Costo",
    "IVA",
    "Unidad",
    "Cant. S/R",
    "Cant. Faltante",
    "Unid. Contadas",
    "Cant. Averiadas",
    "Estado de Sellos",
    "Arrume",
    "Amarre de Carga",
    "Observaciones",
    "Pago por recurso",
    "Responsable Cierre Fase 2",
    "Responsable Cierre Fase 3",
    "Responsable Cierre Fase 4",
    "Responsable Cierre Fase 5",
    "Responsable Cierre Fase 6",
    "Responsable Cierre Fase 7",
    "Estado Cliente",
    "Documento Equivalente",
    "Email conductor",
    "Recibí De",
    "Cedula De",
    "Referencia",
    "Proveedor/Cliente",
    "Clasificación Operación",
  ];

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const goToJumpPage = () => {
    const newPage = currentPage + 30;
    if (newPage <= totalPages) {
      setCurrentPage(newPage);
    } else {
      setCurrentPage(totalPages); // Jump to the last page if it exceeds total pages
    }
  };

  const goToJumpBackPage = () => {
    const newPage = currentPage - 30;
    if (newPage >= 1) {
      setCurrentPage(newPage);
    } else {
      setCurrentPage(1); // Jump to the first page if it goes below 1
    }
  };

  // Calculate the range of pages to display
  const maxButtons = 10;
  const halfMaxButtons = Math.floor(maxButtons / 2);
  let startPage = Math.max(1, currentPage - halfMaxButtons);
  let endPage = Math.min(totalPages, currentPage + halfMaxButtons);

  if (endPage - startPage < maxButtons - 1) {
    if (startPage === 1) {
      endPage = Math.min(maxButtons, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - maxButtons + 1);
    }
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  useEffect(() => {}, [indexOfFirstPost, indexOfLastPost]);

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
      (jsonData[1][0] == "Supervisor:",
      jsonData[2][0] == "Cliente:",
      jsonData[3][0] == "Planta:",
      jsonData[4][0] == "Fecha Desde-Hasta:")
    ) {
      Notificar(
        "Correcto, Hoja SupplyLogistics Software aceptada",
        "success",
        "normal"
      );

      let cutJson = jsonData.slice(12, jsonData.length);

      let row2 = [];
      for (let i = 0; i < cutJson.length; i++) {
        row2[i] = cutJson[i][5].toUpperCase();
      }

      setFechaSupplyFin(cutJson[cutJson.length - 1][3]);
      setFechaSupplyInicio(cutJson[0][3]);

      setHoraSupplyFin(cutJson[cutJson.length - 1][3]);
      setHoraSupplyInicio(cutJson[0][3]);

      for (let i = 0; i < cutJson.length; i++) {
        cutJson[i][5] = row2[i];
      }

      setExcel1(cutJson);
    }

    if (
      (jsonData[0][0] == "TipoOperacion",
      jsonData[0][1] == "BodegaDespacho",
      jsonData[0][2] == "Estado Conso",
      jsonData[0][3] == "Conso")
    ) {
      if (FechaSupplyFin != "" && FechaSupplyInicio != "") {
        Notificar("Correcto, Hoja TMS aceptada", "success", "normal");

        let cutJson = []; //Legth son mas de 35k registros, filtrar fecha en el futuro.
        let count = 0;

        for (let i = 0; i < jsonData.length; i++) {
          if (
            jsonData[i][7] >= FechaSupplyInicio &&
            jsonData[i][7] <= FechaSupplyFin
          ) {
            cutJson[count] = [
              jsonData[i][5].toUpperCase(),
              jsonData[i][0],
              jsonData[i][1],
              jsonData[i][7],
              jsonData[i][7],
              jsonData[i][15],
              "",
              "",
              "",
              "",
            ];
            count += 1;
          }
        }

        count = 0;
        for (let i = 0; i < cutJson.length; i++) {
          const placa = cutJson[i][0];
          const fecha = cutJson[i][3];

          if (dataExcel1.find((item) => item[5] === placa)) {
            cutJson[i][6] = "Sí está";
          } else {
            cutJson[i][6] = "No está";
          }
        }

        setExcel2(cutJson);
      } else {
        Notificar(
          "Se requiere ingresar el archivo de We Supply",
          "error",
          "normal"
        );
      }
    }
  };

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

  const filteredRows2 = isExcelLoaded
    ? dataExcel2.filter((row) =>
        row.some((cell) => cell.toString().includes(searchTerm2))
      )
    : [];

  function ExcelDateToJSDate(date) {
    let fecha = new Date(
      Math.round((date - 25569) * 86400 * 1000)
    ).toLocaleDateString();
    return fecha.toString();
  }
  function ExcelDateToJSTime(date) {
    let fecha = new Date(
      Math.round((date - 25569) * 86400 * 1000)
    ).toLocaleTimeString();
    return fecha.toString();
  }

  const generateThirdTable = () => {
    if (!isExcelLoaded || !dataExcel1.length || !dataExcel2.length) return [];

    // Create a dictionary to store the status of each placa
    const placaStatus = {};
    dataExcel2.forEach((row) => {
      placaStatus[row[0]] = row[6]; // Store the status of each placa
    });

    // Extend the records of dataExcel1
    const thirdTable = dataExcel1.map((row) => {
      const extendedRow = [placaStatus[row[5]] || "No está"]; // Put the status of the placa in the first column
      extendedRow.push(...row); // Copy the original row
      for (let i = extendedRow.length; i < 86; i++) {
        extendedRow.push(""); // Add empty columns
      }
      return extendedRow;
    });

    return thirdTable;
  };

  // Obtener los datos de la tercera tabla
  const thirdTableData = generateThirdTable();

  const dateColumns = [
    4, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30,
  ];

  for (let i = 0; i < thirdTableData.length; i++) {
    for (let e = 0; e < dateColumns.length; e++) {
      thirdTableData[i][dateColumns[e]] =
        ExcelDateToJSDate(thirdTableData[i][dateColumns[e]]) +
        " " +
        ExcelDateToJSTime(thirdTableData[i][dateColumns[e]]);
    }
  }
  const [searchTerm3, setSearchTerm3] = useState("");

  const filteredThirdTable = thirdTableData.filter((row) => {
    const rowValues = row.join(" ").toLowerCase();

    return rowValues.includes(searchTerm3.toLowerCase());
  });

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredThirdTable);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SUPPLY");
    XLSX.writeFile(
      wb,
      "TMS - Supply software - " + new Date().toLocaleDateString() + ".xlsx"
    );
  };

  // Identify the columns that contain date values

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
        <h2>Comparar documentos contables (TMS - We Supply Software)</h2>
        <div className="border-bottom my-3"></div>

        <div className="row">
          <div className="col-6 ">
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
                  De <span>{ExcelDateToJSDate(FechaSupplyInicio)}</span> a{" "}
                  <span>{ExcelDateToJSDate(FechaSupplyFin)}</span>
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
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Placa</th>
                    <th>Recibo</th>
                    <th>Area</th>
                    <th>Tipo vehiculo</th>
                    <th>Tipo operacion</th>
                    <th>Valor</th>
                    <th>IVA</th>
                    <th>Recaudo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {ExcelDateToJSDate(row[3]) +
                          " " +
                          ExcelDateToJSTime(row[3])}
                      </td>
                      <td>{row[5]}</td>
                      <td className={row[57] == null ? "bg-danger" : ""}>
                        {row[57]}
                      </td>
                      <td>{row[4]}</td>
                      <td>{row[7]}</td>
                      <td>{row[9]}</td>
                      <td>{row[59]}</td>
                      <td>{row[60]}</td>
                      <td>{row[8]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
            </div>
          </div>
          <div className="col-6 ">
            <h3>Adjuntar documento 2</h3>
            <input
              type="file"
              className="form-control col p-4 rounded-4 btn hover-b m-2"
              onChange={(event) => LeerExcel(event.target.files[0])}
            />

            {FechaSupplyFin != "" && FechaSupplyInicio != "" && (
              <div className="text-center">
                <br />
                <span className="fs-3">
                  De <span>{ExcelDateToJSDate(FechaSupplyInicio)}</span> a{" "}
                  <span>{ExcelDateToJSDate(FechaSupplyFin)}</span>
                </span>
                <p></p>

                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  className="form-control mb-3"
                  disabled={!isExcelLoaded} // Disable the input until Excel is loaded
                />
              </div>
            )}

            <div
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Placa</th>
                    <th>Fecha</th>
                    <th>Tipo vehiculo</th>
                    <th>Tipo operacion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows2.map((row, index) => (
                    <tr key={index}>
                      <td
                        className={
                          row[6] == "No está" ? "bg-noesta" : "bg-esta"
                        }
                      >
                        {row[6]}
                      </td>
                      <td className={row[0] == null ? "bg-danger" : ""}>
                        {row[0]}
                      </td>
                      <td>
                        {ExcelDateToJSDate(row[3]) +
                          " " +
                          ExcelDateToJSTime(row[3])}
                      </td>

                      <td>{row[5]}</td>
                      <td>{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
            </div>
          </div>

          <div className="col-12 mt-5">
            <span className="fs-3">
              Documendo (We Supply Software) comprobado{" "}
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

            <div
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    {Array.from({ length: 86 }, (_, index) => (
                      <th key={index}> {columnNames[index]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredThirdTable.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={
                            cellIndex === 0 && cell === "No está"
                              ? "bg-noesta"
                              : cellIndex === 0 && cell === "Sí está"
                              ? "bg-esta"
                              : ""
                          }
                        >
                          {dateColumns.includes(cellIndex) &&
                          typeof cell === "number"
                            ? ExcelDateToJSDate(cell) +
                              " " +
                              ExcelDateToJSTime(cell)
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p></p>

        <br />
      </div>
    </div>
  );
};

export default Compare;
