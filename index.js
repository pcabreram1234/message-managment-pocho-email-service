const cron = require("node-cron");
const { sendPendingMessages } = require("./jobs/sendPendingMessages");
const { sendErrorMessages } = require("./jobs/handleErrorMessges");

// Programa la tarea para enviar mensajes pendientes cada 15 minutos
cron.schedule("*/10 * * * *", () => {
  console.log("Iniciando tarea: Enviar mensajes pendientes...");
  sendPendingMessages().then(() => {
    console.log("Finalizada tarea:  Enviar mensajes pendientes...");
    setTimeout(async () => {
      console.log("Iniciando tarea: Manejar mensajes con error...");
      await sendErrorMessages();
      console.log("Finalizada tarea: Manejar mensajes con error...");
    }, 100);
  });
})

// // Programa la tarea para manejar mensajes con error cada 10 minutos, comenzando 3 minutos después de la primera
// cron.schedule("3-59/10 * * * *", () => {});
