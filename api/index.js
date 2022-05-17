const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/unitedtweets")
  .then(() => {
    console.log(
      "La conexión a la base de datos unitedtweets se ha realizado correctamente"
    );
  })
  .catch((err) => console.log(err));
