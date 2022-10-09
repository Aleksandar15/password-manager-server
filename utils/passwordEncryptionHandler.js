// PASSWORD ENCRYPTION HANDLER
// NOTE: "Password" for user's password vault

const crypto = require("crypto");
const { secretPasswordEncryption } = process.env;

const encrypt = (password) => {
  const iv = Buffer.from(crypto.randomBytes(16));
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(secretPasswordEncryption),
    iv
  );
  const encryptedPassword = Buffer.concat([
    cipher.update(password),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("hex"),
    password: encryptedPassword.toString("hex"),
  };
};

const decrypt = (encryption) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(secretPasswordEncryption),
    Buffer.from(encryption.iv, "hex")
  );

  const decryptedPassword = Buffer.concat([
    decipher.update(Buffer.from(encryption.password, "hex")),
    decipher.final(),
  ]);

  return decryptedPassword.toString();
};

module.exports = { encrypt, decrypt };
