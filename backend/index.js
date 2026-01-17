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

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Render/Vercel ke liye trust proxy zaroori hai
app.set("trust proxy", 1);

// CORS Configuration (Frontend URL agar production mein ho toh update karein)
app.use(
  cors({
    origin: [process.env.FRONTEND_URL,  
      "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Database Connection call
connectDb();

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// Health Check Route
app.get("/", (req, res) => {
  res.send("VatsEcommerce API is Running...");
});

// Server Start (Vercel ke liye 'app' export karna zaroori hai)
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server started at port ${port}`);
  });
}

export default app;