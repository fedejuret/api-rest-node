'use strict'

const validator = require('validator');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const jwt = require('../services/jwt');

var controller = {

    delete: function(req, res){
      var userId = req.params.userId;
      if(req.user && req.user.role == 'ROLE_ADMIN'){
        if(req.user.sub != userId){
          if(userId && userId != null){

            User.findOne({_id: userId}, (err, user) =>{
                if(err){
                  return res.status(200).send({
                    status: 'error',
                    message: 'Error al obtener el usuario'
                  });
                }
                if(!user || user == null){
                  return res.status(200).send({
                    status: 'error',
                    message: 'No se ha encontrado el usuario'
                  });
                }else{

                  User.findOneAndRemove({_id: userId}, (err) =>{
                      if(err){
                        return res.status(200).send({
                          status: 'error',
                          message: 'Error al obtener el usuario'
                        });
                      }

                      return res.status(200).send({
                          status: 'success',
                          message: `El usuario ${user.name} fue eliminado con exito`
                      });
                  });

                }
            });

          }else{
            return res.status(200).send({
              status: 'error',
              message: 'No enviaste la ID del usuario'
            });
          }
        }else{
          return res.status(200).send({
            status: 'error',
            message: 'No puedes eliminar tu cuenta'
          });
        }
      }else{
        return res.status(200).send({
          status: 'error',
          message: 'No tienes permitido realizar esta acción'
        });
      }
    },
    save: function(req, res){


        // Response Schema
        var response = {
            message: "",
            statusCode: 200,
        };

        // get petition params
        var params = req.body;

        // validate data with <validator> module
        var validate_name = params.name != null && !validator.isEmpty(params.name);
        var validate_surname = params.surname != null && !validator.isEmpty(params.surname);
        var validate_email = params.email != null && !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = params.password != null && !validator.isEmpty(params.password);

        // Si hay un error al validar, se verá reflejado aquí
        var validatorObject = {
            name: validate_name,
            surname: validate_surname,
            email: validate_email,
            password: validate_password
        };

        if(validate_name && validate_surname && validate_email && validate_password){
            // create user object
            var user = new User();

            // asign values to user object
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'ROLE_USER';
            user.image = null;

            // check if user exists
            User.findOne({email: user.email}, (err, isSetUser) => {
                if(err) {
                    response["statusCode"] = 500;
                    response["message"] = "Error al comprobar duplicidad del usuario";
                    return res.status(response.statusCode).send(response);
                }

                if(!isSetUser){

                    // Crypt password
                    bcrypt.hash(params.password, 8, (err, hash) => {
                        user.password = hash;

                        // save in db
                        user.save((err, userStored) =>{
                            if(err) {
                                response["statusCode"] = 500;
                                response["message"] = "Error al guardar el usuario";
                                return res.status(response.statusCode).send(response);
                            }

                            if(!userStored){
                                response["statusCode"] = 500;
                                response["message"] = "Error al guardar el usuario";
                                return res.status(response.statusCode).send(response);
                            }

                            // Todo correcto, devolver
                            response["status"] = "success";
                            response["message"] = "Usuario registrado con exito";
                            response["user"] = user;
                            return res.status(response.statusCode).send(response);
                        });

                    });

                }else{
                    response["message"] = 'El email ya se encuentra registrado';
                    response["status"] = 'registered';
                    return res.status(response.statusCode).send(response);
                }
            });

        }else{
            response["message"] = "Los datos no se han validado correctamente";
            response["validatorData"] = validatorObject;
            return res.status(response.statusCode).send(response);
        }

    },

    login: function(req, res){
        // get params
        var params = req.body;

        //validate data
        var validate_email = params.email != null && !validator.isEmpty(params.email) && validator.isEmail(params.email);
        var validate_password = params.password != null && !validator.isEmpty(params.password);

        if(!validate_email || !validate_password){
            return res.status(200).send({
                status: "error",
                message: "Error al validar los datos"
            });
        }
        //find user with the same email
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {
            // if error
            if(err){
                return res.status(500).send({
                    message: "Error al intentar identificarse"
                });
            }

            if(!user){
                return res.status(200).send({
                    message: 'El email no pertenece a un usuario',
                    status: 'error'
                });
            }

            // dcrypt password
            bcrypt.compare(params.password, user.password, (err, check) =>{
                if(err){
                    return res.status(500).send({
                        message: "Error al intentar identificarse",
                        user
                    });
                }

                // if password match with email
                if(check){

                    // Generate jwt
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{

                        return res.status(200).send({
                            status: "success",
                            user
                        });
                    }

                }else{
                    return res.status(200).send({
                        message: "La contraseña no coincide",
                        status: "error"
                    });
                }


            });

        });

    },

    update: function(req, res){

        // Get put params
        var params = req.body;

        // validate data with <validator> module
        var validate_name = params.name != null && !validator.isEmpty(params.name);
        var validate_surname = params.surname != null && !validator.isEmpty(params.surname);
        var validate_email = params.email != null && !validator.isEmpty(params.email) && validator.isEmail(params.email);

        if(!validate_name || !validate_surname || !validate_email){
            return res.status(200).send({
                message: "There are not valid params"
            });
        }


        // Remove password param
        delete params.password;

        var userId = req.user.sub;

        if(req.user.email != params.email){
            User.findOne({email: params.email.toLowerCase()}, (err, user) => {
                if(err){
                    return res.status(500).send({message: "Error en el findOne"});
                }

                if(user && user.email == params.email){
                    return res.status(200).send({message: "El email ya está registrado"});
                }else{
                    User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                        if(err) return res.status(500).send({status: "error", message: "There are an error when try to update user"});

                        userUpdated.password = undefined;
                        return res.status(200).send({
                            status: 'success',
                            message: 'Profile updated successfully',
                            user: userUpdated
                        });
                    });
                }
            });
        }else{
            User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {
                if(err) return res.status(500).send({status: "error", message: "There are an error when try to update user"});

                userUpdated.password = undefined;
                return res.status(200).send({
                    status: 'success',
                    message: 'Profile updated successfully',
                    user: userUpdated
                });
            });
        }

    },

    uploadAvatar: function(req, res){

        var file_name = 'Avatar not upload';

        if(!req.files.file0){
            return res.status(404).send({message: "There not area files attached"});
        }

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        var file_name = file_split[2];
        var file_ext_split = file_name.split('\.');
        var file_extension = file_ext_split[1];

        if(file_extension != 'jpg' && file_extension != 'jpeg' && file_extension != 'png' && file_extension != 'gif' && file_extension != 'webp'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({

                    message: 'File extension not allowed, use .png, .jpg, .jpeg, .gif, .webp',
                    status: 'error'
                });
            });
        }else{

            var userId = req.user.sub;

            User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true}, (err, userUpdated) =>{

                if(err){
                    return res.status(500).send({

                        status: 'error',
                        message: 'There are an error when try to upload image in database'

                    });
                }

                // Delete password on user
                userUpdated.password = undefined;

                return res.status(200).send({

                    status: 'success',
                    user: userUpdated

                });
            });


        }

    },

    getAvatar: function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists) =>{
            if(exists){

                // Devolver imagen
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({message: 'Imagen doesent exists'});
            }
        });

    },

    getUsers: function(req, res){
        User.find().exec((err, users) => {
            if(err || !users){
                return res.status(404).send({message: 'No hay usuarios para mostrar', status: 'error'});
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if(err || !user){
                return res.status(404).send({message: 'El usuario no existe', status: 'error'});
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    },

    sendPasswordReset: function(req, res){
        var userEmail = req.params.userEmail;
        if(!userEmail){
            return res.status(200).send({
                status: 'error',
                message: 'Debes enviar el email'
            });
        }else{
            User.findOne({email: userEmail}).exec((err, user) =>{
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al ejecutar la funcion'
                    });
                }

                if(!user){
                    return res.status(200).send({
                        status: 'error',
                        message: 'No hay un usuario registrado con ese email'
                    });
                }else{
                    return res.status(200).send({
                        status: 'success',
                        message: 'Verifica el correo: '+userEmail
                    });
                }


            });
        }
    }

};

module.exports = controller;
