const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");

const db = "mongodb://localhost:27017/Instagram";

const middlewares = require("./Middlewares");

const server = express();

const UserRouter = require("./endPoints/Users");

const PostRouter = require("./endPoints/Posts");

const FriendReqRouter = require("./endPoints/Freinds");

const Users = require("./models/User");

//Server use global middlewares

server.use(bodyParser.json());
server.use(
  cors({
    origin: true,
    credentials: true
  })
);

server.use(
  session({
    secret: "sumit choudhary",
    resave: false,
    saveUninitialized: false
  })
);

const PORT = process.env.PORT || 5000;

//validate user , but exempt './signup' and 'sigin'

server.use((req, res, next) => {
  if (req.originalUrl === "/signin" || req.originalUrl === "/signup")
    return next();

  return middlewares.validateUser(req, res, next);
});

//using bcrypt to hash plain password and save hashed password to database

server.post("/signup", (req, res) => {
  bcrypt.hash(req.body.password, 11, (err, hash) => {
    if (err) {
      res.status(422).json({ error: err });
    } else {
      const newUser = req.body;
      newUser.password = hash;
      Users.create(newUser)
        .then(result => res.status(201).json({ success: true }))
        .catch(err => console.log(err));
    }
  });
});

//when user try to login , check the password first

server.post("/signin", (req, res) => {
  const { email } = req.body;
  Users.findOne({ email })
    .then(user => {
      const hashedPW = user.password;
      bcrypt
        .compare(req.body.password, hashedPW)
        .then(result => {
          if (!result) throw new Error();
          req.session.email = email;
          req.user = user;
          delete req.user.password;
          res.json({ success: true, user: req.user });
        })
        .catch(err =>
          res.json({ message: "Failed when comparing password", err })
        );
    })
    .catch(err =>
      res.json({ message: "Error happens when try to sign you in", err })
    );
});

//Using Routers
server.use("/users", UserRouter);
server.use("/posts", PostRouter);
server.use("/friends", FriendReqRouter);

//Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose
  .connect(db, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

mongoose.set("useCreateIndex", true);

server.listen(PORT, () => console.log(`server listen on ${PORT}`));
