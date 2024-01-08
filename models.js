const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const sharp = require("sharp"); // Import the sharp library

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

const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Resize image using sharp before saving or sending
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

const Movie = mongoose.model("Movie", movieSchema);
const User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
