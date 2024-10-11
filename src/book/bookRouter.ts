import path from "node:path";
import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

// Multer setup
const fileDestination = path.resolve(__dirname, "../../public/data/uploads");
const upload = multer({
    dest: fileDestination,
    limits: { fileSize: 1e7 },
});

// Routes
bookRouter.post(
    "/",
    authenticate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook
);

export default bookRouter;
