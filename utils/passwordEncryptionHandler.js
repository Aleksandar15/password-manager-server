// PASSWORD ENCRYPTION HANDLER
// NOTE: "Password" for user's password vault

const crypto = require("crypto");
const { secretPasswordEncryption } = process.env;
// ORIGINAL: Error for LONG secret key: `RangeError: Invalid key length`: SOLUTIONS: https://stackoverflow.com/questions/50963160/invalid-key-length-in-crypto-createcipheriv
// ORIGINAL iS: `key=Buffer.from(secretPasswordEncryption)`(`key` is not even a variable but a direct usage!).
//
// const key = crypto.createHash("sha256").update(String(secretPasswordEncryption)) //Solution 1: + Use `const cipher =... Buffer.from(key)..` - BELOW!
// SOlution2: (the accepted answer): ONLY modify the `const cipher=... Buffer.from(secretPasswordEncryption, "base64"..) -> is doing `key_in_bytes conversion`=>or just set it to a new variable `key_in_bytes` & use it inside `const cipher=...`
// Lets try #2.: doesnt work -> Again same error: `RangeError: Invalid key length`.
// Lets try #1: doesnt work -> New error: `TypeError [ERR_INVALID_ARG_TYPE]: The "key" argument must be of type string or an instance of ArrayBuffer, Buffer, TypedArray, DataView, KeyObject, or CryptoKey. Received an instance of Hash`.
// const key = crypto
//   .createHash("sha256")
//   .update(String(secretPasswordEncryption));
// #1.1: -> Old error: `RangeError: Invalid key length`
// const key = crypto
//   .createHash("sha256")
//   .update(String(secretPasswordEncryption))
//   .digest("base64");
// //
// Modifications in SECRET KEY:
// #1.1: Tested: Modified secretKey to have x32 Characters: and #1.1 Still doesnt work! With old error: `RangeError: Invalid key length`.
// #2: NOT tested: DO I even need it or back to my original way, witohut a 2nd argument to the `Buffer.from()` function?
// ORIGINAL [and NOT #2]: WORKS! `Buffer.from(secretPasswordEncryption)`.

const encrypt = (password) => {
  const iv = Buffer.from(crypto.randomBytes(16));
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    // Buffer.from(secretPasswordEncryption),
    // #2 solution for `Invalid key length`:
    // Buffer.from(secretPasswordEncryption, "base64"),
    // #3: solution:
    // key,
    // Original: Back to Original
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
    // Buffer.from(secretPasswordEncryption),
    // #2 solution for `Invalid key length`:
    // Buffer.from(secretPasswordEncryption, "base64"),
    // #3: solution:
    // key,
    // Original: Back to Original
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
