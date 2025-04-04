import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Fondo from './assets/images/fondo2.jpg';
import logo from './assets/images/logo-supply.png';

const Index = () => {
  return (
    <div className="d-flex flex-column min-vh-100 " style={{ backgroundImage: `url(${Fondo})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat',backgroundPositionY:'100px' }}>
      {/* Cabecera */}
      <header className="bg-supply py-3 shadow-sm ">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center ">
            <img src={logo} alt="Logo We Supply " height="70" className="me-2 bg-white rounded p-1" />
            <span className="fs-4 fw-bold text-white">We Supply</span>
          </div>
          <a href="/tools" className="btn btn-success fw-bold btn-lg">Herramientas</a>
        </div>
      </header>

      {/* Contenedor principal */}
      <main className="flex-grow-1 d-flex align-items-center text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="container text-center">
          <h1 className="display-4 mb-3 fw-bold">We Supply</h1>
          <p className="lead mb-4">Soluciones de Planeación y Ejecución para los Procesos Logísticos</p>
          <Link to="/login" className="btn btn-lg btn-success fw-bold">Ingresar</Link>
       <p></p>
        </div>
        
      </main>

      {/* Pie de página */}
      <footer className="bg-dark text-light py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3 mb-md-0">
              <h5>Gestión Documental</h5>
              <p>Soluciones avanzadas para gestionar documentos y procesos logísticos.</p>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <h5>Distribución</h5>
              <p>Optimización y seguimiento en la distribución de mercancías.</p>
            </div>
            <div className="col-md-4">
              <h5>Cargue y Descargue</h5>
              <p>Soporte completo para el manejo de carga y descarga en logística.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
