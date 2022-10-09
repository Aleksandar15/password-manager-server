const database = require("../database");
const jwt = require("jsonwebtoken");

const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
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
    if (user.rows.length === 0) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
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
    const deleteRefreshToken = await database.query(
      "UPDATE users SET refresh_token=$1 WHERE user_id=$2 RETURNING *",
      [[...newRefreshTokenArray], user.rows[0].user_id]
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
      domain: "alek-password-manager.netlify.app",
    });
    res.status(200).json("Successful logout");
  } catch (err) {
    res.status(500).json("Logout error");
  }
};

module.exports = { handleLogout };
