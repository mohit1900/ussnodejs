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
// app.use(
//   cors({
//     origin: 'https://vhandleuss.netlify.app/',
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

const allowCrossDomain = (req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `https://vhandleuss.netlify.app/`);
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
};

app.use(allowCrossDomain);




import user from "./routes/userRoutes.js";
import admin from "./routes/adminRoutes.js";

app.use("/api/v1", user);
app.use("/api/v1", admin);

export default app;

app.use(ErrorMiddleware);
