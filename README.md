# Password Manager Server

#### About my Full-Stack Password Manager app:

I created this project with one of the main goal being that to challenge my web security skills. In the process I learned that while you can't control which links the frontend user clicks or which apps they may install (_that could be malicious_), we as developers should focus to minimize those risks by maximizing security steps required to access sensitive data. All that **must** be achieved by finding a sweet spot between trying to not annoy our users and securing their data.

#### My PERN Stack technologies:

###### Postgres DB + ExpressJS + ReactJS + NodeJS

## Run my backend project

- Clone this project.
- Navigate (cd) into your project directory.
- Run `npm install` in your command line.
- Run `npm start` in your command line.
- Visit http://localhost:3003 in your browser!
- _Optional_: you may want to connect it with my <a href="https://github.com/Aleksandar15/password-manager-frontend">frontend</a> project.

# NOTES

**1.** In order to run my full-stack app successfully on your local development by combining _this_ server & my <a href="https://github.com/Aleksandar15/password-manager-frontend">frontend</a> you may want to remove all the `domain` properties on authentication (`refreshToken`'s) cookies creation or just modify `domain`'s values to the appropriate URL your frontend runs on.

**2.** Your **`secretPasswordEncryption`** secret inside `.env` file must be of 32 bytes (which equals to 256 bits) which means it **must** be **exactly** 32 characters long.

**3.** You **must** add your frontend URL to the `allowedOrigins` file located in `config/allowedOrigins.js` directory so that CORS will allow the requests to be made to the server.

### HOW TO's

###### How to clone the project?

##### Clone with HTTPS URL: `git clone https://github.com/Aleksandar15/Password-Manager-server.git`

##### Clone with SSH URL: `git clone git@github.com:Aleksandar15/Password-Manager-server.git`

###### How to connect to the frontend?

##### Clone the frontend code from <a href="https://github.com/Aleksandar15/password-manager-frontend">here</a> & follow the instructions there.
