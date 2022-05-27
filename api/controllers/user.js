"use strict";
const bcrypt = require("bcrypt-nodejs");
const mongoosePaginate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

const User = require("../models/user");
const jwt = require("../services/jwt");
const { exists } = require("../models/user");

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
  if (params.name && params.surname && params.nick && params.email && params.password) {
    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.image = null;
    //Controlamos usuarios duplicados
    User.find({ $or: [{ email: user.email }, { nick: user.nick }] }).exec((err, users) => {
      if (err) return res.status(500).send({ message: "Error en la petición de usuarios" });
      if (users && users.length >= 1) {
        return res.status(200).send({ message: "El usuario que intentas registrar ya existe" });
      } else {
        //Tenemos que guardar la contraseña encriptada
        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash;
          user.save((err, userStored) => {
            if (err) return res.status(500).send({ message: "Error al guardar el usuario" });

            if (userStored) {
              res.status(200).send({ user: userStored });
            } else {
              res.status(404).send({ message: "No se ha registrado el usuario" });
            }
          });
        });
      }
    });
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
          return res.status(404).send({ message: "El usuario no se ha podido identificar" });
        }
      });
    } else {
      return res.status(404).send({ message: "El usuario no se ha podido identificar" });
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

function getUsers(req, res) {
  const identity_user_id = req.user.sub;

  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  const itemsPerPage = 5;

  User.find()
    .sort("_id")
    .paginate(page, itemsPerPage, (err, users, total) => {
      if (err) return res.status(500).send({ message: "Error en la petición" });

      if (!users) return res.status(404).send({ message: "No hay usuarios disponibles" });

      return res.status(200).send({
        users,
        total,
        pages: Math.ceil(total / itemsPerPage),
      });
    });
}

function updateUser(req, res) {
  const userId = req.params.id;
  const update = req.body;

  //Delete password property
  delete update.password;

  if (userId != req.user.sub) {
    return res.status(500).send({ message: "No tienes permiso para actualizar este usuario" });
  }

  User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
    if (err) return res.status(500).send({ message: "Error en la petición" });

    if (!userUpdated) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });

    return res.status(200).send({ user: userUpdated });
  });
}

function uploadImage(req, res) {
  const userId = req.params.id;

  if (req.files) {
    console.log(req.files.image);
    const file_path = req.files.image.path;
    console.log(file_path);
    const file_split = file_path.split("\\");
    const file_name = file_split[2];
    console.log(file_name);
    const exp_split = file_name.split(".");
    const file_ext = exp_split[1];
    console.log(file_ext);
    if (userId != req.user.sub) {
      return removeFilesOfUploads(res, file_path, "No tienes permiso para actualizar los datos de usuario");
    }

    if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg" || file_ext == "gif") {
      //Actualizar documento de usuario logueado
      User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: "Error en la petición" });

        if (!userUpdated) return res.status(404).send({ message: "No se ha podido actualizar el usuario" });

        return res.status(200).send({ user: userUpdated });
      });
    } else {
      return removeFilesOfUploads(res, file_path, "Extensión no válida");
    }
  } else {
    return res.status(200).send({ message: "No se han subido archivos" });
  }
}

function removeFilesOfUploads(res, file_path, message) {
  fs.unlink(file_path, (err) => {
    return res.status(200).send({ message: message });
  });
}

function getImageFile(req, res) {
  const image_file = req.params.imageFile;
  const path_file = "./uploads/users/" + image_file;

  /*   fs.exists(path_file, (exists) => {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      res.status(200).send({ message: "No existe la imagen" });
    }
  }); */
  fs.access(path_file, fs.constants.R_OK, (err) => {
    if (err) {
      res.status(200).send({ message: "No existe la imagen" });
    } else {
      res.sendFile(path.resolve(path_file));
    }
  });
}

module.exports = {
  home,
  pruebas,
  saveUser,
  loginUser,
  getUser,
  getUsers,
  updateUser,
  uploadImage,
  getImageFile,
};
