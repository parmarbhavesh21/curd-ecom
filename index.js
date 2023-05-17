require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyparser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt =require("jsonwebtoken");
const cookiparser= require('cookie-parser')
const auth= require('./middlware/auth')

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Detas", {
    useNewUrlparser: true,
    useUniFiedTopology: true
}).then(() => {
    console.log("mongoose connect");
}).catch((err) => {
    console.log("mongoose not connect", err);
})
const NewSchemas = require('./models/mschema')

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json());


console.log(process.env.KEY);
app.get("/coki",auth, (req, resp) => {
    console.log(`this is the cookies awesome  ${req.cookies.jwt}`);
    resp.render("coki")
})
app.get("/", (req, resp) => {
    resp.render("home")
})
app.post("/home", async (req, resp) => {
    let deta = new NewSchemas({

        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })
    const token= await deta.genrateToken();
    resp.cookie('jwt',token,{
        expires:new Date(Date.now() +50000),
        httpOnly:true
    })
await deta.save();
resp.send(deta)
})

app.get("/login", (req, resp) => {
    resp.render("login")
})
app.post("/login",async(req,resp)=>{
    const email= req.body.email;
    const password= req.body.password;
    const userinfo= await NewSchemas.findOne({email:email})
    const ismatch= await bcrypt.compare(password,userinfo.password)
    const token= await userinfo.genrateToken();
    console.log("post login token part",token);

    if(ismatch){
        resp.send("data match")
    }else{
        resp.status(500).send("not match")
    }
})
app.get("/display",async(req,resp)=>{
    await NewSchemas.find({})
    .then((result)=>{
resp.render("display.ejs",{details:result})
    }).catch((error)=>{
    resp.status(500).send(error);
    })
})


app.get("/delete/:id",async(req,resp)=>{
await NewSchemas.findByIdAndDelete(req.params.id)
resp.redirect("/display")
})

app.get ("/update/:id",async (req,resp)=>{
  await NewSchemas.findById (req.params.id)
  .then ((result)=>{
resp.render("update.ejs",{details:result})
  }).catch((error)=>{
    resp.status(500).send("INput not match")
  })

})
app.post("/update/:id",async (req,resp)=>{
   let data= await NewSchemas.findById (req.params.id)
   if(data && data.password !== req.body.password){
    req.body.password= await bcrypt.hash(req.body.password,10)
   }
   await NewSchemas.findByIdAndUpdate(req.params.id,req.body)
   resp.redirect("/display")
})




app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})