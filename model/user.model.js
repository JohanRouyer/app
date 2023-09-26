const sql = require("../model/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const scKey = require("../config/jwt.config");
const expireTme = "2h";
const fs = require("fs");

const User = function (user) {
  this.fullname = user.fullname;
  this.email = user.email;
  this.username = user.username;
  this.password = user.password;
  this.img = user.img;
};

User.checkUsername = (username, result) => {
  sql.query(
    "SELECT * FROM users WHERE username='" + username + "'",
    (err, res) => {
      if (err) {
        console.log("Error: " + err);
        result(err, null);
        return;
      }

      if (result.length) {
        console.log("Found username:" + res[0]);
        result(null, res[0]);
        return;
      }
      result({ kind: "not_found" }, null);
    }
  );
};

User.create = (newUser,result)=>{
  sql.query("Insert INTO users SET ?", newUser, (err, res)=>{
  if(err){
      console.log("Querry error", err);
      result(err,null);
      return;
  }
  const token = jwt.sign({id:res.insertId},scKey.secret,{expiresIn: expireTme});
  result(null,{id:res.insertId, ...newUser, accesToken: token});
  console.log(null,{id: res.insertId, ...newUser, accessToken: token}); 
  });

};

User.login = (username, password, result)=>{
  sql.query("SELECT * FROM users WHERE username = '"+ username+"' AND Password = '"+password+"'",(err,res)=>{
  if(err){
    console.log("Querry error: ",err);
    result(err,null);
    return;
  }
  if(res.length){
    const token = jwt.sign({id: res[0].id},scKey.secret,{expiresIn: expireTme});
    console.log("found user: ", {id: res[0].id, ...res[0], accesToken: token});
    result(null, {id: res[0].id, ...res[0], accesToken: token});
    return; 
  }
  result({kind: "not_found"},null);
  });
}

User.loginModel = (account, result)=>{
  sql.query("SELECT * FROM users WHERE username=?", [account.username], (err, res)=>{
    if(err){
      console.log("err : " +err);
      result(err,null);
      return;
    }
    if(res.length){
        const validPassword = bcrypt.compareSync(account.password,res[0].password);
        if(validPassword){
          const token = jwt.sign({id: res.insertId},scKey.secret, {expiresIn: expireTme})
          console.log("login success. token was generated : "+ token);
          res[0].accesToken = token;
          result(null, res[0]);
          return;
        }else{
          console.log("Password not match");
          result({kind: "invalid_pass"},null)
          return;
        }
    }
    result({kind: "not_found"},null );
  })
};

User.getAllRecords = (result)=>{
  sql.query("SELECT * FROM users", (err,res)=>{
    if(err){
      console.log("Query error: "+ err);
      result(err,null);
      return;
    }else{
      result(null,res);
      return;
    }
  });
}
const removeOldImage = (id, result) =>{
    sql.query("SELECT * FROM users WHERE id=?", [id], (err, res)=>{
        if(err){
          console.log("error: " + err);
          result(err, null);
          return;
        }
        if(res.length){
          let filePath = __basedir + "/assets/" + res[0].img;
          try{
              if(fs.existsSync(filePath)){
                fs.unlink(filePath, (e)=>{
                  if(e){
                    console.log("Error: " + e);
                    return;
                  }else{
                    console.log("File: "+ res[0].img + " was removed.");
                    return;
                  }
                });
              }else{
                console.log("File: " + res[0].img + " Not Found.");
                return;
              }
          }catch(error){
            console.log(error);
          }
        }
    });
};
User.updateUser = (id, data, result)=>{
    removeOldImage(id);
    sql.query("UPDATE users SET fullname=?, email=?, img=? WHERE id=?", [data.fullname, data.email, data.img, id], (err, res)=>{
        if(err){
          console.log("Error: " + err);
          result(err, null);
          return;
        }
        if(res.affectedRows == 0){
          result({kind: "not_found"},null);
          return;
        }
        console.log("Update user: "+{id: id, ...data});
        result(null,{id: id, ...data});
        return;
    });
};

User.removeUser= (id, result)=>{
  removeOldImage(id);
  sql.query("DELETE FROM users WHERE id=?", [id], (err, res)=>{
      if(err){
        console.log("Query error" + err);
        result(err, null);
        return;
      }
      if(res.affectedRows == 0){
        result({kind: "not_found"}, null);
        return;
      }
      console.log("Deleted user id:" +id);
      result(null, {id: id});
  });
};

module.exports = User;
