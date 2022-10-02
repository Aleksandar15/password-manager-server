const database = require("../database");
const jwt = require("jsonwebtoken");
const { jwtRefreshGenerator, jwtGenerator } = require("../utils/jwtGenerator");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    console.log("Cookies INSIDE refreshTokenController: ", cookies);
    if (!cookies?.refreshToken) {
      return res.status(401).json("Missing cookies");
    }
    const refreshToken = cookies.refreshToken;
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret, {
      ignoreExpiration: true,
    });
    console.log("payload INSIDE refreshTokenController: ", payload);
    const user = await database.query(
      "SELECT refresh_token, user_id FROM users WHERE user_id = $1",
      [payload.user_id]
    );

    const refreshTokenExistsInDatabase = user.rows[0].refresh_token.filter(
      (allRTinDB) => allRTinDB === refreshToken
    );
    if (refreshTokenExistsInDatabase[0] !== refreshToken) {
      // REUSE Detection attempt by a hacker:
      const hackedUser = await database.query(
        "SELECT user_id FROM users WHERE user_id = $1",
        [payload.user_id]
      );
      // Then, remove ALL oF THE RefreshTokenS from that user`s ID:
      const deleteRefreshToken = await database.query(
        "UPDATE users SET refresh_token='{}' WHERE user_id=$1 RETURNING *",
        [hackedUser.rows[0].user_id]
      );
      console.log("User Hacked? ~ Detected refresh token reuse attempt");
      res.cookie("isUserHacked", "isUserHacked", {
        maxAge: 60 * 1000, // 1 minute temporary cookie
        httpOnly: true,
        secure: true,
        sameSite: "None",
      });
      return res.status(403).json("Detected refresh token reuse attempt");
    }
    const newRefreshTokenArray = user.rows[0].refresh_token.filter(
      (allRTinDB) => allRTinDB !== refreshToken
    );

    // Evaluate Refresh JWT:
    jwt.verify(
      refreshToken,
      process.env.jwtRefreshSecret,
      async (err, payload) => {
        if (err) {
          //if expired
          const saveRefreshTokenArray = await database.query(
            "UPDATE users SET refresh_token=$1 WHERE user_id=$2 RETURNING *",
            [[...newRefreshTokenArray], user.rows[0].user_id]
          );
          res.cookie("expiredRefreshToken", "expiredRefreshToken", {
            maxAge: 60 * 1000, // 1 minute
            httpOnly: true,
            secure: true,
            sameSite: "None",
          });
          return res.status(401).json("Token expired");
        }

        // Refresh token was still valid
        const accessToken = jwtGenerator(user.rows[0].user_id, "5s");
        console.log("refreshTokenController CONTINUES...");

        // Have the remaining time of the token that is about to be invalidated
        const newRTexpiryTimeSeconds =
          payload.exp - Date.parse(new Date()) / 1000;
        console.log("newRTexpiryTimeSeconds: ", newRTexpiryTimeSeconds);

        // Create new refresh token
        const newRefreshToken = jwtRefreshGenerator(
          user.rows[0].user_id,
          newRTexpiryTimeSeconds
        );
        const newRefreshTokenDatabase = await database.query(
          "UPDATE users SET refresh_token=$1 WHERE user_id = $2 RETURNING user_id, refresh_token",
          [[...newRefreshTokenArray, newRefreshToken], user.rows[0].user_id]
        );
        res.cookie("refreshToken", newRefreshToken, {
          // maxAge: 60 * 1000 * 60, // 1 hour
          maxAge: 60 * 1000 * 60 * 24, // 1 day
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });

        res.status(200).json({ accessToken });
      }
    );
  } catch (err) {
    console.log("handleRefreshToken err: ", err);
    res.status(403).json(err.message);
  }
};

module.exports = { handleRefreshToken };
