require("dotenv").config();
const { MessageConfigService } = require("../services/message-config.service");
const { SendEmailService } = require("../services/send-email.service");
const { FailedMessageService } = require("../services/failed_message.service");
const { initSequelize } = require("../libs/sequelize");

const service = new MessageConfigService();
const failedService = new FailedMessageService();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const sendPendingMessages = async () => {
  console.log("Proceso iniciado");
  const models = await initSequelize().then((sequelize) => {
    return sequelize.models;
  });
  service.models = models;
  failedService.models = models;
  const limit = process.env.MAIL_SEND_PER_DAY_LIMIT;
  const messagesPending = await service.findMessagePending();

  if (!messagesPending || messagesPending?.length === 0) {
    console.log("No hay mensajes pendientes.");
    return;
  }

  const priorityMails = messagesPending.slice(0, limit);

  //Con esto nos aseguramos de solo trate de enviar mensajes si existen destinarios a los cuales enviar.
  const sendMessages = new SendEmailService(); //Instanciamos una sola vez la clase
  // Agrupar mensajes por usuarios
  const groupedByUserId = priorityMails.reduce((acc, item) => {
    const key = item.UserId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  // Agrupar por cada usuario sus mensajes por el MessageId
  for (const key in groupedByUserId) {
    const groupedByMessageId = groupedByUserId[key].reduce((acc, item) => {
      const key = item.MessageId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // console.log(groupedByMessageId);
    // iterar sobre cada grupo de MessageId
    for (const key2 in groupedByMessageId) {
      const currentGroup = groupedByMessageId[key2];
      // Crear lotes de 100 contactos
      for (let i = 0; i < currentGroup.length; i += limit) {
        const batchMessages = currentGroup.slice(i, i + limit);
        const recipients = batchMessages
          ?.map((el) => el?.recipient)
          .reduce((acc, item) => {
            if (!acc.includes(item)) {
              acc.push(item);
            }
            return acc;
          }, [])
          .flat();
        console.log("Enviando el mesaje: " + key2);
        console.info("Al usuario: " + key);
        console.info("Con el messgeId: " + key2);
        console.info("A los destinatarios");
        console.log(recipients);

        const MessageId = batchMessages[0]?.id;
        const ScheduledDate = batchMessages[0]?.scheduled_date;
        const bulkeMessageTosend = {
          recipient: recipients,
          message_content: batchMessages[0]?.message_content,
          MessageId: MessageId,
          ScheduledDate: ScheduledDate,
        };
        // console.log(bulkeMessageTosend);

        await sendMessages.sendEmail(bulkeMessageTosend).then(async () => {
          await service
            .updateMessagePending(MessageId, "sended")
            .then(async () => {
              console.log("Mensaje actualizado a enviado");
              await failedService.deleteFailedMessage({
                message_id: MessageId,
                scheduled_date: ScheduledDate,
                recipient: bulkeMessageTosend?.recipient,
              });
            });
        });
        if (i + limit < currentGroup.length) {
          console.log("Esperando para iniciar en dos minutos");
          await delay(120000);
        }
      }
    }
  }
};

module.exports = { sendPendingMessages };
