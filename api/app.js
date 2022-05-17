"user strict";
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

//cargar rutas

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//cors

//rutas
app.get("/hola", (req, res) => {
  res.status(200).send({
    message: "Hola mundo desde el servidor de nodejs",
  });
});

//exportar
module.exports = app;
