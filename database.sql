CREATE DATABASE password_manager;

CREATE extension IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
  user_id uuid DEFAULT
  uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id)
);

CREATE TABLE passwords(
  password_id SERIAL,
  user_id UUID,
  site_name VARCHAR(255) NOT NULL,
  site_email VARCHAR(255) NOT NULL,
  site_password VARCHAR(255) NOT NULL,
  site_iv VARCHAR(255) NOT NULL,
  PRIMARY KEY (password_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ADDED new Column refresh_token
ALTER TABLE users ADD refresh_token VARCHAR(255)[];

-- Tests
-- insert fake users
INSERT INTO users (user_name, user_email, user_password) VALUES ('ALEK', 'alek@gmail.com', 'password');

-- insert dummy passwords vault info:
INSERT INTO passwords (user_id, site_name, site_email, site_password, site_iv) VALUES ('fake-user-id-1', 'instagram.com', 'alek@gmail.com', 'encypted-password', 'encrypted-iv') RETURNING *;

-- Modify 'refresh_token' array
UPDATE users SET refresh_token='{jwt-token}' WHERE user_email='alek@gmail.com'; -- Add refresh_token to database
UPDATE users SET refresh_token='{}' WHERE refresh_token=$1; -- Empty out the 'refresh_token' array for logoutAllController.js

-- Get all* user's info of all users by a matching KEY user_id:
SELECT * FROM users LEFT JOIN passwords ON users.user_id = passwords.user_id ORDER BY password_id ASC;
-- Get all* user's info of a particuler user by user_id:
SELECT * FROM users LEFT JOIN passwords ON users.user_id = passwords.user_id WHERE users.user_id='fake-user-id-1' ORDER BY password_id ASC;
-- *Either all or particular data based on needs

-- REMINDER COMMANDS:
-- \l -- all databases
-- \c password_manager -- connect to database
-- \x off -- Expanded display ON or OFF
-- \dt
-- \d+ users
-- \d+ passwords
-- CREATE extension IF NOT EXISTS "uuid-ossp"; -- install uuid inside postgres database

-- -- MIGHT ADD:
-- ON DELETE CASCADE -- is required to the FOREGIN KEY -> would allow to delete the referencing rows ('passwords' table) if I were to `DELETE FROM users WHERE user_id=$1`, 
-- otherwise will fail if there is any data in `passwords` table by the matching 'user_id'.
-- Use-case scenario: if user wants to delete their account - their 'passwords vault' should also be removed.



-- Modify constraints without dropping table 'passwords'
-- for when table 'passwords' contains data & we want to retain the data + also add new constraints:
-- ALTER TABLE passwords DROP CONSTRAINT passwords_user_id_fkey, ADD CONSTRAINT passwords_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;