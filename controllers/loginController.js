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

    // console.log("user.rows[0].refreshToken: ", user.rows[0].refreshToken); //wrong log!
    // console.log("user.rows[0].refresh_token: ", user.rows[0].refresh_token);
    console.log(
      "user.rows[0].refresh_token INSIDE loginController: ",
      user.rows[0].refresh_token
    );
    const newRefreshTokenArray = !cookies?.refreshToken
      ? user.rows[0].refresh_token
      : user.rows[0].refresh_token.filter(
          (allRTinDB) => allRTinDB !== cookies.refreshToken
        );

    console.log(
      "cookies?.refreshToken: ",
      cookies?.refreshToken,
      "cookies.refreshToken: ",
      cookies.refreshToken,
      "cookies INSIDE loginController: ",
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
          // sameSite: "None",
          secure: true,
          // Clear new types of cookies:
          sameSite: "Strict",
          // 3:since #2 doesnt work/doesnt remove cookies refreshToken:
          path: "/",
          domain: "alek-password-manager.netlify.app",
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
        // sameSite: "None",
        secure: true,
        // Clear new types of cookies:
        sameSite: "Strict",
        // 3:since #2 doesnt work/doesnt remove cookies refreshToken:
        path: "/",
        domain: "alek-password-manager.netlify.app",
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
      // sameSite: "None",
      // 2:
      // sameSite: "Lax",
      // domain: "alek-password-manager.netlify.app",
      // domain: "www.alek-password-manager.netlify.app",  //NEW: modified `WWW.` to the start of the url -> chrome scracthed "https" as potentially site is trying to hack me + uses `HSTS` + I am trying to write `WWW.` ONLY After Setting new jwtSecret's so IDK when and why it happened & what triggered it! //OLD~>//no changes
      path: "/",
      // 3: including #2, but:
      // sameSite: "None", //doesnt work (as #2 doesnt.)
      // sameSite: "Lax",
      // 4:
      // domain: "https://password-manager.fly.dev",
      // 5:
      // domain: "password-manager.fly.dev",
      // 6:
      // sameSite: "None",
      domain: "alek-password-manager.netlify.app",
      // 7:(not yet tested)
      // sameSite: "Lax",
      // 8:for tests
      sameSite: "Strict",
    });

    res.cookie("testCookie", "testCookie");

    // Send access token to the user
    res.status(200).json({ accessToken });
  } catch (err) {
    console.log("Login Server ERror: ", err.message);
    res.status(500).json("Login SERVER SIDE Error!");
  }
};

module.exports = { login };
