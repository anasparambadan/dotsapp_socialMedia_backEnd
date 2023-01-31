import mongoose from "mongoose";


const AdminSchema = mongoose.Schema(
    {
        userName:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        isAdmin:{
            type:Boolean,
            default:true
        },
        verified:{
            type:Boolean,
            default:false
        },
        profilePicture: String,
    },
    {timestamps:true}
)
const AdminModel = mongoose.model("admins",AdminSchema);
export default AdminModel;