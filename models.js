const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const sharp = require("sharp"); // Import the sharp library

/**
 * Movie schema for MongoDB.
 *
 * @typedef {Object} Movie
 * @property {string} Description - The description of the movie.
 * @property {Object} Genre - The genre information.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - The description of the genre.
 * @property {Object} Director - The director information.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Birth - The birth date of the director.
 * @property {string} Director.Death - The death date of the director.
 * @property {string} Title - The title of the movie.
 * @property {string} ImagePath - The path to the movie image.
 */

/**
 * User schema for MongoDB.
 *
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The hashed password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array<string>} FavoriteMovies - The list of favorite movie IDs.
 */

// Define movie schema
const movieSchema = mongoose.Schema({
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Birth: String,
    Death: String,
  },
  Title: { type: String, required: true },
  ImagePath: { type: String, required: true }, // Add ImagePath field
});

// Define user schema
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

// Hash the user password before saving
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Validate user password
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/**
 * Middleware function to resize movie image using sharp before saving.
 *
 * @function
 * @async
 * @name pre-save
 * @memberof module:models~Movie
 * @param {Function} next - Callback function to continue to the next middleware.
 */
movieSchema.pre("save", async function (next) {
  try {
    // Check if the image path exists
    if (this.ImagePath) {
      // Resize the image to 400x600 using sharp
      const resizedImageBuffer = await sharp(this.ImagePath)
        .resize(400, 600)
        .toBuffer();

      // Save the resized image back to the ImagePath
      this.ImagePath = `data:image/jpeg;base64,${resizedImageBuffer.toString(
        "base64"
      )}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Create Movie and User models
const Movie = mongoose.model("Movie", movieSchema);
const User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
