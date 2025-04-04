import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import { useState } from "react";

const Sqlvehicles = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const sqlInsertions = await generateSQLInsertions(file);
      if (sqlInsertions) {
        downloadSQLFile(sqlInsertions);
      }
    }
  };

  const generateSQLInsertions = async (file) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const buffer = e.target.result;
            await workbook.xlsx.load(buffer);
            const worksheet = workbook.worksheets[0];

            let sqlStatements = "";
            const timestamp = new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");

            // Conjunto para almacenar placas únicas
            const placasUnicas = new Set();

            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber > 1) {
                // Asumiendo que las columnas "placa" y "tipo" están en las columnas A (índice 1) y B (índice 2)
                const placa = row.getCell(1).value || "";
                const tipo = row.getCell(2).value || "";

                // Solo agregar consultas si la placa no está repetida y los datos son válidos
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
                  LTL379: "MULA",
                  LTL381: "MULA",
                  LTL382: "MULA",
                  LTL383: "MULA",
                };

                // Solo agregar consultas si la placa no está repetida y los datos son válidos
                if (placa && tipo && !placasUnicas.has(placa)) {
                  placasUnicas.add(placa); // Añadir la placa al conjunto

                  // Verificar si la placa está en reemplazosPlacas
                  const idTransportadora = reemplazosPlacas.hasOwnProperty(
                    placa
                  )
                    ? 1
                    : null;

                  sqlStatements += `INSERT INTO \`vehiculos\` (\`idVehiculo\`, \`placa\`, \`idTransportadora\`, \`tipo\`, \`createdAt\`, \`updatedAt\`) VALUES (NULL, '${placa}', ${idTransportadora}, '${tipo}', '${timestamp}', '${timestamp}');\n`;
                }
              }
            });

            resolve(sqlStatements);
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Error al procesar el archivo",
              text: error.message,
            });
            reject(error);
          }
        };

        reader.onerror = (error) => {
          Swal.fire({
            icon: "error",
            title: "Error al leer el archivo",
            text: error.message,
          });
          reject(error);
        };

        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error("Error generating SQL:", error);
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
        text: error.message,
      });
    }
  };

  const downloadSQLFile = (sqlContent) => {
    const blob = new Blob([sqlContent], { type: "text/sql" });
    saveAs(blob, "vehiculos_inserts.sql");
    Swal.fire({
      icon: "success",
      title: "Archivo SQL generado",
      text: "El archivo de inserciones se ha descargado correctamente.",
    });
  };

  return (
    <>
      <header className="bg-supply text-white row">
        <div className="vw-100 row">
          <div className="col-md-6">
            <nav className="container">
              <span className="logo fs-2">Herramienta de Generación SQL</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="d-flex flex-column flex-grow-1 bg-black row vh-100 bg-opacity-25">
        <div className="hero text-white text-center">
          <div className="container">
            <div className="row px-4">
              <h1 className="fw-bold">
                <span className="fs-3">Generar Inserciones SQL</span>{" "}
                <i className="fa-regular fa-file-excel fs-1"></i>
              </h1>
              <br />
              <input
                className="col p-4 rounded-4 btn hover-b fs-2 m-2"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Sqlvehicles;
