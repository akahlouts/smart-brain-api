const jwt = require("jsonwebtoken");

const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => user[0])
          .catch((err) => res.status(400).json("unable to get user"));
      } else {
        return Promise.reject("wrong credentials");
      }
    })
    .catch((err) => err);
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return jwt.verify(authorization, "JWT_SECRET_KEY", (err, decoded) => {
    if (err || !decoded) {
      return res.status(401).send("Unauthorized");
    }
    return res.json({ id: decoded.id });
  });
};

const createSession = (user) => {
  const { id } = user;
  const token = jwt.sign({ id }, "JWT_SECRET_KEY", { expiresIn: "2 days" });
  return { success: "true", userId: id, token, user };
};

const signinAuthentication = (req, res, db, bcrypt) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignin(req, res, db, bcrypt)
        .then((data) =>
          data.id && data.email
            ? createSession(data)
            : Promise.reject("wrong credentials")
        )
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  signinAuthentication,
};
