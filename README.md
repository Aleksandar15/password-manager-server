# Password Manager Server

#### About my Full-Stack Password Manager app:

I created this project with one of the main goal being that to challenge my web security skills. In the process I learned that while you can't control which links the frontend user clicks or which apps they may install (_that could be malicious_), we as developers should focus to minimize those risks by maximizing security steps required to access sensitive data. All that **must** be achieved by finding a sweet spot between trying to not annoy our users and securing their data.

#### Special features I implemented:

##### On the frontend

- With React I avoided any unnecessary re-renders & used strategic re-renders to my advantage for features like `multi-device` for example: _user A_ logged on '_device A_' modifies its "password vault", then the same _user A_ but logged on '_device B_' - when they try any CRUD operations on their (unrefreshed) "password vault" page - they will get the latest changes (made on _device A_) **without any refresh** on their _device B_. While also my goal was to use as minimum libraries as possible and to keep following the DRY principle by building reusable components myself & creating custom hooks.

##### On the backend

- I implemented "_refresh tokens_" which are long-lived besides "_access tokens_" which are short-lived. However I gave the clients an option to stay signed-in until they manually log out in cases where they fully trust their device & network. The user requires a valid _refresh token_ in order to request a new _access token_ - on success they get both new _accessToken_ & _refreshToken_ - while on invalid or expired _refresh token_ the user is alerted accordingly and redirected to the login page.
- Anti-hacks security: in case where the user's _refreshToken_ is not inside the database -> it means the _refreshToken_ was used by someone else (I suspect it's a hacker) and I alert the user about the potential threat.

##### The challenge

- "_Multi-device_" feature allows the _user A_ logged on _device A_ to "_log out all devices_"(meaning: empties out the array of _refreshToken_'s in the database) which will technically log-out the same _user A_ but logged on _device B_ & my "safety alert-message" about _anti-hacks_ will get triggered, therefore, the message itself has to have empathy about such a case scenario where some of their family members clicked the "_logout all devices_" button on another device as an example. It was kind of like a Catch-22 where I couldn't have a separate message and the solution was a _guided-empathetic-message_ to make sure I'm not misleading my users.

#### Visit my live website here: https://alek-password-manager.netlify.app

##### Test login user:

- E-mail: test@test.com
- Password: test

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
