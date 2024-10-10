import { NextFunction, Request, Response } from "express";
// import book from "./bookModel";
// import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Book Create" });
};

export { createBook };
