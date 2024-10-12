import path from "node:path";
import fs from "node:fs";
import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";
import { FileType } from "./bookTypes";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    const files = req.files as FileType;

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

        const _req = req as AuthRequest;

        const newBook = await bookModel.create({
            title,
            author: _req.userId,
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

        res.status(201).json({ _id: newBook._id });
    } catch (err) {
        return next(createHttpError(500, "Error while uploading files"));
    }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    // Find book
    let book;
    try {
        book = await bookModel.findOne({ _id: bookId });
    } catch (err) {
        return next(createHttpError(404, "Book not found, invalid book id"));
    }

    // Validate book
    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }

    // Check Access / Validate Author
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You cannot update others book"));
    }
    const files = req.files as FileType;

    // Check if cover image field exists
    let coverImageUpdated = "";
    if (files.coverImage) {
        const fileName = files.coverImage[0].filename;
        const mimeType = files.coverImage[0].mimetype.split("/").at(-1);
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            fileName
        );

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: mimeType,
        });

        coverImageUpdated = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    // Check if file field exists
    let fileUpdated = "";
    if (files.file) {
        const fileName = files.file[0].filename;
        const mimeType = files.file[0].mimetype.split("/").at(-1);
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            fileName
        );

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            filename_override: fileName,
            folder: "book-pdfs",
            format: mimeType,
        });

        fileUpdated = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    // Update Book
    const updatedBook = await bookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title,
            genre,
            coverImage: coverImageUpdated ? coverImageUpdated : book.coverImage,
            file: fileUpdated ? fileUpdated : book.file,
        },
        {
            new: true,
        }
    );

    res.status(201).json(updatedBook);
};

const getBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //todo add pagination
        const books = await bookModel.find();
        res.status(200).json(books);
    } catch (err) {
        return next(createHttpError(500, "Error while getting Books"));
    }
};

const getSingleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bookId = req.params.bookId;
    try {
        let book;
        try {
            book = await bookModel.findOne({ _id: bookId });
        } catch (err) {
            return next(createHttpError(400, "Invalid book id"));
        }

        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        res.status(200).json(book);
    } catch (err) {
        return next(createHttpError(500, "Error while getting Book"));
    }
};

const deleteSingleBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const bookId = req.params.bookId;

    // Find book
    let book;
    try {
        book = await bookModel.findOne({ _id: bookId });
    } catch (err) {
        return next(createHttpError(404, "Invalid book id"));
    }

    // Validate book
    if (!book) {
        return next(createHttpError(404, "Book not found"));
    }

    // Check Access / Validate Author
    const _req = req as AuthRequest;
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You cannot update others book"));
    }

    // Delete files from Cloudinary
    const coverImageSplits = book.coverImage.split("/");
    const coverImagePublicId = `${coverImageSplits.at(-2)}/${coverImageSplits
        .at(-1)
        ?.split(".")
        .at(-2)}`;

    const fileSplits = book.file.split("/");
    const filePublicId = `${fileSplits.at(-2)}/${fileSplits.at(-1)}`;

    await cloudinary.uploader.destroy(coverImagePublicId);
    await cloudinary.uploader.destroy(filePublicId, {
        resource_type: "raw",
    });

    // Delete files from Database
    await bookModel.deleteOne({ _id: bookId });

    res.sendStatus(204);
};

export { createBook, updateBook, getBooks, getSingleBook, deleteSingleBook };
