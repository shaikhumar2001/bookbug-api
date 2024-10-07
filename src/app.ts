import express from "express";

const app = express();

// Routes
app.get("/", (req, res, next) => {
    res.json({ message: "Welcome to Book Bug api" });
});

export default app;
