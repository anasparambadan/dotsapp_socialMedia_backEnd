import mongoose from "mongoose";

const ReportSchema = mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref:"Posts"
    },
    users: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          required: true,
          ref:"users"
        },
        desc:{
          type:String
        }
      },
    ],
  },
  { timestamps: true }
);

const ReportModel = mongoose.model("Reports", ReportSchema);
export default ReportModel;