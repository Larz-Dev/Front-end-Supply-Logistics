import React, { useEffect, useState } from "react";
import Cabecera from "./cabecera";
import Sidebar from "./sidebar";
import { variables, Notificar } from "./funciones";
import Chart from "react-apexcharts";

const Graficas = () => {
  const Meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "bar", height: 350 },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        horizontal: true,
      },
    },
    dataLabels: {
      total: { enabled: true, style: { fontSize: "13px", fontWeight: 900 } },
    },
    colors: ["#7BDDFF", "#FFC53F", "#00158B"],
    xaxis: { categories: [] },
  });

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Restar un día
    setSelectedDate(yesterday); // Establecer la fecha del día anterior
  }, []);

  const [chartSeries, setChartSeries] = useState([
    { name: "Turno 1", data: [] },
    { name: "Turno 2", data: [] },
    { name: "Turno 3", data: [] },
  ]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyChartOptions, setDailyChartOptions] = useState({
    chart: { type: "line", height: 350 },
    xaxis: { categories: [] },
    colors: ["#7BDDFF", "#FFC53F", "#00158B"],
  });

  const [dailyChartSeries, setDailyChartSeries] = useState([
    { name: "Turno 1", data: [] },
    { name: "Turno 2", data: [] },
    { name: "Turno 3", data: [] },
  ]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await fetch(variables("API") + "/graphs/turnAverage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({ mes: null, anio: null }), // Para obtener datos de todos los meses
        });

        const jdata = await response.json();

        if (jdata.status === "success") {
          const categories = jdata.empleados.map(
            (empleado) => `${Meses[empleado.mes-1]} ${empleado.anio}`
          );
          const turno1Data = jdata.empleados.map((empleado) =>
            parseFloat(empleado.turno_1)
          );
          const turno2Data = jdata.empleados.map((empleado) =>
            parseFloat(empleado.turno_2)
          );
          const turno3Data = jdata.empleados.map((empleado) =>
            parseFloat(empleado.turno_3)
          );

          setChartOptions((prev) => ({
            ...prev,
            xaxis: { categories },
          }));

          setChartSeries([
            { name: "Turno 1", data: turno1Data },
            { name: "Turno 2", data: turno2Data },
            { name: "Turno 3", data: turno3Data },
          ]);
        } else {
          Notificar(
            jdata.mensaje || "No se ha podido cargar los datos",
            jdata.status || "error",
            "normal"
          );
        }
      } catch (error) {
        Notificar(
          "Ha ocurrido un error al cargar los datos",
          "error",
          "normal"
        );
      }
    };

    fetchMonthlyData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const fetchDailyData = async () => {
        try {
          const response = await fetch(
            variables("API") + "/graphs/turnAverage",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },

              body: JSON.stringify({
                mes: selectedDate.getUTCMonth() + 1, // Los meses en JavaScript van de 0 a 11
                anio: selectedDate.getUTCFullYear(),
                dia: selectedDate.getUTCDate(),
              }),
            }
          );

          const jdata = await response.json();

          if (jdata.status === "success") {
            const categories = jdata.dias.map((dia) => `Día ${dia.dia}`);
            const turno1Data = jdata.dias.map((dia) => parseFloat(dia.turno_1));
            const turno2Data = jdata.dias.map((dia) => parseFloat(dia.turno_2));
            const turno3Data = jdata.dias.map((dia) => parseFloat(dia.turno_3));

            setDailyChartOptions((prev) => ({
              ...prev,
              xaxis: { categories },
            }));

            setDailyChartSeries([
              { name: "Turno 1", data: turno1Data },
              { name: "Turno 2", data: turno2Data },
              { name: "Turno 3", data: turno3Data },
            ]);
          } else {
            Notificar(
              jdata.mensaje || "No se ha podido cargar los datos",
              jdata.status || "error",
              "normal"
            );
          }
        } catch (error) {
          Notificar(
            "Ha ocurrido un error al cargar los datos diarios",
            "error",
            "normal"
          );
        }
      };

      fetchDailyData();
    }
  }, [selectedDate]);

  return (
    <div className="row">
      <Cabecera />
      <div className="col-md-3 d-flex flex-column p-3 bg-light">
        <Sidebar />
      </div>

      <div
        className="col-md-9 p-3"
        style={{
          maxHeight: "1000px",
          height: "100vh",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <br />

        <br />
        {selectedDate && (
          <>
            <div className="d-inline d-flex">
              {" "}
              <h1>Rendimiento Diario</h1>{" "}
               <input
                className=" fs-3 px-5 mx-3 bg-body-secondary rounded-3"
                type="date"
                value={
                  selectedDate ? selectedDate.toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  setSelectedDate(new Date(e.target.value));
                }}
              />
            </div>

            <div className="p-3">
              <Chart
                options={dailyChartOptions}
                series={dailyChartSeries}
                type="bar"
                height={400}
              />
            </div>
          </>
        )}

        <br />
        <h1>Rendimiento Mensual</h1>

        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={400}
        />
      </div>
    </div>
  );
};

export default Graficas;
