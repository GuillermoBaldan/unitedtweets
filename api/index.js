"use strict";
const mongoose = require("mongoose");
const app = require("./app");
const port = process.env.PORT || 3800;

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/unitedtweets")
  .then(() => {
    console.log(
      "La conexión a la base de datos unitedtweets se ha realizado correctamente"
    );
    //Crear servidor
    app.listen(port, () => {
      console.log(`El servidor esta corriendo en ${port}`);
    });
  })
  .catch((err) => console.log(err));
