const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send("Unauthorized");
  }
  return jwt.verify(authorization, "JWT_SECRET_KEY", (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).send("Unauthorized");
    }
    return next();
  });
};

module.exports = {
  requireAuth,
};
