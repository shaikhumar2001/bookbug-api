import { NextFunction, Request, Response } from "express";
import userModel from "./userModel";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

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

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
    });

    // JWT token generation
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
        expiresIn: "30d",
        algorithm: "HS256",
    });

    // Response

    res.json({ accessToken: token });
};

export { createUser };
