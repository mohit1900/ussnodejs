import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Notes } from "../models/Notes.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";

export const addNote = catchAsyncError(async (req, res, next) => {
  const { title, text } = req.body;

  const user = await User.findById(req.user._id);

  if (!title || !text)
    return next(new ErrorHandler("Enter all the fields", 400));

  const note = await Notes.create({
    title,
    text,
  });

  user.notes.push({
    noteId: note._id,
  });

  await user.save();

  res.status(200).json({
    success: true,
    note,
    message: "Note added to list",
  });
});

export const deleteNote = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const note = await Notes.findById(req.query.id);

  if (!note) return next(new ErrorHandler("Invalid note id", 404));

  const newNotesArray = user.notes.filter((item) => {
    if (item.noteId.toString() !== note._id.toString()) return item;
  });

  await Notes.findByIdAndDelete(req.query.id);

  user.notes = newNotesArray;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Note deleted Successfully!",
  });
});

export const getMyNotes = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const notes = user.notes;

  res.status(200).json({
    success: true,
    notes,
  });
});

export const extractedNotes = catchAsyncError(async (req, res, next) => {
  const notes = req.body.notes;
  if (!notes) return next(new ErrorHandler("notes not found", 403));

  let extractedNotesArray = [];

  for (let i = 0; i < notes.length; i++) {
    let currentNote = notes[i];
    let noteId = currentNote.noteId;
    let temp = await Notes.findById(noteId);
    if (noteId) extractedNotesArray.push(temp);
  }

  res.status(200).json({
    success: true,
    extractedNotesArray,
  });
});
