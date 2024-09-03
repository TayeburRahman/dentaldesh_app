const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    fullName :{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const userModel  = model("User",userSchema);

export default userModel;