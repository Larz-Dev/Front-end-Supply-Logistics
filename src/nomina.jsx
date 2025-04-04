import React, { useState, useEffect } from "react";
import { variables, Notificar, Cargar } from "./funciones";
import * as ExcelJS from "exceljs";
import * as XLSX from "xlsx";

import { numberToDate } from "xlsx-populate/lib/dateConverter";
import logo from "./assets/images/logo-supply.png";

const Nomina = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10); // Number of items per page

  const [selectedOption, setSelectedOption] = useState("");
  const [freeText, setFreeText] = useState("");
  const [dataExcel1, setExcel1] = useState([]);

  const [filteredExcel, setFilteredExcel] = useState([]);
  const [isExcelLoaded, setIsExcelLoaded] = useState(false);
  const [FechaSupplyInicio, setFechaSupplyInicio] = useState(0);
  const [FechaSupplyFin, setFechaSupplyFin] = useState(0);
  const [UploadNom, setuploadNom] = useState([]);
  const [UploadNom2, setuploadNom2] = useState([]);
  const [readyUpload, setreadyUpload] = useState(0);
  const [readyUpload2, setreadyUpload2] = useState(0);
  const [columnNames, setcolumnNames] = useState([]);

  // Calculate the range of pages to display

  const LeerExcel = async (file, hoja) => {
    const data = await readExcel(file); // Ensure that readExcel returns the data
    const sheetNames = Object.keys(data.Sheets); // Get all sheet names as an array
    const sheetIndex = hoja; // Replace with the desired index

    if (sheetIndex < sheetNames.length) {
      const sheetName = sheetNames[sheetIndex]; // Get the sheet name at the specified index
      if (sheetIndex == 0) {
        await TranscribirExcel1(data.Sheets[sheetName]); // Access the sheet by its name
      }
      if (sheetIndex != 0) {
        await TranscribirExcel2(data.Sheets[sheetName]); // Access the sheet by its name
      }
      setIsExcelLoaded(true); // Set the state to true after loading the Excel
    } else {
      console.error(`Sheet index ${sheetIndex} does not exist.`);
    }
  };

  const TranscribirExcel1 = async (sheet) => {
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to JSON array
    let resultado = []; // Arreglo final que contiene las secciones separadas
    let seccionActual = []; // Arreglo temporal para almacenar la sección actual
    let Fila;
    jsonData.forEach((fila) => {
      Fila = fila[1] + "";

      if (Fila.includes("/") && Fila.includes("-")) {
        // Si encontramos "C.Costos." y la sección actual no está vacía, la guardamos
        if (seccionActual.length > 0) {
          resultado.push(removeZerosAndNulls(seccionActual));

          seccionActual = []; // Reiniciamos para la próxima sección
        }
      }

      // Agregamos la fila actual a la sección actual
      seccionActual.push(fila);
    });

    // Guardamos la última sección si hay datos pendientes
    if (seccionActual.length > 0) {
      resultado.push(removeZerosAndNulls(seccionActual));
    }
    let nomPapeles = [];
    for (let e = 0; e < resultado.length; e++) {
      if (String(resultado[e][1][1]).includes("PAPELES NACIONALES")) {
        nomPapeles[e] = resultado[e].flat();
      }
    }
    let nominaPapeles = nomPapeles.filter((elemento) => elemento !== undefined);

    nominaPapeles[nominaPapeles.length - 1] = nominaPapeles[
      nominaPapeles.length - 1
    ].slice(1, nominaPapeles[nominaPapeles.length - 1].length - 4);
    let lastNom = [];
    nominaPapeles.forEach((element, index) => {
      if (index < nominaPapeles.length - 1) {
        lastNom[index] = element.slice(1, element.length);
      } else {
        lastNom[index] = element;
      }
    });

    setuploadNom(lastNom);
    setreadyUpload(1);
    setIsExcelLoaded(true);
  };
  const TranscribirExcel2 = async (sheet) => {
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

    const arregloProcesado = jsonData.filter(row => row[0] !== null && row[0] !== "" && row[0] !== undefined);
      

    setreadyUpload2(1);
    setuploadNom2(arregloProcesado);
  };

  function removeZerosAndNulls(array) {
    return array.map((subArray, index) => {
      return subArray.filter((element, i) => {
        return (
          element !== 0 && // Remove 0
          element !== null && // Remove null
          !(typeof element === "string" && element.match(/^000\d{2}$/)) // Remove codes starting with "000"
        );
      });
    });
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

  // Identify the columns that contain date values
  const UploadPreNomPost = async () => {
    const filtro = UploadNom.map((fila) => {
      return fila.filter((elemento) => {
        return (
          elemento !== 0 && // Remove 0
          elemento !== null && // Remove null
          !(typeof elemento === "string" && elemento.match(/^000\d{2}$/)) && // Remove codes starting with "000"
          !(typeof elemento === "string" && /^\d$/.test(elemento)) // Remove strings de un solo dígito
        );
      });
    });
    console.log(filtro);
    try {
      let response = await fetch(variables("API") + "/prenom/update", {
        method: "PUT", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(filtro),
      });

      if (response.ok) {
        Notificar(
          "La pre-nómina se ha actualizado correctamente",
          "success",
          "normal"
        );
      } else {
        Notificar(
          `Ha ocurrido un error al actualizar la pre-nómina`,
          "error",
          "normal"
        );
      }
    } catch (error) {
      Notificar(
        "Ha ocurrido un error al actualizar la pre-nómina, compruebe su conexión a internet",
        "error",
        "normal"
      );
    }
  };

  const UploadNomPost = async () => {
    try {
      let response = await fetch(variables("API") + "/nom/update", {
        method: "PUT", // Specify the method if needed (GET is default)
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`, // Include the token in the Authorization header
        },
        body: JSON.stringify(UploadNom2),
      });

      if (response.ok) {
        Notificar(
          "La pre-nómina se ha actualizado correctamente",
          "success",
          "normal"
        );
      } else {
        Notificar(
          `Ha ocurrido un error al actualizar la pre-nómina`,
          "error",
          "normal"
        );
      }
    } catch (error) {
      Notificar(
        "Ha ocurrido un error al actualizar la pre-nómina, compruebe su conexión a internet",
        "error",
        "normal"
      );
    }
  };

  return (
    <div className="col m-3">
      <div>
        <div className="row">
          <div className="col-4"></div>
          <div className="col-4 text-center">
            <p></p>
            <h3>
              <strong className="badge bg-supply">Actualizar pre-nómina</strong>
            </h3>
          </div>
          <div className="col-4"></div>
        </div>

        <div className=" text-justify mx-5">
          <h5 className="fw-bold just">Instrucciones:</h5>

          <div className="justificar ">
            Al recibir el archivo .xlsx de pre-nómina que es enviado por correo,
            debe colocarlo en el siguiente formulario, y seguidamente presionar
            el botón "Subir pre-nómina a la nube", esto actualizará la
            pre-nómina en la base de datos, descartando la anterior.
          </div>
        </div>

        <div className="border-bottom my-3"></div>

        <div className="row mx-4">
          <h3>Adjuntar documento</h3>

          <input
            type="file"
            className="form-control col  p-4 rounded-4 btn hover-b m-2"
            onChange={(event) => LeerExcel(event.target.files[0], 0)}
          />

          <p></p>
          <div>
            {readyUpload == 1 && (
              <div>
                <button
                  className="form-control col p-1 rounded-4 btn-success btn fs-3 fw-bold"
                  onClick={(event) => UploadPreNomPost()}
                >
                  Subir pre-nómina a la nube{" "}
                  <i className="fa-solid fa-cloud "> </i>
                </button>
              </div>
            )}
          </div>
        </div>

        <p></p>

        <br />
      </div>
      <div>
        <div className="row">
          <div className="col-4"></div>
          <div className="col-4 text-center">
            <p></p>
            <h3>
              <strong className="badge bg-supply">Actualizar nómina</strong>
            </h3>
          </div>
          <div className="col-4"></div>
        </div>

        <div className=" text-justify mx-5">
          <h5 className="fw-bold just">Instrucciones:</h5>

          <div className="justificar ">
            Al recibir el archivo .xlsx de pre-nómina que es enviado por correo,
            debe colocarlo en el siguiente formulario, y seguidamente presionar
            el botón "Subir nómina a la nube", esto actualizará la nómina en la
            base de datos, descartando la anterior.
          </div>
        </div>

        <div className="border-bottom my-3"></div>

        <div className="row mx-4">
          <h3>Adjuntar documento</h3>

          <input
            type="file"
            className="form-control col  p-4 rounded-4 btn hover-b m-2"
            onChange={(event) => LeerExcel(event.target.files[0], 9)}
          />

          <p></p>
          <div>
            {readyUpload2 == 1 && (
              <div>
                <button
                  className="form-control col p-1 rounded-4 btn-success btn fs-3 fw-bold"
                  onClick={(event) => UploadNomPost()}
                >
                  Subir nómina a la nube <i className="fa-solid fa-cloud "> </i>
                </button>
              </div>
            )}
          </div>
        </div>

        <p></p>

        <br />
      </div>
    </div>
  );
};

export default Nomina;
