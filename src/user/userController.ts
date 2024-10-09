import { NextFunction, Request, Response } from "express";
import userModel from "./userModel";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // Database
    const user = await userModel.findOne({ email });

    if (user) {
        const error = createHttpError(
            400,
            "User already exists with this email"
        );
        return next(error);
    }

    // Process
    // Response

    res.json({ message: "user created" });
};

export { createUser };
