const { SendEmailService } = require("../services/send-email.service");
const { MessageConfigService } = require("../services/message-config.service");
const { FailedMessageService } = require("../services/failed_message.service");
const { initSequelize } = require("../libs/sequelize");
const service = new FailedMessageService();

const sendErrorMessages = async () => {
  const models = await initSequelize().then((sequelize) => {
    return sequelize.models
  })
  service.models = models;
  const messagesPendingWithErrors = await service.findMessageWithErrors();
  for (const message of messagesPendingWithErrors) {
    try {
      const sendMessages = new SendEmailService();
      await sendMessages.sendEmail(message).then(async(response) => {
        console.log(response);
        await message.update({ status: "sended" }, { where: { id: message.id } });
        const newService = new MessageConfigService();
        await newService.updateMessagePending(message.id, "sended");
      });
    } catch (error) {
      // await service.updateFailedMessage(message);
      await message.update({ attempts: message.attempts + 1, scheduled_date: new Date(Date.now() + 5 * 60000) }, { where: { id: message.id } });
    }
  }
};

module.exports = { sendErrorMessages };
