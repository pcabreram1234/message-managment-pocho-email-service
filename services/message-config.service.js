const { models } = require("../libs/sequelize");
const { Op } = require("sequelize");

class MessageConfigService {
  async findMessagePending() {
    const date = new Date();
    const rta = await models.MessageConfig.findAll({
      where: {
        status: "pending",
      },
      attributes: [
        "recipient",
        ["message", "message_content"],
        "message_id",
        "scheduled_date",
        "id",
      ],
    });
    return rta;
  }

  async findMessagesWithError() {
    const now = new Date();

    // Restar 5 minutos a la hora actual para considerar el atraso
    const delay = new Date(now.getTime() - 5 * 60000); // 5 minutos en milisegundos

    // Buscar mensajes con estado "error" y cuya scheduled_date esté entre la hora actual y el margen de atraso
    const rta = await models.MessageConfig.findAll({
      where: {
        status: "error",
        scheduled_date: {
          [Op.between]: [delay, now], // Rango entre el margen de atraso y la hora actual
        },
      },
      attributes: [
        "recipient",
        ["message", "message_content"],
        "message_id",
        "scheduled_date",
        "id",
      ],
    });

    console.log(rta);
    return rta;
  }

  async updateMessagePending(id, status) {
    const rta = await models.MessageConfig.update(
      { status: status },
      { where: { id: id } }
    );
    return rta;
  }
}

module.exports = { MessageConfigService };
