# Password Manager Server

## Feautures to be added

##### Business logic:

- Modify the refresh token creator in `refreshTokenController.js` to have dynamic expiry time based on the received and decoded refresh token instead of the current way - having fixed expiry time (of `1h`).
