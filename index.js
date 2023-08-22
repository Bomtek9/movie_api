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

//error handling middleware function
//should be last, but before app.listen()
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("something broke");
  });
  
  app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
  });