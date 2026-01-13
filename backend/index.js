import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import http from 'http'
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
dotenv.config();

const app = express();
const server = http.createServer(app)
const io = new Server(server,{
   cors:{
    origin: "https://ecommerce-frontend-xvn3.onrender.com",
    credentials: true,
    methods:["POST", "GET"]
  }
})

app.set("io",io)

const port = process.env.PORT;

app.use(
  cors({
    origin: "https://ecommerce-frontend-xvn3.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);





socketHandler(io)

server.listen(port, () => {
  connectDb();
  console.log(`server started at port ${port}`);
});
