import express from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();

app.use(express.json());

// Routes
app.get("/", (req, res, next) => {
    throw createHttpError(400, "something went wrong!");
    res.json({ message: "Welcome to Book Bug api" });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
