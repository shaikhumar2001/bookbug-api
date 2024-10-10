import path from "node:path";
import express from "express";
import { createBook } from "./bookController";
import multer from "multer";

const bookRouter = express.Router();

// Multer setup
const preFileDestination = path.resolve(__dirname, "../../public/data/uploads");
// const fileDestination = preFileDestination.replace(/\\/g, "/");
const upload = multer({
    dest: preFileDestination,
    limits: { fileSize: 1e7 },
});

// Routes
bookRouter.post(
    "/",
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook
);

export default bookRouter;
