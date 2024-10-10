import path from "node:path";
import fs from "node:fs";
import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import bookModel from "./bookModel";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //* Uploading cover image & book pdf
    try {
        const coverImageFileName = files.coverImage[0].filename;
        const coverImageFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            coverImageFileName
        );
        const coverImageMimeType = files.coverImage[0].mimetype
            .split("/")
            .at(-1);

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );
        const bookFileMimeType = files.file[0].mimetype.split("/").at(-1);

        const coverImageUploadResult = await cloudinary.uploader.upload(
            coverImageFilePath,
            {
                filename_override: coverImageFileName,
                folder: "book-covers",
                format: coverImageMimeType,
            }
        );

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: bookFileMimeType,
            }
        );

        console.log("coverImageUploadResult: ", coverImageUploadResult);
        console.log("bookFileUploadResult: ", bookFileUploadResult);

        const newBook = await bookModel.create({
            title,
            author: "6706c7206604421f0a00e8e7",
            genre,
            coverImage: coverImageUploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        });

        // Delete temp files
        try {
            await fs.promises.unlink(coverImageFilePath);
            await fs.promises.unlink(bookFilePath);
        } catch (err) {
            return next(
                createHttpError(500, "Error while deleting temporary files")
            );
        }

        res.json({ message: "Book Created" });
    } catch (err) {
        return next(createHttpError(500, "Error while uploading files"));
    }
};

export { createBook };
