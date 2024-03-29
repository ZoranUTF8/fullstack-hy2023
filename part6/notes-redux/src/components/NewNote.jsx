import { createNote } from "../reducers/noteReducer";
import { useDispatch } from "react-redux";

const NewNote = () => {
  const dispatch = useDispatch(); //? dispatch function from the useDispatch hook.

  const addNote = (event) => {
    event.preventDefault();
    const content = event.target.note.value;
    event.target.note.value = "";
    dispatch(createNote(content));
  };

  return (
    <form onSubmit={addNote}>
      <input name="note" />
      <button type="submit">add</button>
    </form>
  );
};

export default NewNote;
