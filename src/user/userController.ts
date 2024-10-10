import { NextFunction, Request, Response } from "express";
import userModel from "./userModel";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const registerUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // Search of duplicates in Database
    try {
        const user = await userModel.findOne({ email });

        if (user) {
            const error = createHttpError(
                400,
                "User already exists with this email"
            );
            return next(error);
        }
    } catch (err) {
        return next(createHttpError(500, "Error while getting user"));
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    let newUser: User;
    try {
        newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });
    } catch (err) {
        return next(createHttpError(500, "Error while creating user"));
    }

    // JWT token generation
    try {
        const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
            expiresIn: "30d",
            algorithm: "HS256",
        });
        // Response
        res.json({ accessToken: token });
    } catch (err) {
        return next(createHttpError(500, "Error while signing JWT token"));
    }
};

export { registerUser };
