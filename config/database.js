import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose.set("strictQuery", false);
  const { connection } = await mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB connected with ${connection.host}`);
};
