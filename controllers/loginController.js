const { jwtGenerator, jwtRefreshGenerator } = require("../utils/jwtGenerator");
const jwt = require("jsonwebtoken");
const database = require("../database");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    // 1-  destructure req.body
    const { email, password, loginForever } = req.body;

    console.log("req.body LOGIN::::::::", req.body);
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

    // 4- handle them the token if all above passes
    const cookies = req.cookies;
    const accessToken = jwtGenerator(user.rows[0].user_id, "5s");
    const expiryTime = loginForever ? "999 years" : "1h";
    // const expiryTime = loginForever ? "999 years" : "7s";
    console.log("expiryTime ~~~~~ INSIDE /login: ", expiryTime);

    const newRefreshToken = jwtRefreshGenerator(
      user.rows[0].user_id,
      expiryTime
      // "1s"
    );

    console.log("user.rows[0].refreshToken: ", user.rows[0].refreshToken);
    const newRefreshTokenArray = !cookies?.refreshToken
      ? user.rows[0].refresh_token
      : user.rows[0].refresh_token.filter(
          (allRTinDB) => allRTinDB !== cookies.refreshToken
        );

    console.log(
      "cookies?.refreshToken: ",
      cookies?.refreshToken,
      "cookies: ",
      cookies
    );

    console.log(
      "newRefreshTokenArray: ",
      newRefreshTokenArray,
      "+ [...newRefreshTokenArray]: ",
      [...newRefreshTokenArray],
      "+ ...newRefreshTokenArray: ",
      ...newRefreshTokenArray
    );

    if (cookies?.refreshToken) {
      // Detect refresh token reuse
      const refreshToken = cookies.refreshToken;
      const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret, {
        ignoreExpiration: true,
      });
      console.log("payload: ", payload);
      const allRefreshTokens = await database.query(
        "SELECT refresh_token FROM users WHERE user_id=$1",
        [payload.user_id]
      );
      console.log("allRefreshTokens.rows[0]: ", allRefreshTokens.rows[0]);
      const refreshTokenExistsInDatabase =
        allRefreshTokens.rows[0].refresh_token.filter(
          (allRTinDB) => allRTinDB === refreshToken
        );

      if (refreshTokenExistsInDatabase[0] !== refreshToken) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        const hackedUser = await database.query(
          "UPDATE users SET refresh_token='{}' WHERE user_id=$1 RETURNING *",
          [payload.user_id]
        );
        console.log("hackedUser on /login endpoint: ", hackedUser.rows[0]);
        return res
          .status(403)
          .json("Detected used refresh token in user's cookies"); //User must always have unused refresh token unless he logged out + I also shouldnt be checking against expired tokens BUT THEN `undefined!=='token'` ?->THATS SADLY TRUTHY statement and will return WRONG JSON so I Msut use an jwt.verify with a whole error and decoded HANDLERS?!
      }
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // Saving refreshToken with current user
    const refreshTokenDatabase = await database.query(
      "UPDATE users SET refresh_token=$1 WHERE user_id = $2 RETURNING refresh_token",
      [[...newRefreshTokenArray, newRefreshToken], user.rows[0].user_id]
    );
    console.log(
      "refreshTokenDATABASE Inside /login: ",
      refreshTokenDatabase.rows[0]
    );
    // Create secure cookie with refresh token
    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 60 * 1000 * 60 * 24, // 1 day
      httpOnly: true, //for Postman tests turn this off
      secure: true,
      sameSite: "None",
    });

    // Send access token to the user
    res.status(200).json({ accessToken });
  } catch (err) {
    console.log("Login Server ERror: ", err.message);
    res.status(500).json("Login SERVER SIDE Error!");
  }
};

module.exports = { login };
