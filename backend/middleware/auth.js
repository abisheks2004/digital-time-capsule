const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id }; // store user id in req.user
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
}

module.exports = auth;
