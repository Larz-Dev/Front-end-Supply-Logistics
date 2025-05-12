import React, { useState } from "react";
import { variables } from "./funciones.jsx";

const DummyWhatsappChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("123456789");
  const [pinVerified, setPinVerified] = useState(false);
  const [chatActive, setChatActive] = useState(true); // Controla si el chat está activo o no
  const [selectedOptionText, setSelectedOptionText] = useState("");

  const opciones = {
    text: "Aquí tienes algunas opciones:",
    replies: [
      { id: 1, text: "Generar solicitud de carga y llegada de vehículo" },
      { id: 2, text: "Consultar estado de viajes" },
      { id: 3, text: "Consultar mis vehículos" },
      { id: 4, text: "Registrar vehículo" },
    ],
  };

  // Función para enviar el mensaje al backend
  const enviarMensajeBackend = async (messageText) => {
    try {
      const response = await fetch(
        variables("API") + "/whatsapp/receive-dummy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromNumber: recipientNumber,
            messageText: messageText,
          }),
        }
      );

      const data = await response.json();

      // Si el backend responde correctamente
      if (data.status === "success") {
        const botResponseText = data.datos.botResponse; // Respuesta del backend
        addMessage("bot", botResponseText); // Agregar la respuesta del bot

        // Si el PIN es verificado, establecer pinVerified en true
        if (botResponseText.includes("Bienvenido")) {
          setPinVerified(true);
          addMessage("bot", opciones.text); // Mostrar las opciones
          setChatActive(false); // Desactivar el chat para que el usuario no escriba
        }
      } else {
        addMessage("bot", "Hubo un error al recibir el mensaje.");
      }
    } catch (error) {
      addMessage("bot", "Ocurrió un error en la comunicación.");
    }
  };

  // Función para agregar mensajes al chat
  const addMessage = (sender, text) => {
    setMessages((prevMessages) => [...prevMessages, { sender, text }]);
  };

  // Función para manejar el envío de mensajes
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !chatActive) return; // Solo enviar mensaje si el chat está activo

    addMessage("user", input);
    enviarMensajeBackend(input); // Enviar el mensaje al backend para generar la respuesta del bot
    setInput(""); // Limpiar el input
  };

  // Función para manejar la selección de una opción
  const handleOptionClick = (id, text) => {
    setSelectedOptionText(text); // Establecer el texto de la opción seleccionada
    setChatActive(true); // Reactivar el chat
    addMessage("user", text); // Mostrar el texto de la opción seleccionada
    enviarMensajeBackend(String(id)); // Enviar el ID de la opción seleccionada
  };

  // Función para manejar la cancelación de la acción
  const handleCancel = () => {
    setChatActive(true); // Reactivar el chat
    addMessage("user", "Acción cancelada.");
    addMessage("bot", "La acción ha sido cancelada.");
  };

  return (
    <div className="container my-5" style={{ maxWidth: "600px" }}>
      <div className="bg-white p-3 rounded shadow">
        <h4 className="text-center mb-3">Simulador de Chat WhatsApp</h4>

        <div className="mb-3">
          <label htmlFor="recipientNumber" className="form-label">
            Número del destinatario
          </label>
          <input
            type="text"
            className="form-control"
            id="recipientNumber"
            placeholder="Introduce el número del destinatario"
            value={recipientNumber}
            onChange={(e) => setRecipientNumber(e.target.value)}
          />
        </div>

        <div
          style={{
            height: "400px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`text-${msg.sender === "user" ? "end" : "start"} mb-2`}
            >
              <span
                className={`d-inline-block px-3 py-2 rounded-pill ${
                  msg.sender === "user" ? "bg-success text-white" : "bg-light"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {pinVerified &&
            !chatActive && ( // Mostrar opciones solo cuando el chat esté inactivo
              <div className="mt-3">
                {opciones.replies.map((option) => (
                  <button
                    key={option.id}
                    className="btn btn-outline-primary m-1"
                    onClick={() => handleOptionClick(option.id, option.text)} // Enviar el ID y texto de la opción seleccionada
                  >
                    {option.text}
                  </button>
                ))}
                <button
                  className="btn btn-outline-danger m-1"
                  onClick={handleCancel} // Botón para cancelar
                >
                  Cancelar
                </button>
              </div>
            )}
        </div>

        {/* Formulario solo habilitado si el chat está activo */}
        <form onSubmit={handleSubmit} className="input-group mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            disabled={!chatActive} // Desactivar el input cuando el chat está inactivo
          />
          <button
            type="submit"
            className="btn btn-success"
            disabled={!chatActive} // Desactivar el botón de enviar cuando el chat está inactivo
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default DummyWhatsappChat;
