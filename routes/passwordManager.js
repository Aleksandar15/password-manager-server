const database = require("../database");
const express = require("express");
const authorization = require("../middlewares/authorization");
const router = express.Router();

const { encrypt, decrypt } = require("../utils/passwordEncryptionHandler");

// GET passwords vault
router.get("/manager", authorization, async (req, res) => {
  try {
    //req.user===payload.user_id FROM Authorization middleware
    const user = await database.query(
      "SELECT users.user_name, users.user_email, passwords.password_id, passwords.site_name, passwords.site_email, passwords.site_password, passwords.site_iv FROM users LEFT JOIN passwords on users.user_id=passwords.user_id WHERE users.user_id = $1 ORDER BY password_id ASC",
      [req.user]
    );

    res.status(200).json(user.rows);
  } catch (err) {
    res.status(500).json("passwordManager SERVER SIDE ERROR");
  }
});

// Show stored password / Decrypt the Encrypted Password
router.post("/manager/decryptpassword/:id", authorization, async (req, res) => {
  try {
    const passwordAndIv = await database.query(
      "SELECT site_password, site_iv FROM passwords WHERE password_id = $1 AND user_id = $2",
      [req.params.id, req.user]
    );

    if (passwordAndIv.rows.length === 0) {
      return res.json("This DATA doesn't belong to you");
    }
    const { site_password: password, site_iv: iv } = passwordAndIv.rows[0];
    res.status(200).json(decrypt({ password, iv }));
  } catch (err) {
    res.status(404).json("ERROR Decrypting Password");
  }
});

// CREATE Password Info
router.post(`/passwords`, authorization, async (req, res) => {
  try {
    const {
      website: site_name,
      email: site_email,
      password: site_password,
    } = req.body;
    const encryptedPassword = encrypt(site_password);
    const { password: site_pw_encrypted, iv: site_pw_iv } = encryptedPassword;
    const addPassword = await database.query(
      "INSERT INTO passwords (user_id, site_name, site_email, site_password, site_iv) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user, site_name, site_email, site_pw_encrypted, site_pw_iv]
    );

    res.json(passwordInfo.rows[0]);
  } catch (err) {
    res.status(500).json("addPassword SERVER SIDE ERROR");
  }
});

// UPDATE Password's Info
router.put("/passwords/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      website: site_name,
      email: site_email,
      password: site_password,
    } = req.body;
    const encryptedPassword = encrypt(site_password);
    const { password: site_pw_encrypted, iv: site_pw_iv } = encryptedPassword;
    const updateStoredPassword = await database.query(
      "UPDATE passwords SET site_name = $1, site_email = $2, site_password=$3, site_iv=$4 WHERE password_id = $5 AND user_id = $6 RETURNING *",
      [site_name, site_email, site_pw_encrypted, site_pw_iv, id, req.user]
    );

    if (updateStoredPassword.rows.length === 0) {
      return res.json("This DATA doesn't belong to you");
    }

    res.status(200).json("Password INFO was UPDATED!");
  } catch (err) {
    res.status(500).json("UPDATE password vault: SERVER SIDE ERROR");
  }
});

//DELETE Password Info
router.delete("/passwords/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const deletePassword = await database.query(
      "DELETE FROM passwords WHERE password_id = $1 AND user_id = $2 RETURNING *",
      [id, req.user]
    );
    if (deletePassword.rows.length === 0) {
      return res.json("This DATA doesn't belong to you");
    }

    res.json("Password was deleted!");
  } catch (err) {
    res.status(500).json("deletePassword SERVER SIDE ERROR");
  }
});

module.exports = router;
