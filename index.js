// Modules
const express = require('express'),
    bodyParser = require('body-parser');
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

// Connect Mongoose to db
mongoose.connect(
    'mongodb://localhost:27017/cfDB',
    {useNewUrlParser: true, useUnifiedTopology: true, family: 4}
    );

// Import Mongoose models
const app = express(),
    Movies = Models.Movie,
    Users = Models.User;

// Init body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Authentification & Login Endpoint
let auth = require('./auth')(app) // Login HTML Authentification
const passport = require('passport'); // JWT Authentification
require('./passport');

// Setup Logging
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

// Logging
app.use(morgan('combined', {stream: accessLogStream}));


// Endpoints and handling functions

// Home/Index
app.get('/', (req, res) => {
    res.sendFile('public/index.html', {root: __dirname});
});

// Documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root:__dirname});
});

// All movies
app.get(
    '/movies',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
       await Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    });

// Movie 
app.get(
    '/movies/:title',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        await Movies.findOne({Title: req.params.title})
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// Genre
app.get(
    '/movies/genres/:genre',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        await Movies.findOne({'Genre.Name': req.params.genre})
        .then((movie) => {
            if (!movie) {
                res.status(400).send(
                    'There are no movies in the database with the genre - ' + req.params.genre
                )
            } else {
                res.status(200).json(movie.Genre);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// Director
app.get(
    '/movies/directors/:director',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
       await Movies.findOne({'Director.Name': req.params.director})
        .then((movie) => {
            if (!movie) {
                res.status(400).send(
                    'There are no movies in the database with the director - ' + req.params.director
                )
            } else {
                res.status(200).json(movie.Director);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// Register
app.post(
    '/users',
    (req, res) => {
        Users.findOne({Username: req.body.Username})
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) => {res.status(201).json(user)})
                .catch((err) => {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                })
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// User Info
app.get(
    '/users/:username',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
       await Users.findOne({Username: req.params.username})
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// Update User
app.put(
    '/users/:username',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        await Users.findOneAndUpdate({Username: req.params.username},
            {$set:
                {
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                }
            },
            {new: true}
        )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// Favorites Add
app.post(
    '/users/:username/favorites/:movieId',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        await Users.findOneAndUpdate(
            {Username: req.params.username},
            {
                $push: {FavoriteMovies: req.params.movieId}
            },
            {new: true}
        )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
);

// Favourites Remove
app.delete(
    '/users/:username/favorites/:movieId',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        await Users.findOneAndUpdate(
            {Username: req.params.username},
            {
                $pull: {FavoriteMovies: req.params.movieId}
            },
            {new: true}
        )
        .then((updatedUser) => {
            res.status(200).json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        }); 
    }
);

// Deregister
app.delete(
    '/users/:username',
    passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        await Users.findOneAndRemove({Username: req.params.username})
            .then((user) => {
                if (!user) {
                    res.status(400).send(req.params.username + ' was not found');
                } else {
                    res.status(200).send(req.params.username + ' was deleted');
                }
                })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

app.use(express.static('public'));

// General error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Borked!');
});

app.listen(8080, () => {
    console.log('App listening on port 8080');
});