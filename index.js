// Modules
const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  fs = require("fs"),
  path = require("path"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  http = require("http"),
  url = require("url");

const { check, validationResult } = require("express-validator");

// Connect Mongoose to db
// mongoose.connect("mongodb://localhost:27017/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   family: 4,
// });

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Mongoose models
const app = express(),
  Movies = Models.Movie,
  Users = Models.User;

// Init body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// only certain origins to be given access
const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://myflix-frontend-791a20b096d6.herokuapp.com",
  "https://dup-movies-18ba622158fa.herokuapp.com",
  "https://dup-movies.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application does not allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

// Authentification & Login Endpoint
let auth = require("./auth")(app); // Login HTML Authentification
const passport = require("passport"); // JWT Authentification
require("./passport");

// Setup Logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

// Logging
app.use(morgan("combined", { stream: accessLogStream }));

// Endpoints and handling functions

// Home/Index
app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

// app.get('*', (req, res) => {
//     res.sendFile('index.html', {root: 'public'});
//   });

// Documentation
app.get("/documentation", (req, res) => {
  res.sendFile("public/documentation.html", { root: __dirname });
});

// All movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Movie
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.status(201).json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Genre
app.get(
  "/movies/genres/:genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.genre })
      .then((movie) => {
        if (!movie) {
          res
            .status(400)
            .send(
              "There are no movies in the database with the genre - " +
                req.params.genre
            );
        } else {
          res.status(200).json(movie.Genre);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Director
app.get(
  "/movies/directors/:director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.director })
      .then((movie) => {
        if (!movie) {
          res
            .status(400)
            .send(
              "There are no movies in the database with the director - " +
                req.params.director
            );
        } else {
          res.status(200).json(movie.Director);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// User Register
app.post(
  "/users",
  [
    // Validation logic here for request
    check("Username (min 5)", "Username is required.").isLength({ min: 5 }),
    check(
      "Username",
      "Username Required: No spaces or special characters."
    ).isAlphanumeric(),
    check(
      "Password (min 6)",
      "Min 6 Characters Required (Alphanumeric Only)"
    ).isLength({
      min: 6,
    }),
    check("Email", "Email is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// User Info
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.username })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Update User

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    // Validation logic here for request
    check("Username", "Username is required.").isLength({ min: 5 }),
    check(
      "Username",
      "Username Required: No spaces or special characters."
    ).isAlphanumeric(),
    check("Password", "Password is required.").isLength({ min: 8 }),
    check("Email", "Email is required.").not().isEmpty(),
    check("Email", "Email does not appear to be valid.").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Condition to check added here
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    // Condition ends
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    ) // this makes sure that the updated document is returned
      // .populate('Favorite_Movies', 'Title')
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.post(
  "/users/:Username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("Received POST request at /users/:Username/favorites/:movieId");
    const movieId = req.params.movieId; // Extract movieId from the URL path

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: movieId },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get a user's favorite movies
app.get(
  "/users/:Username/favorites",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .populate("FavoriteMovies")
      .then((user) => {
        if (user) {
          res.status(200).json(user.FavoriteMovies);
        } else {
          res.status(404).send("User not found.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Favorites Remove
app.delete(
  "/users/:Username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.movieId },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Deregister
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + " was not found");
        } else {
          res.status(200).send(req.params.username + " was deleted");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.use(express.static("public"));

// General error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Borked!");
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
