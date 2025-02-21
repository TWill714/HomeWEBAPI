const express = require("express");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

app.use(session({
  secret: "someSuperSecretKey", 
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } 
}));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

let users = [];

let likes = [
  "Dead By Daylight",
  "Hollow Knight",
  "Super Mario Galaxy",
  "Life is Strange",
  "Spiritfarer",
  "Fortnite",
  "Roblox",
  "Wizard101",
  "Phasmophobia",
  "Resident Evil"
];

function checkAuth(req, res, next) {

  if (req.session && req.session.username) {
    return next();
  }

  res.redirect("/login.html");
}

app.get("/register", (req, res) => {

  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send("Username and password are required!");
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.send("Username already exists. Please choose another.");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);


  users.push({ username, passwordHash });
  console.log("Users array:", users);


  res.redirect("/login.html");
});

app.get("/login", (req, res) => {

  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.send("User not found. Please register first.");
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.send("Incorrect password.");
  }

  req.session.username = username;

  res.redirect("/index.html");
});

app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.send("Error logging out.");
    }

    res.clearCookie("connect.sid");

    res.redirect("/index.html");
  });
});

app.post("/addLike", checkAuth, (req, res) => {
  const { newLike } = req.body;
  if (newLike && newLike.trim() !== "") {
    likes.push(newLike.trim());
  }

  res.redirect("/index.html");
});

app.post("/updateLike", checkAuth, (req, res) => {
  const { index, updatedLike } = req.body;
  if (index !== undefined && updatedLike && updatedLike.trim() !== "") {
    likes[index] = updatedLike.trim();
  }
  res.redirect("/index.html");
});

app.post("/deleteLike", checkAuth, (req, res) => {
  const { index } = req.body;
  if (index !== undefined && likes[index]) {
    likes.splice(index, 1);
  }
  res.redirect("/index.html");
});

app.get("/api/likes", (req, res) => {
  res.json(likes);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
 });
