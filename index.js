const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./src/routes");
const model = require("./src/models");
const dotenv = require("dotenv");
const config = require("./config");
dotenv.config();

const app = express();
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());

app.get("/", (_, res) =>
  res.send({
    message: "Task Management Server running...",
    time: new Date(),
  })
);

app.use("/", routes);

app.all("*", (_, res) =>
  res.status(404).send({
    message: "Resource not found",
  })
);

const PORT = config.app.port || 5001;

let server;

async function startServer() {
  await model.sequelize.authenticate();
  console.log("Database connected successfully");

  server = app.listen(PORT, () =>
    console.log(`Server Running on Port: http://localhost:${PORT}`)
  );
}
startServer();

module.exports = { app, server };
