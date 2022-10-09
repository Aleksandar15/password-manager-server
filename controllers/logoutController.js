const database = require("../database");
const jwt = require("jsonwebtoken");

const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      console.log("Missing cookies INSIDE logoutController.js");
      return res.status(401).json("Missing cookies - logout");
    }
    const refreshToken = cookies.refreshToken;

    // Is refreshToken in database?
    const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret, {
      ignoreExpiration: true,
    });
    const user = await database.query(
      "SELECT user_id, refresh_token FROM users WHERE user_id = $1",
      [payload.user_id]
    );
    console.log("user.rows[0] INSIDE logoutController", user.rows[0]);
    console.log("refreshToken INSIDE logoutController.js: ", refreshToken);
    if (user.rows.length === 0) {
      console.log("User doesn't have cookies INSIDE logoutController.js");
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
      return res
        .status(204)
        .json("User not found by that refreshToken - logout"); ///User himself replaced it with wrong refreshToken in Devtools
    }

    // Delete refreshToken if it exists in database:
    const newRefreshTokenArray = user.rows[0].refresh_token.filter(
      (allRTinDB) => allRTinDB !== refreshToken
    );
    console.log(
      "user.rows[0].refresh_token INSIDE logoutController: ",
      user.rows[0].refresh_token
    );
    const deleteRefreshToken = await database.query(
      "UPDATE users SET refresh_token=$1 WHERE user_id=$2 RETURNING *",
      [[...newRefreshTokenArray], user.rows[0].user_id]
    );
    console.log(
      "deleteRefreshToken.rows[0] INSIDE logoutController.js: ",
      deleteRefreshToken.rows[0]
    );

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
    console.log("Successful logout");
    res.status(200).json("Successful logout");
  } catch (err) {
    console.log("handleLogout err: ", err);
    res.status(500).json("Logout error");
  }
};

module.exports = { handleLogout };
