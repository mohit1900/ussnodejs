import express from "express";
import { config } from "dotenv";
import ErrorMiddleware from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

config({
  path: "./config/config.env",
});

const app = express();

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://vhandleuss.netlify.app",
      "https://ussfrontendtest.vercel.app/",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

import user from "./routes/userRoutes.js";
import admin from "./routes/adminRoutes.js";

app.use("/api/v1", user);
app.use("/api/v1", admin);

export default app;

app.use(ErrorMiddleware);
