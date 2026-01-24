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
      status,
      attempts,
      next_retry_at,
      last_attempt_at,
      error_message,
      id,
    } = data;

    const updateData = {};

    if (status !== undefined) updateData.status = status;
    if (attempts !== undefined) updateData.attempts = attempts;
    if (next_retry_at !== undefined) updateData.next_retry_at = next_retry_at;
    if (last_attempt_at !== undefined)
      updateData.last_attempt_at = last_attempt_at;
    if (error_message !== undefined) updateData.error_message = error_message;

    const rta = await this.models.FailedMessage.update(updateData, {
      where: {
        message_id: id,
      },
    });
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
