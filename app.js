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
    origin: 'https://vhandleuss.netlify.app',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});

import user from "./routes/userRoutes.js";
import admin from "./routes/adminRoutes.js";

app.use("/api/v1", user);
app.use("/api/v1", admin);

export default app;

app.use(ErrorMiddleware);
