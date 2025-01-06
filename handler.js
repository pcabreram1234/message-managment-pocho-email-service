const { sendPendingMessages } = require("./jobs/sendPendingMessages");
const { sendErrorMessages } = require("./jobs/handleErrorMessges");

exports.handler = async (event) => {
    try {
        console.log("Iniciando tarea: Enviar mensajes pendientes...");
        await sendPendingMessages();
        console.log("Finalizada tarea: Enviar mensajes pendientes...");

        console.log("Iniciando tarea: Manejar mensajes con error...");
        await sendErrorMessages();
        console.log("Finalizada tarea: Manejar mensajes con error...");
    } catch (error) {
        console.error("Error ejecutando las tareas:", error);
        throw new Error("Error en las tareas programadas");
    }
};
