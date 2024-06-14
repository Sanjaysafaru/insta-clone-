const express = require("express");
const ejs = require("ejs");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRouter = require("./routes/user.route.js");
const followRouter = require("./routes/follow.route.js");
const postRouter = require("./routes/post.route.js");
const likeRouter = require("./routes/like.route.js")
const User = require("./models/user.model.js");
const Follow = require("./models/follow.model.js");
// const { verifyJWT } = require("../middlewares/authorize.middleware.js");
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/user", userRouter);
app.use("/follow", followRouter);
app.use("/post", postRouter);
app.use("/like", likeRouter)

app.get("/", (req, res) => {
  res.render("signUp");
});
app.get("/signUp", (req, res) => {
  res.render("signUp");
});
app.get("/signIn", (req, res) => {
  res.render("signIn");
});
app.get("/home", async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.redirect("/signin");
  }
  try {
    const decodedUserInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedUserInfo._id);
    res.render("home", { user: user });
  } catch (err) {
    res.clearCookie("token");
    res.redirect("/signin");
    console.log(err);
  }
});
app.get("/home/profile", async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.redirect("/signin");
  }
  try {
    const decodedUserInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedUserInfo._id);
    res.render("profile", { user: user });
  } catch (err) {
    res.clearCookie("token");
    res.redirect("/signin");
    console.log(err);
  }
});
app.get("/home/search", async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.redirect("/signin");
  }
  try {
    const decodedUserInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedUserInfo._id);
    const otherUser = await User.findById(req.query.userId);
  res.render("searchResults", { otherUser: otherUser, user: user  });
  } catch (err) {
    res.clearCookie("token");
    res.redirect("/signin");
    console.log(err);
  }
  
});
app.get("/home/followers", async (req, res) => {
  const user = await User.findById(req.query.userId);
  res.render("followers", { user: user });
});
app.get("/home/following", async (req, res) => {
  const user = await User.findById(req.query.userId);
  res.render("following", { user: user });
});
app.get("/search/followers", async (req, res) => {
  const user = await User.findById(req.query.userId);
  res.render("followers", { user: user });
});
app.get("/search/following", async (req, res) => {
  const user = await User.findById(req.query.userId);
  res.render("following", { user: user });
});
app.get("/profile/editProfile", async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.redirect("/signin");
  }
  try {
    const decodedUserInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedUserInfo._id);
    res.render("editProfile", { user: user });
  } catch (err) {
    res.clearCookie("token");
    res.redirect("/signin");
    console.log(err);
  }
});
module.exports = { app };
