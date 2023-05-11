const express = require("express");
const cors = require("cors");
const knex = require("knex");
const bcrypt = require("bcrypt-nodejs");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "password",
    database: "smart-brain-exercises",
  },
});

const image = require("./controllers/image");
const signin = require("./controllers/signin");
const register = require("./controllers/register");
const profile = require("./controllers/profile");
const auth = require("./controllers/authorization");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Its working!!!");
});

app.post("/signin", (req, res) => {
  signin.signinAuthentication(req, res, db, bcrypt);
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.post("/imageurl", auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.put("/image", auth.requireAuth, (req, res) => {
  image.handleImage(req, res, db);
});

app.post("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});

app.get("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
