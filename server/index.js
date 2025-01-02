const express = require("express");
const cron = require("node-cron");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3120;

const corsOption = {
  methods: ["GET"],
};

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hola mi server en express");
});

const startServer = () => {
  const server = app.listen(port, () => {
    console.log("Mi port " + port);

    cron.schedule("*/30 * * * *", async () => {
      try {
        console.log("Enviando autoping...");
        await fetch(process.env.SELF_URL);
        await fetch(process.env.API_URL);
      } catch (error) {
        console.error("Error al enviar autoping:", error.message);
      }
    });
  });

  server.keepAliveTimeout = 120 * 1000;
  server.headersTimeout = 120 * 1000;
};

module.exports = { startServer };
