const { MessageConfigService } = require("../services/message-config.service");
const { SendEmailService } = require("../services/send-email.service");
const { FailedMessageService } = require("../services/failed_message.service");
const { initSequelize } = require("../libs/sequelize");

const service = new MessageConfigService();
const failedService = new FailedMessageService();



const sendPendingMessages = async () => {
  const models = await initSequelize().then((sequelize) => {
    return sequelize.models
  })
  service.models = models;
  failedService.models = models;
  const messagesPending = await service.findMessagePending();
  for (const message of messagesPending) {
    try {
      const sendMessages = new SendEmailService();
      await sendMessages.sendEmail(message.dataValues).then(async () => {
        await service.updateMessagePending(message.dataValues.id, "sended").then(async () => {
          console.log("Mensaje actualizado a enviado");
          await failedService.deleteFailedMessage({
            message_id: message.dataValues.id,
            scheduled_date: message.dataValues.scheduled_date,
            recipient: message.dataValues.recipient,
          });
        })
      })
    } catch (error) {
      console.log("Ha ocurrido el error " + error);
      await message.update({ status: "error" }, { where: { id: message.dataValues.id } }).then(async () => {
        console.log("Mensaje actualizado a error");
        const failedMessageBody = {
          status: "Error",
          attempts: 1,
          next_retry_at: new Date(new Date().getTime() + 15 * 60000),
          last_attempt_at: message.dataValues.scheduled_date,
          error_message: error,
          recipient: message.dataValues.recipient,
          scheduled_date: message.dataValues.scheduled_date,
          message_id: message.dataValues.message_id,
        }

        await failedService.updateFailedMessage(failedMessageBody);
      })
    }
  }
};

module.exports = { sendPendingMessages };
