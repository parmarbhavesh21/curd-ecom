const mongoose= require("mongoose");
const bcrypt= require("bcryptjs");
const jwt =require("jsonwebtoken")
const NewSchemas=  new mongoose.Schema({

    name:String,
    email:String,
    password: String,
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

NewSchemas.methods.genrateToken=async function(){
    try {
        const token= jwt.sign({_id:this._id.toString()},process.env.KEY)
        this.tokens= this.tokens.concat({token:token})
        await this.save();
        return token;
    } catch (error) {
        resp.send("the error part"+error);
    }
}

 NewSchemas.pre("save",async function(next){
    if(this.isModified("password")){
       this.password= await bcrypt.hash(this.password,10);
    }
    next();
})
module.exports= mongoose.model("productst",NewSchemas);
