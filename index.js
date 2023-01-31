 import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from 'dotenv'
import cors from 'cors'
import AuthRoute from './Routes/AuthRoute.js'
import userRoute from './Routes/userRoute.js'
import PostRoute from './Routes/PostRoute.js'
import UploadRoute from './Routes/UploadRoute.js'
import chatRoute from './Routes/chatRoute.js'
import messageRoute from './Routes/messageRoute.js'
import {createServer} from 'http'
import Socket from "./socket.js";
const app = express();

//images for public
const httpserver = createServer(app)
app.use(express.static('Public'))
app.use('/images',express.static("images"))



//MiddleWares
app.use(bodyParser.json({limit:"30mb",extended:true}))
app.use(bodyParser.urlencoded({limit:"30mb", extended:true}))
app.use(cors())
Socket(httpserver)
dotenv.config()
mongoose.connect(process.env.MONGO_DB,{useNewUrlParser: true,useUnifiedTopology: true})
.then(()=> httpserver.listen(5000, ()=> console.log('listening 5000'))).catch((error)=>console.log(Error));

//routes usage

app.use('/',AuthRoute)
app.use('/user',userRoute)
app.use('/post',PostRoute)
app.use('/upload',UploadRoute)
app.use('/chat', chatRoute)
app.use('/message', messageRoute)
