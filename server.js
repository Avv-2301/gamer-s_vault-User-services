const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const { connect } = require("./src/config/dbConnection");
connect();

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running.... for user-services ",
  });
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT} for user-service`
  );
});
