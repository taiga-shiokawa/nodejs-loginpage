const express = require("express");
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = 3000;

// MongoDB接続
mongoose
  .connect("mongodb://localhost:27017/authDemo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDBコネクションOK!!!!");
  })
  .catch((err) => {
    console.error("MongoDBコネクション失敗...", err);
  });

// ejsの使用宣言
app.set("view engine", "ejs");
app.set("views", "views");

// ミドルウェア
app.use(express.urlencoded({ extends: true }));
app.use(session({ secret: "mysecret" }));
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

// ホーム画面
app.get("/", (req, res) => {
  res.send("HOME");
});

// 新規登録画面
app.get("/register", (req, res) => {
  res.render("register");
});

// 新規登録処理
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  // const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password // モデル側でハッシュ化の処理を書いている
  });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

// ユーザー画面
app.get("/secret", requireLogin, (req, res) => {
  res.render("secret");
});

// ログイン画面
app.get("/login", (req, res) => {
  res.render("login");
});

// ログイン処理
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

// ログアウト
app.post("/logout", (req, res) => {
  // req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log("PORT3000で待受中...");
});
