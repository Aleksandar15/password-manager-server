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

-- insert fake passwords info:
INSERT INTO passwords (user_id, site_name, site_email, site_password, site_iv) VALUES ('fake-user-id-1', 'instagram.com', 'alek@gmail.com', 'encypted-password', 'encrypted-iv') RETURNING *;

-- Modify refresh_token
UPDATE users SET refresh_token='{jwt-token}' WHERE user_email='alek@gmail.com'; -- Add refresh_token to database
UPDATE users SET refresh_token='{}' WHERE refresh_token=$1; -- Remove refresh_token for logoutController.js

-- Get all* user's info of all users by a matching KEY user_id:
SELECT * FROM users LEFT JOIN passwords ON users.user_id = passwords.user_id ORDER BY password_id ASC;
-- Get all* user's info of a particuler user by user_id:
SELECT * FROM users LEFT JOIN passwords ON users.user_id = passwords.user_id WHERE users.user_id='fake-user-id-1' ORDER BY password_id ASC;
-- *Modify based on needs

-- REMINDER COMMANDS:
-- \l -- all databases
-- \c password_manager -- connect to database
-- \x off -- Expanded display ON or OFF
-- \dt
-- \d+ users
-- \d+ passwords
-- CREATE extension IF NOT EXISTS "uuid-ossp"; -- install uuid inside postgres database