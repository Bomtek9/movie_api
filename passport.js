const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Passport Local Strategy for authenticating users.
 *
 * @function
 * @name LocalStrategy
 * @memberof module:auth
 * @param {Object} options - Options for the local strategy.
 * @param {string} options.usernameField - The field name for the username.
 * @param {string} options.passwordField - The field name for the password.
 * @param {Function} verify - The verification function.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      try {
        const user = await Users.findOne({ Username: username });

        if (!user) {
          console.log("Incorrect username.");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        if (!user.validatePassword(password)) {
          console.log("Incorrect password.");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }

        console.log("Authentication successful.");
        return callback(null, user);
      } catch (error) {
        console.error(error);
        return callback(error);
      }
    }
  )
);

/**
 * Passport JWT Strategy for authenticating users using JWT.
 *
 * @function
 * @name JWTStrategy
 * @memberof module:auth
 * @param {Object} options - Options for the JWT strategy.
 * @param {Function} verify - The verification function.
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
