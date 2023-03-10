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
// app.use(fileUpload());

app.use(cookieParser());
app.use(
  cors({
    origin: 'https://vhandleuss.netlify.app/',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

import user from "./routes/userRoutes.js";
import admin from "./routes/adminRoutes.js";

app.use("/api/v1", user);
app.use("/api/v1", admin);

export default app;

app.use(ErrorMiddleware);
