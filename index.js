const express = require("express"),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const morgan = require("morgan");
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Directors;

mongoose.connect('mongodb://127.0.0.1:27017/cfDB', { 
  useNewUrlParser: true, useUnifiedTopology: true});


const fs = require("fs");
const path = require("path");
const {request} = require("http");


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
  


// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//setup the logger
// app.use(morgan("common"));
app.use(morgan("combined", { stream: accessLogStream }));

//shortcut so i dont have to res.send() all files in the public folder (right now just documentation.html)
app.use(express.static("public"));



  
  //Return a list of ALL movies to the user;
  app.get("/movies",
    passport.authenticate("jwt", { session: false }),
    async (request, response) => {
      await Movies.find({})
        .then((movies) => {
          return response.status(201).json(movies);
        })
        .catch((err) => {
          console.log(err);
          response.status(500).send(`error: ${err}`);
        });
    }
  );
  
  // Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;
  
  app.get("/movies/:title",
    passport.authenticate("jwt", { session: false }),
    async (request, response) => {
      await Movies.findOne({title: request.params.title})
        .then((movie) => {
          response.status(200).json(movie);
        })
        .catch((err) => {
          console.log(err);
          response.status(500).send(`error: ${err}`);
        });
    }
  );
  //Return data about a genre (description) by name/title (e.g., “Thriller”);
  app.get("/movies/genres/:genreName",
    passport.authenticate("jwt", { session: false }),
    async (request, response) => {
      await Movies.findOne({ "genre.name": request.params.genreName })
        .then((genre) => {
          response.status(200).json(genre);
        })
        .catch((err) => {
          console.log(err);
          response.status(500).send(`error: ${err}`);
        });
    }
  );
  
  // Return data about a director (bio, birth year, death year) by name;
  app.get(
    "/movies/directors/:directorName",
    passport.authenticate("jwt", { session: false }),
    async (request, response) => {
      await Movies.findOne({ "director.name": request.params.directorName })
        .then((director) => {
          response.status(200).json(director);
        })
        .catch((err) => {
          console.log(err);
          response.status(500).send(`error: ${err}`);
        });
    }
  );


  //Users:

//Create New User
  app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

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
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });


// UPDATE - Update a user's info, by Username
/* We'll expect JSON in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
app.put(
    '/users/:Username',
    [
      check('Username', 'Username is required').isLength({ min: 5 }),
      check(
        'Username',
        'Username contains non alphanumeric characters - not allowed.'
      ).isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      // check the validation object for errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
  
      const hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOneAndUpdate(
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
      )
        .then((updatedUser) => res.status(200).json(updatedUser))
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
    }
  );

//add favorite movie to users list
app.post(
    "/users/:username/movies/:movieID",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      await Users.findOneAndUpdate(
        { username: req.params.username },
        {
          $addToSet: { favoriteMovies: req.params.movieID },
        },
        { new: true }
      ) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
          res.json(updatedUser);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error:" + err);
        });
    }
  );

//deletes favorite movie to users list
app.delete(
    "/users/:username/movies/:movieID",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
      await Users.findOneAndUpdate(
        { username: req.params.username },
        {
          $pull: { favoriteMovies: req.params.movieID },
        },
        { new: true }
      ) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
          res.json(updatedUser);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error:" + err);
        });
    }
  );

//deletes user
app.delete(
    "/users/:username/",
    passport.authenticate("jwt", { session: false }),
    async (request, response) => {
      await Users.findOneAndRemove({ username: request.params.username })
        .then((removedUser) => {
          response.status(200).send(`user ${removedUser} was deleted`);
        })
        .catch((err) => {
          response.status(500).send(`error: ${err}`);
        });
    }
  );



//error handling middleware function
//should be last, but before app.listen()
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("something broke");
  });
  

  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0',() => {
   console.log('Listening on Port ' + port);
  });
