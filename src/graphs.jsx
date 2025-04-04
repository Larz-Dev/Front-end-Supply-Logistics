import React, { useEffect, useState } from "react";
import Cabecera from "./cabecera";
import Sidebar from "./sidebar";
import { variables, Notificar } from "./funciones";
import Chart from "react-apexcharts";

const Graficas = () => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "bar",
      height: 350,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [],
    },
  });

  const [chartSeries, setChartSeries] = useState([
    {
      name: "Rendimiento",
      data: [],
    },
  ]);

  const [chartOptions2, setChartOptions2] = useState({
    chart: {
      type: "bar",
      height: 350,
    },
    colors: ["#33FF57", "#FF5733", "#3357FF"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: [],
    },
  });

  const [chartSeries2, setChartSeries2] = useState([
    {
      name: "Rendimiento Menor",
      data: [],
    },
  ]);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Primer fetch para "trabajadorPermormance"
        const response = await fetch(
          variables("API") + "/graphs/trabajadorPermormance",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        const jdata = await response.json();

        if (jdata.status === "success") {
          const categories = jdata.empleados.map(
            (empleado) => `${empleado.nombreCompleto} (${empleado.documento})`
          );
          const seriesData = jdata.empleados.map(
            (empleado) => empleado.totalRecibos
          );

          setChartOptions((prevOptions) => ({
            ...prevOptions,
            xaxis: { categories },
          }));

          setChartSeries([
            {
              name: "Total Recibos",
              data: seriesData,
            },
            {
              name: "Tiempo Promedio (minutos)",
              data: jdata.empleados.map(
                (empleado) => empleado.tiempoPromedioMinutos
              ),
            },
          ]);
        } else {
          Notificar(
            jdata.mensaje ||
              "No se ha podido cargar la gráfica de rendimiento mayor",
            jdata.status || "error",
            "normal"
          );
        }

        // Segundo fetch para "trabajadorLessPermormance"
        const response2 = await fetch(
          variables("API") + "/graphs/trabajadorLessPermormance",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        const jdata2 = await response2.json();

        if (jdata2.status === "success") {
          const categories2 = jdata2.empleados.map(
            (empleado) => `${empleado.nombreCompleto} (${empleado.documento})`
          );
          const seriesData2 = jdata2.empleados.map(
            (empleado) => empleado.totalRecibos
          );

          setChartOptions2((prevOptions2) => ({
            ...prevOptions2,
            xaxis: { categories: categories2 },
          }));

          setChartSeries2([
            {
              name: "Total Recibos",
              data: seriesData2,
            },
            {
              name: "Tiempo Promedio (minutos)",
              data: jdata2.empleados.map(
                (empleado) => empleado.tiempoPromedioMinutos
              ),
            },
          ]);
        } else {
          Notificar(
            jdata2.mensaje ||
              "No se ha podido cargar la gráfica de menor rendimiento",
            jdata2.status || "error",
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

    fetchEmployeeData();
  }, []);

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
        <h1>Empleados con alto rendimiento</h1>
        {/* Primera gráfica */}
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={400}
        />
        <br />
        {/* Segunda gráfica */}
        <h1>Empleados con bajo rendimiento</h1>
        <Chart
          options={chartOptions2}
          series={chartSeries2}
          type="bar"
          height={400}
        />
      </div>
    </div>
  );
};

export default Graficas;
