const { Op } = require("sequelize");
const { models } = require("../libs/sequelize");

class FailedMessageService {
  async findMessageWithErrors() {
    const date = new Date();
    const rta = await models.FailedMessage.findAll({
      where: {
        status: "Error",
        next_retry_at: {
          [Op.lte]: [date],
        },
      },
      attributes: [
        "id",
        "recipient",
        "message_content",
        "attempts",
        "status",
        "last_attempt_at",
        "next_retry_at",
      ],
    });
    console.log(rta);
    return rta;
  }

  async updateFailedMessage(data) {
    const {
      scheduled_date,
      status,
      attempts,
      next_retry_at,
      last_attempt_at,
      error_message,
      message_id,
      recipient,
    } = data;
    const rta = await models.FailedMessage.update(
      {
        status: status,
        attempts: attempts ?? null,
        next_retry_at: next_retry_at ?? null,
        last_attempt_at: last_attempt_at ?? null,
        error_message: error_message ?? null,
      },
      {
        where: {
          recipient: recipient,
          scheduled_date: scheduled_date,
          message_id: message_id,
        },
      }
    );
    return rta;
  }

  async findOneMessageWithError(data) {
    const { message_id, scheduled_date, recipient } = data;
    const rta = await models.FailedMessage.findOne({
      where: {
        message_id: message_id,
        scheduled_date: scheduled_date,
        recipient: recipient,
        status: { [Op.notIn]: ["Sended"] },
      },
      attributes: ["message_id", "id", "scheduled_date", "attempts"],
    });
    return rta;
  }

  async createNewMessageWithError(data) {
    const rta = await models.FailedMessage.create(data);
    return rta;
  }
}

module.exports = { FailedMessageService };
