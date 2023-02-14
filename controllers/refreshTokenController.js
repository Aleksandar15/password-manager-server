const database = require("../database");
const jwt = require("jsonwebtoken");
const { jwtRefreshGenerator, jwtGenerator } = require("../utils/jwtGenerator");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.status(401).json("Missing cookies");
    }
    const refreshToken = cookies.refreshToken;
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
      domain: "alek-password-manager.netlify.app",
    });

    const payload = jwt.verify(refreshToken, process.env.jwtRefreshSecret, {
      ignoreExpiration: true,
    });
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
      res.cookie("isUserHacked", "isUserHacked", {
        maxAge: 60 * 1000, // 1 minute temporary cookie
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      return res.status(403).json("Detected refresh token reuse attempt");
    }

    // Invalidate the received valid refresh token & Goal: deliver new refreshToken + accessToken

    // Here just filter out the "used" 1 refreshToken (received from client-side)
    // from the Array of all the refresh tokens found in the database associated with the user
    // & below "invalidate" (remove) it (from database)
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
          // Even if expired => Still remove it from the database
          const saveRefreshTokenArray = await database.query(
            "UPDATE users SET refresh_token=$1 WHERE user_id=$2 RETURNING *",
            [[...newRefreshTokenArray], user.rows[0].user_id]
          );
          res.cookie("expiredRefreshToken", "expiredRefreshToken", {
            maxAge: 60 * 1000, // 1 minute
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
          });
          return res.status(401).json("Token expired");
        }

        // Refresh token was still valid => Create new accessToken with short expiry time
        // Goal is accessToken to be used only in a single 1 request (hence the short expiry)
        const accessToken = jwtGenerator(user.rows[0].user_id, "5s");

        // Grab the remaining time of the "valid" (non-expired) refresh token 'refreshToken'
        // that is about to be "invalidated" (removed from Database) because
        // it was used to create (new) 'accessToken' for response to the frontend's interceptors.
        // And exchange it with new refresh token 'newRefreshToken' && Add it to Database
        const newRTexpiryTimeSeconds =
          payload.exp - Date.parse(new Date()) / 1000;

        // Create new refresh token
        const newRefreshToken = jwtRefreshGenerator(
          user.rows[0].user_id,
          newRTexpiryTimeSeconds
        );
        // "Invalidate" old ("used") refreshToken
        // by adding the *filtered* array containing the rest of refresh tokens related to the user
        // && Add the newRefreshToken to Database
        const newRefreshTokenDatabase = await database.query(
          "UPDATE users SET refresh_token=$1 WHERE user_id = $2 RETURNING user_id, refresh_token",
          [[...newRefreshTokenArray, newRefreshToken], user.rows[0].user_id]
        );
        res.cookie("refreshToken", newRefreshToken, {
          // maxAge: 60 * 1000 * 60, // 1 hour
          maxAge: 60 * 1000 * 60 * 24, // 1 day
          httpOnly: true,
          secure: true,
          path: "/",
          domain: "alek-password-manager.netlify.app",
          sameSite: "Strict",
        });
        res.status(200).json({ accessToken });
      }
    );
  } catch (err) {
    res.status(403).json(err.message);
  }
};

module.exports = { handleRefreshToken };
