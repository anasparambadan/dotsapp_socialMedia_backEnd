import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    userId: {
        type: String,
        reqired: true
    },
    isRemoved:{
        type:Boolean,
        default:false
    },
    desc: String,
    likes: [],
    image: String,
    comment: [
        {
            userComment: String,
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users"
            },
            createdAt: Date

        }
    ],
},
    {
        timestamps: true
    });

var PostModel = mongoose.model("Posts", postSchema)
export default PostModel