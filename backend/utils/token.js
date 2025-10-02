import jwt from "jsonwebtoken";

const genToken = (userId) => {
  try {
    return jwt.sign({userId} , process.env.Secret_KEY, { expiresIn: "10d" });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export default genToken;
