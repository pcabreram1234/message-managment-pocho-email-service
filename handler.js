const { sendPendingMessages } = require("./jobs/sendPendingMessages");
const { sendErrorMessages } = require("./jobs/handleErrorMessges");

exports.handler = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));
  try {
    console.log("Iniciando tarea: Enviar mensajes pendientes...");
    await sendPendingMessages()
      .then(() => {
        console.log("Finalizada tarea: Enviar mensajes pendientes...");
      })
      .then(async () => {
        console.log("Iniciando tarea: Manejar mensajes con error...");
        await sendErrorMessages().then(() => {
          console.log("Finalizada tarea: Manejar mensajes con error...");
        });
      });
  } catch (error) {
    console.error("Error ejecutando las tareas:", error);
    throw new Error("Error en las tareas programadas");
  }
};
