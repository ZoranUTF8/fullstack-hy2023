const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  bookCount: { type: Number, default: 0 },
  born: {
    type: Number,
    default: null,
  },
});


// rename _id to id in toJSON()
authorSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

authorSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Author", authorSchema);
