import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // Header check karo, fir cookie
    const authHeader = req.headers.authorization;
    let token = (authHeader && authHeader.startsWith("Bearer")) 
                ? authHeader.split(" ")[1] 
                : req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Login required: Token not found" });
    }

 
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

    if (!verifyToken) {
      return res.status(401).json({ message: "Invalid Token: Verification failed" });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Session expired, please login again" });
  }
};

export default isAuth;