const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const { request } = require("http");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();
app.use(bodyParser.json());

let users = [
  { id: 1, name: "kim", favoriteMovies: [] },
  { id: 2, name: "joe", favoriteMovies: [] },
];

let movies = [
  {
    title: "film 1",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "drama", description: "genre description here" },
    director: {
      name: "director1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 2",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 3",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 4",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 5",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 6",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 7",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 8",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 9",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
  {
    title: "film 10",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    genre: { name: "thriller", description: "genre description here" },
    director: {
      name: "director 1",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      born: 1940,
      death: "",
    },
    img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Foriginalvintagemovieposters.com%2Fwp-content%2Fuploads%2F2018%2F06%2FStar-Wars-5672-768x1162.jpg&f=1&nofb=1&ipt=d191eb7a7592ede00a4efb69d08105b59832ac04e24f4d6e8eab7df59bc5537b&ipo=images",
    feature: true,
  },
];

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
  const { title } = request.params;
  const movie = movies.find((movie) => {
    return movie.title === title;
  });

  if (movie) {
    response.status(200).json(movie);
  } else {
    response.status(400).send("no such movie was found");
  }
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
app.get("/movies/directors/:directorName", (request, response) => {
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
// Allow new users to register;
app.post("/users", (request, response) => {
  const newUser = request.body;
  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    response.status(201).json(newUser);
  } else {
    response.status(400).send("missing name");
  }
});

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