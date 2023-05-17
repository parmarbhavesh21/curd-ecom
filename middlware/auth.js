const jwt = require("jsonwebtoken");
const NewSchemas = require("../models/mschema")
const auth= async (req,resp,next)=>{
    try {
        const token= req.cookies.jwt;
        const verifyuser= jwt.verify(token,process.env.KEY)
        console.log("userverify>>>>>>>>",verifyuser);
        const user= await NewSchemas.findOne({_id:verifyuser.id})
        console.log("user findeone>>>>>>>",user);
        console.log("user findeone>>>>>>>",user.name);
        next();
    } catch (error) {
        resp.status(401).send(error)
    }
}
module.exports=auth;