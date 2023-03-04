import mongoose from "mongoose";

const schema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter the title"],
  },
  text: {
    type: String,
    required: [true, "Please enter the text"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Notes = mongoose.model("Notes", schema);
