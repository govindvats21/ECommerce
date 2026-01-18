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

app.set("trust proxy", 1);

app.use(cors({
    origin: ["https://e-commerce-frontend-ecru-tau.vercel.app", "http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// --- VERCEL FIX: DB Connection Middleware ---
// Har request par check karega ki DB connected hai ya nahi
app.use(async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (error) {
        res.status(500).json({ message: "Database connection error" });
    }
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
    res.send("VatsEcommerce API is Running...");
});

if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(`🚀 Server started at port ${port}`);
    });
}

export default app;