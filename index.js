const { sendPendingMessages } = require("./jobs/sendPendingMessages");

// sendPendingMessages();
console.log("Iniciando tarea: Enviar mensajes pendientes...");
sendPendingMessages().then(() => {
  console.log("Finalizada tarea:  Enviar mensajes pendientes...");
});

// // Programa la tarea para manejar mensajes con error cada 10 minutos, comenzando 3 minutos después de la primera
// cron.schedule("3-59/10 * * * *", () => {});
