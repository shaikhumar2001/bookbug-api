import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import { config } from "./config/config";

const app = express();

app.use(
    cors({
        origin: config.frontendDomain,
    })
);
app.use(express.json());

// Routes
app.get("/", (req, res, next) => {
    res.json({ message: "Welcome to Book Bug api" });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
