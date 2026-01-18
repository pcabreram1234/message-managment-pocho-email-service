const { Op } = require("sequelize");
// const { initSequelize } = require("../libs/sequelize");

class FailedMessageService {
  constructor(models) {
    this.models = models;
  }
  async findMessageWithErrors() {
    const d = new Date();
    const retryLimit = new Date(d.getTime() + 20 * 60000);
    const rta = await this.models.FailedMessage.findAll({
      where: {
        status: { [Op.or]: ["Error", "Pending"] },
        next_retry_at: {
          [Op.or]: [null, { [Op.lte]: retryLimit }],
        },
        attempts: {
          [Op.lte]: 3,
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
    const rta = await this.models.FailedMessage.update(
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
      },
    );
    return rta;
  }

  async findOneMessageWithError(data) {
    const { message_id, scheduled_date, recipient } = data;
    const rta = await this.models.FailedMessage.findOne({
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
    const rta = await this.models.FailedMessage.create(data);
    return rta;
  }

  async deleteFailedMessage(data) {
    const { message_id, scheduled_date, recipient } = data;
    const rta = await this.models.FailedMessage.destroy({
      where: {
        message_id: message_id,
        scheduled_date: scheduled_date,
        recipient: recipient,
      },
    });
    return rta;
  }
}

module.exports = { FailedMessageService };
