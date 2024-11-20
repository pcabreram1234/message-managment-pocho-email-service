const cron = require("node-cron");
const { sendPendingMessages } = require("./jobs/sendPendingMessages");
const { sendErrorMessages } = require("./jobs/handleErrorMessges");
const http = require("http");
const httpRequest = require("http");

// Configuración del servidor
const PORT = process.env.PORT || 3121; // Puerto donde escuchará el servidor
const HOST = process.env.host || "localhost"; // Dirección host

// Función manejadora de solicitudes
const requestHandler = (req, res) => {
  // Log de la solicitud
  console.log(`Recibida una solicitud: ${req.method} ${req.url}`);

  // Rutas simples
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>¡Hola, mundo!</h1>");
  } else if (req.url === "/ping" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Pong!");
  } else {
    // Respuesta para rutas no encontradas
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Página no encontrada");
  }
};

// Creación del servidor
const server = http.createServer(requestHandler);

// Inicio del servidor
server.listen(PORT, HOST, () => {
  const options = {
    hostname: HOST,
    port: PORT,
    path: "/",
    method: "GET",
  };
  // Tarea para auto-ping
  cron.schedule("*/5 * * * *", async () => {
    try {
      const req = httpRequest.request(options, (res) => {
        console.log(
          `Llamada automática al endpoint /: Status ${res.statusCode}`
        );
        res.on("data", (data) => {
          console.log(`Respuesta del servidor: ${data}`);
        });
      });
    } catch (error) {
      console.error("Error al enviar autoping:", error.message);
    }
  });

  console.log(`Servidor corriendo en http://${HOST}:${PORT}/`);
});

// Programa la tarea para enviar mensajes pendientes cada 5 minutos
cron.schedule("*/1 * * * *", () => {
  console.log("Iniciando tarea: Enviar mensajes pendientes...");
  sendPendingMessages().then(() => {
    console.log("Finalizada tarea:  Enviar mensajes pendientes...");
    setTimeout(async () => {
      console.log("Iniciando tarea: Manejar mensajes con error...");
      await sendErrorMessages();
      console.log("Finalizada tarea: Manejar mensajes con error...");
    }, 60000);
  });
});
