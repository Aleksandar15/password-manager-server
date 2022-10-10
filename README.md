# Password Manager Server

#### My PERN Stack technologies:

###### Postgres DB + ExpressJS + ReactJS + NodeJS

## Run my project

- Clone this project.
- Navigate (cd) into your project directory.
- Run `npm install` in your command line.
- Run `npm start` in your command line.
- Visit http://localhost:3003 in your browser!

# NOTES

**1.** In order to run my server successfully on your local development by combining my <a href="https://github.com/Aleksandar15/password-manager-frontend">frontend</a> you may want to remove all the `domain` properties on authentication (`refreshToken`'s) cookies creation or just modify `domain`'s values to the appropriate URL your frontend runs on.

**2.** Your **`secretPasswordEncryption`** secret inside `.env` file must be of 32 bytes (which equals to 256 bits) which means it **must** be **exactly** 32 characters long.

### HOW TO's

###### How to clone the project?

##### Clone with HTTPS URL: `git clone https://github.com/Aleksandar15/Password-Manager-server.git`

##### Clone with SSH URL: `git clone git@github.com:Aleksandar15/Password-Manager-server.git`

###### How to connect to the frontend?

##### Clone the frontend code from <a href="https://github.com/Aleksandar15/password-manager-frontend">here</a> & follow the instructions there.
