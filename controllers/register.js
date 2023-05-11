const jwt = require("jsonwebtoken");

const createSession = (user) => {
  const { id } = user;
  const token = jwt.sign({ id }, "JWT_SECRET_KEY", { expiresIn: "2 days" });
  return { success: "true", userId: id, token, user };
};

const handleRegister = (req, res, db, bcrypt) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json("incorrect form submission");
  }
  const hash = bcrypt.hashSync(password);
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            // res.json(user[0]);
            const data = createSession(user[0]);
            res.json(data);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("unable to register"));
};

module.exports = {
  handleRegister,
};
