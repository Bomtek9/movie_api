const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");

//movies
let movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  genre: {
    name: String,
    description: String,
  },
  director: {
    name: String,
    bio: String,
    birth: Date,
    death: Date,
  },

  imagepath: String,
  featured: Boolean,
});

//users
let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "movies" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  console.log(`validating pw ${password}`);
  console.log(JSON.stringify(this));
  const success = bcrypt.compareSync(password, this.password);
  console.log(`pw validated`);
  return success;
};

let Movie = mongoose.model("movie", movieSchema);
let User = mongoose.model("user", userSchema);

//is it all caps ??
module.exports.Movie = Movie;
module.exports.User = User;