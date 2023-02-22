const notesRouter = require("express").Router();
const Note = require("../Models/note");
const User = require("../Models/user");

//* Get  all notes
notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({}).populate("user", { username: 1, name: 1 });
  response.json(notes);
});

//* Get single note
notesRouter.get("/:id", async (req, res) => {
  const foundNote = await Note.findById(req.params.id);

  if (foundNote) {
    res.status(200).json({
      status: "success",
      message: `Note with ${req.params.id} found`,
      data: foundNote,
    });
  } else {
    res.status(404).json({
      status: "error",
      message: `Note with ${req.params.id} has not been found`,
    });
  }
});

//* Add new note
notesRouter.post("/", async (req, res) => {
  const user = await User.findById(req.body.userId);

  const newNote = new Note({
    content: req.body.content,
    important: req.body.important || false,
    user: user.id,
  });

  const savedNote = await newNote.save();

  //? Add the note id to the users notes array
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  res.status(201).json({
    message: `Note added under id ${savedNote.id} from user: ${user.name}`,
    data: savedNote,
  });
});

//* Delete single note
notesRouter.delete("/:id", async (req, res) => {
  const deletedNote = await Note.findByIdAndRemove(req.params.id);

  res
    .status(204)
    .json({ message: `Note with id ${deletedNote.id} was removed.` });
});

//* Update note importance
notesRouter.put("/:id", (req, res) => {
  const { content, important } = request.body;

  const newNote = { content, important };

  const updatedNote = Note.findByIdAndUpdate(req.params.id, newNote, {
    new: true,
    runValidators: true,
    context: "query",
  });

  res.json(updatedNote);
});

module.exports = notesRouter;
