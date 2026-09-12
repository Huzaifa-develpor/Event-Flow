import mongoose,{ models} from "mongoose"

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
        trim:true,
    },
    
    role:{
        type:String,
        enum:["user","organizer","admin"],
        default:"user",
        required:true,
    },
   
},
{
    timestamps:true,
})

export const User = models.User || mongoose.model("User",userSchema)