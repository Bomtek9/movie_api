const express = require("express"),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const morgan = require("morgan");
const mongoose = require('mongoose');
const Models = require('./models.js');

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

app.get('/', (req, res) => {
	res.send('This is the default route endpoint');
});

//MOVIES
app.get("/", (request, response) => {
    let responseText = "It's Movie Night !";
    response.send(responseText);
  });
  
  //Return a list of ALL movies to the user;
  app.get(
    "/movies",
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
  
  app.get(
    "/movies/:title",
    passport.authenticate("jwt", { session: false }),
    async (request, response) => {
      await Movies.findOne({ title: request.params.title })
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
  app.get(
    "/movies/genres/:genreName",
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

// Get all users
app.get('/users', (req, res) => {
	Users.find()
		.then((users) => {
			res.status(200).json(users);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Get a user by username
app.get('/users/:Username', (req, res) => {
	Users.findOne({ Username: req.params.Username })
		.then((user) => {
			if (!user) {
				return res.status(404).send('Error: ' + req.params.Username + ' was not found');
			} else {
				res.json(user);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Create a new user
app.post('/users', async(req, res) => {
	let hashedPassword = Users.hashedPassword(req.body.Password);
	await Users.findOne({Username: req.body.Username})// Search to see if a user with the requested username already exists
		.then((user) => {
			if (user) {
				return res.status(400).send(req.body.Username + ' already exists');
			} else {
				Users.create({
					Username: req.body.Username,
					Password: req.body.Password,
					Email: req.body.Email,
					Birthdate: req.body.Birthdate,
				})
					.then((user) => {
						res.status(201).json(user);
					})
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

//Allows user to update username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // CONDITION TO CHECK ADDED HERE
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});

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
  

  app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
  });
