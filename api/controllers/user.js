"use strict";
const bcrypt = require("bcrypt-nodejs");

const User = require("../models/user");
const jwt = require("../services/jwt");

function home(req, res) {
  res.status(200).send({
    message: "Hola mundo desde el servidor de nodejs",
  });
}

function pruebas(req, res) {
  res.status(200).send({
    message: "Accion de pruebas en el servidor de nodejs",
  });
}

function saveUser(req, res) {
  const params = req.body;
  const user = new User();
  if (
    params.name &&
    params.surname &&
    params.nick &&
    params.email &&
    params.password
  ) {
    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.image = null;
    //Controlamos usuarios duplicados
    User.find({ $or: [{ email: user.email }, { nick: user.nick }] }).exec(
      (err, users) => {
        if (err)
          return res
            .status(500)
            .send({ message: "Error en la petición de usuarios" });
        if (users && users.length >= 1) {
          return res
            .status(200)
            .send({ message: "El usuario que intentas registrar ya existe" });
        } else {
          //Tenemos que guardar la contraseña encriptada
          bcrypt.hash(params.password, null, null, (err, hash) => {
            user.password = hash;
            user.save((err, userStored) => {
              if (err)
                return res
                  .status(500)
                  .send({ message: "Error al guardar el usuario" });

              if (userStored) {
                res.status(200).send({ user: userStored });
              } else {
                res
                  .status(404)
                  .send({ message: "No se ha registrado el usuario" });
              }
            });
          });
        }
      }
    );
  } else {
    res.status(200).send({ message: "Todos los campos son obligatorios" });
  }
}

function loginUser(req, res) {
  const params = req.body;
  const email = params.email;
  const password = params.password;

  User.findOne({ email: email }, (err, user) => {
    if (err) return res.status(500).send({ message: "Error en la petición" });

    if (user) {
      bcrypt.compare(password, user.password, (err, check) => {
        if (check) {
          if (params.gettoken) {
            //devolver token
            return res.status(200).send({
              token: jwt.createToken(user),
            });
          } else {
            //devolver datos de usuario
            user.password = undefined;
            return res.status(200).send({ user });
          }
        } else {
          return res
            .status(404)
            .send({ message: "El usuario no se ha podido identificar" });
        }
      });
    } else {
      return res
        .status(404)
        .send({ message: "El usuario no se ha podido identificar" });
    }
  });
}

//Conseguir datos de un usuario
function getUser(req, res) {
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err) return res.status(500).send({ message: "Error en la petición" });

    if (!user) return res.status(404).send({ message: "El usuario no existe" });

    user.password = undefined;
    return res.status(200).send({ user });
  });
}

module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
};
