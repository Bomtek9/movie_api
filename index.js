const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { request } = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Models = require("./models");
const { error } = require("console");

// require("dotenv").config();

//validates username, pw, etc. user imputs on the server side. To make sure there is no malicious code, and that the imputs follow the desired constrains.
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

//connects to the database
// mongoose.connect("mongodb://localhost:27017/cfDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

//connects to online mongoDB database -- first param is an environment variable, so the data about my mongodb(username,pw) is not exposed on my github
// mongoose.connect("mongodb://localhost:27017/myFlixDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// console.log("CONNCECTION_URI: " + process.env.CONNECTION_URI);

mongoose.connect(process.env.CONNECTION_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());
//cors controls which domains have access to my api

// let allowedOrigins = [
//   "http://localhost:8080 https://movies-api-render-0a0q.onrender.com/ ",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) {
//         return callback(null, true);
//       }
//       if (allowedOrigins.indexOf(origin) === -1) {
//         let message =
//           "the CORS policy for this application doesnt allow access from origin " +
//           origin;
//         return callback(new Error(message), false);
//       }
//       return callback(null, true);
//     },
//   })
// );
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

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
app.get(
	"/movies",
	// passport.authenticate("jwt", { session: false }),
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

//USERS

// Allow new users to register;
app.post(
	"/users",
	[
		// check([field in req.body to validate], [error message if validation fails]).[validation method]();
		check("username", "username is required").isLength({ min: 5 }),
		check(
			"username",
			"username contains non alphanumeric characters - not allowed!"
		).isAlphanumeric(),
		check("password", "password is required").not().isEmpty(),
		check("email", "email is not valid").isEmail(),
	],
	async (request, response) => {
		//check validation object for errors
		let errors = validationResult(request);
		if (!errors.isEmpty()) {
			return response.status(422).json({ errors: errors.array() });
		}

		let hashedPassword = Users.hashPassword(request.body.password);
		await Users.findOne({ username: request.body.username })
			.then((user) => {
				if (user) {
					return response
						.status(400)
						.send(`${request.body.username} already exists`);
				} else {
					Users.create({
						username: request.body.username,
						password: hashedPassword,
						email: request.body.email,
						birthday: request.body.birthday,
					})
						.then((user) => {
							response.status(201).json(user);
						})
						.catch((err) => {
							console.log(err);
							response.status(500).send(`error: ${err}`);
						});
				}
			})
			.catch((err) => {
				console.log(err);
				response.status(500).send(`error: ${err}`);
			});
	}
);
//update user by username
app.put(
	"/users/:username",

	passport.authenticate("jwt", { session: false }),
	[
		// check([field in req.body to validate], [error message if validation fails]).[validation method]();
		check("username", "username is required").isLength({ min: 5 }),
		check(
			"username",
			"username contains non alphanumeric characters - not allowed!"
		).isAlphanumeric(),
		check("password", "password is required").not().isEmpty(),
		check("email", "email is not valid").isEmail(),
	],
	async (request, response) => {
		//check validation object for errors
		let errors = validationResult(request);
		if (!errors.isEmpty()) {
			return response.status(422).json({ errors: errors.array() });
		}
		//CONDITION TO CHECK USERNAME HERE
		if (request.user.username !== request.params.username) {
			return response.status(400).send("permission denied");
		}
		let hashedPassword = Users.hashPassword(request.body.password);

		await Users.findOneAndUpdate(
			{ username: request.params.username },
			{
				$set: {
					username: request.body.username,
					password: hashedPassword,
					email: request.body.email,
					birthday: request.body.birthday,
				},
			},
			{ new: true }
		).then((user) => {
			if (!user) {
				response.status(500).send(`${request.params.username} not found`);
			} else {
				response.status(201).json(user);
			}
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
// const port = 10000;

// console.log(process.env.PORT);
// console.log(port);

app.listen(port, "0.0.0.0", () => {
	console.log("listening on port" + port);
});