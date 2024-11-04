const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { FailedMessageService } = require("../services/failed_message.service");
const { MessageConfigService } = require("../services/message-config.service");

class SendEmailService {
  constructor() {
    this.messageConfigService = new MessageConfigService();
    this.failedService = new FailedMessageService();
    this.currentDate = new Date();
    this.next_retry_at = new Date(this.currentDate);
    this.next_retry_at.setHours(this.next_retry_at.getHours() + 1);
  }
  async sendEmail(message) {
    const { message_id, scheduled_date, recipient, message_content, id } =
      message;
    const currentFailedMessage =
      await this.failedService.findOneMessageWithError({
        message_id: message_id,
        scheduled_date: scheduled_date,
        recipient: recipient,
      });
    // Crear el transportador con la configuración necesaria
    const transporter = nodemailer.createTransport({
      port: process.env.NODEMAILER_PORT,
      host: process.env.NODEMAILER_HOST,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    try {
      await transporter.verify();
      const templatePath = path.join(
        __dirname,
        "..",
        "/templates/",
        "mail_template.html"
      );
      let emailTemplate = fs.readFileSync(templatePath, "utf8");

      emailTemplate = emailTemplate.replace(
        "{{MENSAJE_PROGRAMADO}}",
        message_content
      );
      console.log("Conexión exitosa con el servidor SMTP");
      // Enviar el correo de forma asincrónica
      const info = await transporter.sendMail({
        from: process.env.NODEMAILER_FROM, // Dirección del remitente
        to: recipient, // Dirección de destino
        subject: "PMMS - Pocho`s Messages Managment System", // Asunto del correo
        text: message_content.toString(), // Mensaje en texto plano
        html: emailTemplate,
      });

      // Determinar el resultado basado en la respuesta del envío
      let resp;
      if (info.messageId) {
        resp = "sended";
        await this.messageConfigService.updateMessagePending(id, resp);
        console.log("Message sent: %s", info.messageId);
      } else {
        resp = "error";
        console.error("Error en el envío del mensaje");
      }

      if (currentFailedMessage !== undefined && currentFailedMessage !== null) {
        await this.failedService.updateFailedMessage({
          status: "Sended",
          attempts: parseInt(currentFailedMessage.attempts) + 1,
          last_attempt_at: this.currentDate,
          next_retry_at: this.next_retry_at,
          error_message: null,
          message_id: message_id,
          recipient: recipient,
          scheduled_date: scheduled_date,
        });
      }
    } catch (error) {
      console.log(error);
      await this.messageConfigService.updateMessagePending(id, "error");

      if (currentFailedMessage !== undefined && currentFailedMessage !== null) {
        await this.failedService.updateFailedMessage({
          status: "Error",
          attempts: parseInt(currentFailedMessage.attempts) + 1,
          last_attempt_at: this.currentDate,
          next_retry_at: this.next_retry_at,
          error_message: error?.message,
          message_id: message_id,
          recipient: recipient,
          scheduled_date: scheduled_date,
        });
      }
    }
  }

  async retrySendEmail(message) {
    const { message_id, scheduled_date, recipient } = message;

    const currentFailedMessage =
      await this.failedService.findOneMessageWithError({
        message_id: message_id,
        scheduled_date: scheduled_date,
        recipient: recipient,
      });
    // Crear el transportador con la configuración necesaria
    const transporter = nodemailer.createTransport({
      port: process.env.NODEMAILER_PORT,
      host: process.env.NODEMAILER_HOST,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    try {
      await transporter.verify();
      const templatePath = path.join(
        __dirname,
        "..",
        "/templates/",
        "mail_template.html"
      );
      let emailTemplate = fs.readFileSync(templatePath, "utf8");

      emailTemplate = emailTemplate.replace("{{MENSAJE_PROGRAMADO}}", message);
      console.log("Conexión exitosa con el servidor SMTP");
      // Enviar el correo de forma asincrónica
      const info = await transporter.sendMail({
        from: process.env.NODEMAILER_FROM, // Dirección del remitente
        to: email, // Dirección de destino
        subject: "Message Management Pocho", // Asunto del correo
        text: message.toString(), // Mensaje en texto plano
        html: emailTemplate,
      });

      // Determinar el resultado basado en la respuesta del envío
      let resp;
      if (info.messageId) {
        resp = "sended";
        await this.messageConfigService.updateMessagePending(message_id, resp);
        console.log("Message sent: %s", info.messageId);
      } else {
        resp = "error";
        console.error("Error en el envío del mensaje");
      }

      await this.failedService.updateFailedMessage({
        status: String.prototype.valueOf(resp).toLocaleUpperCase("lt-LT"),
        attempts: parseInt(currentFailedMessage.attempts) + 1,
        last_attempt_at: this.currentDate,
        next_retry_at: this.next_retry_at,
        error_message: "",
        message_id: message_id,
        recipient: recipient,
        scheduled_date: scheduled_date,
      });
    } catch (error) {
      console.error("Ha ocurrido un error: ", error);
      await this.failedService.updateFailedMessage({
        status: "Error",
        attempts: parseInt(currentFailedMessage.attempts) + 1,
        last_attempt_at: this.currentDate,
        next_retry_at: this.next_retry_at,
        error_message: error.toString(),
        message_id: message_id,
        recipient: recipient,
        scheduled_date: scheduled_date,
      });
    }
  }
}

module.exports = { SendEmailService };
