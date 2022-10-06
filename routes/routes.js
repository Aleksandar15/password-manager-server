const express = require("express");
const router = express.Router();

const validInfo = require("../middlewares/validinfo");

const database = require("../database");

const bcrypt = require("bcrypt");

const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middlewares/authorization");

// ROUTES \\

//Register
router.post("/register", validInfo, async (req, res) => {
  try {
    //1- Destructure req.body
    const { name, email, password } = req.body;

    //2- Check if email already exists on datebase
    const user = await database.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (user.rows.length !== 0) {
      return res
        .status(401)
        .json("User by that E-MAIL already exist in our database!");
    }

    //3- Hash their password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    //4- Save the user to the database

    const newUser = await database.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING user_name ,user_email   ,  user_id",
      [name, email, hashedPassword]
    );

    //5- Create a Token for them
    const token = jwtGenerator(newUser.rows[0].user_id);

    res.status(200).json({ token });
  } catch (err) {
    console.log("REGISTER Server Side Error: ", err.message);
    console.log("REGISTER Server Side err: ", err);
    res.status(500).json("Server Side Error Registering!");
  }
});

//Login
router.post("/login", validInfo, async (req, res) => {
  try {
    // 1-  destructure req.body
    const { email, password } = req.body;

    // 2- check if user exists by its EMAIL
    const user = await database.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json("Email/password combinations is wrong");
    }

    // 3- check if their password matches the database hashed password
    const match = await bcrypt.compare(password, user.rows[0].user_password);
    if (!match) {
      return res.status(401).json("Email/password combinations is wrong");
    }

    // 4 - handle them the token if all above passes
    const token = jwtGenerator(user.rows[0].user_id);

    res.status(200).json({ token });
  } catch (err) {
    console.log("Login Server ERror: ", err.message);
    res.status(500).json("Login SERVER SIDE Error!");
  }
});

router.get("/is-verify", authorization, async (req, res) => {
  res.status(200).json(true);
});

// router.delete('/logout', )

module.exports = router;
