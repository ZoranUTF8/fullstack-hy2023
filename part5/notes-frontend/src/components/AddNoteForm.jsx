import { useState } from "react";
// import noteDbServices from "../Services/NotesDbServices";
import PropTypes from "prop-types";
const AddNoteForm = ({
  createNote,
  setNotes,
  notes,
  setErrorMessage,
  toggleVisref,
}) => {
  const [newNote, setNewNote] = useState("");

  const handleChange = (e) => {
    setNewNote(e.target.value);
  };

  const addNote = (event) => {
    event.preventDefault();

    createNote({
      content: newNote,
      important: Math.random() > 0.5,
    });

    setNewNote("");
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    };

    // toggleVisref.current.toggleVisibility();

    // noteDbServices
    //   .createNote(noteObject)
    //   .then((newNoteFromDb) => {
    //     setNotes(notes.concat(newNoteFromDb.data));
    //     setNewNote("");
    //   })
    //   .catch(
    //     (err) => setErrorMessage(err.response.data.msg),
    //     setTimeout(() => {
    //       setErrorMessage("");
    //     }, 3000)
    //   );
  };
  return (
    <form onSubmit={addNote}>
      <input value={newNote} onChange={handleChange} placeholder="New note" />
      <button type="submit">save</button>
    </form>
  );
};

// AddNoteForm.propTypes = {
//   setNotes: PropTypes.string.isRequired,
//   notes: PropTypes.string.isRequired,
//   setErrorMessage: PropTypes.string.isRequired,
//   toggleVisref: PropTypes.string.isRequired,
// };
export default AddNoteForm;
