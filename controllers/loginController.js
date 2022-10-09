const { jwtGenerator, jwtRefreshGenerator } = require("../utils/jwtGenerator");
const jwt = require("jsonwebtoken");
const database = require("../database");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    // 1-  destructure req.body
    const { email, password, loginForever } = req.body;

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

    const newRefreshToken = jwtRefreshGenerator(
      user.rows[0].user_id,
      expiryTime
    );

    const newRefreshTokenArray = !cookies?.refreshToken
      ? user.rows[0].refresh_token
      : user.rows[0].refresh_token.filter(
          (allRTinDB) => allRTinDB !== cookies.refreshToken
        );

    if (cookies?.refreshToken) {
      // Detect refresh token reuse
      const refreshToken = cookies.refreshToken;
      const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret, {
        ignoreExpiration: true,
      });
      const allRefreshTokens = await database.query(
        "SELECT refresh_token FROM users WHERE user_id=$1",
        [payload.user_id]
      );
      const refreshTokenExistsInDatabase =
        allRefreshTokens.rows[0].refresh_token.filter(
          (allRTinDB) => allRTinDB === refreshToken
        );

      if (refreshTokenExistsInDatabase[0] !== refreshToken) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          path: "/",
          domain: "alek-password-manager.netlify.app",
        });
        const hackedUser = await database.query(
          "UPDATE users SET refresh_token='{}' WHERE user_id=$1 RETURNING *",
          [payload.user_id]
        );
        return res
          .status(403)
          .json("Detected used refresh token in user's cookies"); //User must always have unused refresh token unless he logged out + I also shouldnt be checking against expired tokens BUT THEN `undefined!=='token'` ?->THATS SADLY TRUTHY statement and will return WRONG JSON so I Msut use an jwt.verify with a whole error and decoded HANDLERS?!
      }
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        path: "/",
        domain: "alek-password-manager.netlify.app",
      });
    }

    // Saving refreshToken with current user
    const refreshTokenDatabase = await database.query(
      "UPDATE users SET refresh_token=$1 WHERE user_id = $2 RETURNING refresh_token",
      [[...newRefreshTokenArray, newRefreshToken], user.rows[0].user_id]
    );
    // Create secure cookie with refresh token
    res.cookie("refreshToken", newRefreshToken, {
      maxAge: 60 * 1000 * 60 * 24, // 1 day
      httpOnly: true, //for Postman tests turn this off
      secure: true,
      path: "/",
      domain: "alek-password-manager.netlify.app",
      sameSite: "Strict",
    });

    // Send access token to the user
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(500).json("Login SERVER SIDE Error!");
  }
};

module.exports = { login };
