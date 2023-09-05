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

//MOVIES
app.get("/", (request, response) => {
  let responseText = "It's Movie Night !";
  response.send(responseText);
});

//Return a list of ALL movies to the user;
app.get("/movies", (request, response) => {
  response.status(200).json(movies);
});

// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user;

app.get("/movies/:title", (request, response) => {
  Movies.findOne({ Title: request.params.Title})
  .then ((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});


//Return data about a genre (description) by name/title (e.g., “Thriller”);
app.get("/movies/genres/:genreName", (request, response) => {
  const { genreName } = request.params;
  const MovieInGenre = movies.find((movie) => {
    return movie.genre.name === genreName;
  });

  if (MovieInGenre) {
    const genre = MovieInGenre.genre;

    response.status(200).json(genre);
    console.log(genre);
  } else {
    response.status(400).send("no such genre found");
  }
});

// Return data about a director (bio, birth year, death year) by name;
app.get("/movies/director/:directorName", (request, response) => {
  const { directorName } = request.params;

  const directorMovie = movies.find((movie) => {
    return movie.director.name === directorName;
  });

  if (directorMovie) {
    const director = directorMovie.director;
    response.status(200).json(director);
  } else {
    response.status(401).send("no such director found!");
  }
});

//USERS
//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/

app.post('/users', async(req, res) => {
  await Users.findOne({Username: req.body.Username})
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
    } else {
      Users
        .create({
          Username: req.body.Username,
          Email: req.body.Email,
          Password: req.body.Password,
          Birthday: req.body.Birthday
        })
        then((user) => {res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
  });
}),

//update user
app.put("/users/:id", (request, response) => {
  const { id } = request.params;
  const updateUser = request.body;
  let user = users.find((user) => user.id.toString() === id);

  if (user) {
    user.name = updateUser.name;
    response.status(200).json(user);
  } else {
    response.status(400).send("no such user");
  }
});

//add favorite movie to users list
app.post("/users/:id/:movieTitle", (request, response) => {
  const { id, movieTitle } = request.params;
  let user = users.find((user) => user.id.toString() === id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    response
      .status(200)
      .send(`${movieTitle} has been added to user ${id}s list`);
  } else {
    response.status(400).send("no such movie");
  }
});

//deletes favorite movie to users list
app.delete("/users/:id/:movieTitle", (request, response) => {
  const { id, movieTitle } = request.params;
  let user = users.find((user) => user.id.toString() === id);

  if (user) {
    user.favoriteMovies.filter((title) => title !== movieTitle);
    response
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}s list`);
  } else {
    response.status(400).send("no such movie");
  }
});

//deletes user
app.delete("/users/:id/", (request, response) => {
  const { id } = request.params;
  let user = users.find((user) => user.id.toString() === id);

  if (user) {
    users = users.filter((user) => user.id.toString() !== id);
    response.status(200).send(`user ${id} has been deleted`);
    // response.json(users);
  } else {
    response.status(400).send("no such movie");
  }
});

//error handling middleware function
//should be last, but before app.listen()
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("something broke");
  });
  
  app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
  });
