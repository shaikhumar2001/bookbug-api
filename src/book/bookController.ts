import path from "node:path";
import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    console.log("files", req.files, req.body);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //* Uploading cover image
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

        const coverImageUploadResult = await cloudinary.uploader.upload(
            coverImageFilePath,
            {
                filename_override: coverImageFileName,
                folder: "book-covers",
                format: coverImageMimeType,
            }
        );

        console.log(coverImageUploadResult);
    } catch (err) {
        return next(createHttpError(500, "Error while uploading cover image"));
    }

    //* Uploading book pdf
    try {
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );

        const bookFileMimeType = files.file[0].mimetype.split("/").at(-1);

        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: bookFileMimeType,
            }
        );

        console.log(bookFileUploadResult);
    } catch (err) {
        return next(createHttpError(500, "Error while uploading book"));
    }

    res.json({ message: "Book Create" });
};

export { createBook };
