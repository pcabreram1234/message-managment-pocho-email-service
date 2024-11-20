const cron = require("node-cron");
const { sendPendingMessages } = require("./jobs/sendPendingMessages");
const { sendErrorMessages } = require("./jobs/handleErrorMessges");

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

// Tarea para auto-ping
cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("Enviando autoping...");
    await fetch(process.env.SELF_URL);
  } catch (error) {
    console.error("Error al enviar autoping:", error.message);
  }
});
