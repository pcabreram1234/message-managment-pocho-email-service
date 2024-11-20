const { MessageConfigService } = require("../services/message-config.service");
const { SendEmailService } = require("../services/send-email.service");

const service = new MessageConfigService();

const sendPendingMessages = async () => {
  try {
    const messagesPending = await service.findMessagePending();

    for (const message of messagesPending) {
      console.log(message);
      const sendMessages = new SendEmailService();
      await sendMessages.sendEmail(message.dataValues);
    }
  } catch (error) {
    console.log("Ha ocurrido el error " + error);
  }
};

module.exports = { sendPendingMessages };
