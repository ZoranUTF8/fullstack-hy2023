/*Because of the library, we do not
need the next(exception) call anymore.
The library handles everything under the hood.
If an exception occurs in an async route, the 
execution is automatically passed to the error\
 handling middleware.*/
require("express-async-errors");

const express = require("express");

const cors = require("cors");

const app = express();

const config = require("./utils/config");

const logger = require("./utils/logger");

const notesRouter = require("./controllers/notes");

const usersRouter = require("./controllers/users");

const loginRouter = require("./controllers/login");

//? Testing router

const middleware = require("./utils/middleware");

const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
logger.info("connecting to", config.MONGODB_URI);
mongoose
  .connect(config.MONGODB_URI)
  .then((result) => {
    logger.info("connected to db");
  })
  .catch((error) => {
    logger.error("error connecting to MongoDB:", error.message);
  });
/*
The json-parser functions so that it takes the JSON data of a request,
transforms it into a JavaScript object and then attaches it to the body
 property of the request object before the route handler is called. */
app.use(cors());
app.use(express.json());

// ! If needed later for frontend
//! app.use(express.static("build"));

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

//? Test routes
if (process.env.NODE_ENV === "test") {
  console.log("NODE ENV IS TEST");
  const testingRouter = require("./controllers/TestRoutes");
  app.use("/api/testing", testingRouter);
}

//! handler of requests with unknown endpoint
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandlerMiddleware);

module.exports = app;
