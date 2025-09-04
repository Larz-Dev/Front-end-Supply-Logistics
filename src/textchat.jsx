import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { variables } from "./funciones.jsx";

const ChatTest = () => {
  const [token, setToken] = useState("");
  const [input, setInput] = useState("");
  const [numerotelefono, setNumeroTelefono] = useState(57301331323);
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);

  const parseBoldText = (text) => {
    const parts = text.split(/(\*[^\*\n]+\*|\n)/g); // divide por negritas o saltos de línea

    return parts.map((part, index) => {
      if (part === "\n") {
        return <br key={index} />;
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };
  
  const generateMessageId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "wamid.";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const enviarMensajeSimulado = async (payload) => {
    try {
      const response = await fetch(variables("API") + "/whatsapp/receive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      const payloadData = data.debugMessages?.[0]?.payload;
      const text =
        payloadData?.text?.body || payloadData?.interactive?.body?.text || "";
      const buttons =
        payloadData?.interactive?.action?.buttons?.map((btn) => ({
          id: btn.reply.id,
          title: btn.reply.title,
        })) || [];

      const botMessage = {
        role: "bot",
        content: { text, buttons },
      };

      setMessages((prev) => [...prev, botMessage]);
      setInput("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: { text: "❌ Error al procesar el mensaje." },
        },
      ]);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage = { role: "user", content: { text: trimmed } };
    setMessages((prev) => [...prev, newMessage]);

    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "test_entry",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { phone_number_id: "test_phone_number" },
                contacts: [
                  {
                    profile: { name: "Tester" },
                    wa_id: "573000000000",
                  },
                ],
                messages: [
                  {
                    from: numerotelefono,
                    id: generateMessageId(),
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: { body: trimmed },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    await enviarMensajeSimulado(payload);
  };

  const handleButtonClick = async (buttonId, title = "") => {
    const userMsg = {
      role: "user",
      content: { text: title || buttonId },
    };
    setMessages((prev) => [...prev, userMsg]);

    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "test_entry",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { phone_number_id: "test_phone_number" },
                contacts: [
                  {
                    profile: { name: "Tester" },
                    wa_id: "573000000000",
                  },
                ],
                messages: [
                  {
                    from: numerotelefono,
                    id: generateMessageId(),
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "interactive",
                    interactive: {
                      type: "button_reply",
                      button_reply: {
                        id: buttonId,
                        title: title || buttonId,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    await enviarMensajeSimulado(payload);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container mt-4">
      <h4>🧪 WhatsApp Chat Tester</h4>

      <div className="mb-3">
        <label className="form-label">Número de telefono</label>
        <input
          type="number"
          className="form-control"
          value={numerotelefono}
          onChange={(e) => setNumeroTelefono(e.target.value)}
          placeholder="Escribe tu número"
        />
      </div>

      <div
        ref={chatRef}
        className="border rounded p-3 mb-3 bg-light"
        style={{ height: "500px", overflowY: "auto" }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex mb-2 ${
              msg.role === "user"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded ${
                msg.role === "user"
                  ? "bg-primary text-white"
                  : "bg-white border"
              }`}
              style={{ maxWidth: "75%" }}
            >
              <div>{parseBoldText(msg.content.text)}</div>
              {msg.role === "bot" && msg.content.buttons?.length > 0 && (
                <div className="mt-2">
                  {msg.content.buttons.map((btn, i) => (
                    <button
                      key={i}
                      className="btn btn-outline-secondary btn-sm me-2 mt-1"
                      onClick={() => handleButtonClick(btn.id, btn.title)}
                    >
                      {btn.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="input-group">
        <input
          className="form-control"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button className="btn btn-primary" onClick={handleSend}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatTest;
