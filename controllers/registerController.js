const database = require("../database");
const bcrypt = require("bcrypt");
const register = async (req, res) => {
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
      "INSERT INTO users (user_name, user_email, user_password, refresh_token) VALUES ($1, $2, $3, $4) RETURNING user_name ,user_email   ,  user_id",
      [name, email, hashedPassword, []]
    );

    // 5 - Respond with success message:
    res.status(200).json("Register successful!");
  } catch (err) {
    res.status(500).json("Server Side Error Registering!");
  }
};

module.exports = { register };
