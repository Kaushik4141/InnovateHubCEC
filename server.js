const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const cookieParser = require('cookie-parser');
//app.use(cookieParser());
const port = 3000;
const path = require("path");
const login = require("./src/modules/signup.js");
app.use(express.static('public'));
mongoose
  .connect("mongodb://localhost:27017/login")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/index", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  try {
    const { FullName, USN, year, email, password, confirmPassword } = req.body;
    if (email && password) {
      // Check if user already exists
      const existingUser = await login.findOne({ email: email });
      if (existingUser) {
        return res.status(400).send("User already exists. Please log in.");
      }
      // Create new user
      const user = new login({
        FullName,
        USN,
        year,
        email,
        password,
        confirmPassword,
      });
      const savedUser = await user.save();
      console.log("User saved:", savedUser);
      res.status(201).render("index", { user: savedUser });
    } else {
      res.redirect("/signup");
    }
  } catch (error) {
    console.error("Error saving user:", error);
    res.redirect("/signup");
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      // Check if user exists
      const user = await login.find({ email: email, password: password });
      if (user) {
         res.cookie('userEmail', user.email, { httpOnly: true });
        console.log("User logged in:", user);
        res.status(200).render("index", { user: user });
      } else {
        res.status(400).send("Invalid email or password. Please try again.");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.redirect("/login");
  }
});
app.get("/profile", async (req, res) => {
  const email = req.cookies.userEmail;
  if (!email) {
    return res.redirect("/login");
  }
  try {
    const user = await login.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("profile", { user });
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
