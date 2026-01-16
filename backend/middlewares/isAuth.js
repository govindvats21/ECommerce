import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // 1. Pehle Authorization Header check karein (Bearer Token)
    // 2. Agar wo na mile toh Cookies check karein
    const authHeader = req.headers.authorization;
    let token = (authHeader && authHeader.startsWith("Bearer")) 
                ? authHeader.split(" ")[1] 
                : req.cookies.token;

    // Agar dono jagah token nahi hai
    if (!token) {
      return res.status(401).json({ message: "token is not found" });
    }

    // Token verify karein
    const verifyToken = jwt.verify(token, process.env.Secret_KEY);

    if (!verifyToken) {
      return res.status(401).json({ message: "token is not verified" });
    }

    // User ID ko request mein save karein
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuth;