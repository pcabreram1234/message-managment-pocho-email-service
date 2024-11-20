const { SendEmailService } = require("../services/send-email.service");
const { MessageConfigService } = require("../services/message-config.service");

const service = new MessageConfigService();

const sendErrorMessages = async () => {
  try {
    const messagesPendingWithErrors = await service.findMessagesWithError();
    for (const message of messagesPendingWithErrors) {
      const sendMessages = new SendEmailService();

      await sendMessages.retrySendEmail(message);
    }
  } catch (error) {
    console.log("Ha ocurrido el error " + error);
  }
};

module.exports = { sendErrorMessages };
