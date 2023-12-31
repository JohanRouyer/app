const User = require("../model/user.model");
const bcrypt = require("bcryptjs")


const validUsername = (req, res) => {
  User.checkUsername(req.params.us, (err, data) => {
    if (err) {
      if (err.kind == "not_found") {
        res.send({
          message: "Not Fond: " + req.params.us,
          valid: true,
        });
      } else {
        res.status(500).send({
          message: "error query: " + req.params.us,
        });
      }
    } else {
      res.send(data);
    }
  });
};

const createNewUser = (req, res) => {
  // Validate request
  if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
  }
  // Create a User
  const salt = bcrypt.genSaltSync(10);
  const userObj = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password,salt),
      img: req.body.img,
  });
  // Save User in the database
  User.create(userObj, (err, data) => {
      if (err) {
          res.status(500).send({
              message: err.message || "Some error occurred while creating the User.",
          });
      } else {
          res.send(data);
      }

      
  });
}

const login =(req,res)=>{
    if(!req.body){
      res.status(400).send({message: "content can not be empty" });
    }
    const acc = new User({
      username: req.body.username,
      password: req.body.password
    });
    User.loginModel(acc,(err, data)=>{
      if(err){
        if(err.kind == "not_found"){
          res.status(401).send({message: "Not_found " +req.body.username});
        }
        else if(err.kind == "invalid_pass" ){
          res.status(401).send({message: "Invalid password"});
        }else{
          res.status(500).send({message: "Query error."})
        }
      }else res.send(data);
    });
}

const getAllUsers= (req, res)=>{
  console.log("a")
  User.getAllRecords((err,data)=>{
    if(err){
      res.status(500).send({message: err.message || "some error occured" });
    }else res.send(data);
  });
}

const updateUserCtrl = (req, res)=>{
  if(!req.body){
    res.status(400).send({message: "Content can not be empty."});
  }
  const data = {
    fullname: req.body.fullname,
    email: req.body.email,
    img: req.body.img
  };
  User.updateUser(req.params.id, data, (err, result)=>{
    if(err){
      if(err.kind== "not_found"){
        req.status(401).send({message: "Not_found user: " + req.params.id});
      }else{
        res.status(500).send({message: "Error update user: " + req.params.id});
      };
    }else{
      res.send(result);
    };
  });
};

const deleteUser = (req, res)=>{
  User.removeUser(req.params.id, (err, result)=>{
    if(err){
      if(err.kind == "not_found"){
        res.status(401).send({message: "Not found user: " + req.params.id});
      }else{
        res.status(500).send({message: "Error delete user: " + req.params.id});
      }
    }else{
      res.send(result);
      return;
    }
  });
};

module.exports = { validUsername, createNewUser, login, getAllUsers, updateUserCtrl, deleteUser };