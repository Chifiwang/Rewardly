#!/usr/bin/env node

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node index.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const express = require("express");
require('dotenv').config() // load JWT_SECRET
const app = express();
const cors = require("cors");
const { execSync } = require("child_process");

try {
    execSync("node prisma/seed.js", { stdio: "inherit" });
} catch (err) {
    console.error("Failed to seed database on start:", err.message);
}

console.log(FRONTEND_URL);
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // multer

// ADD YOUR WORK HERE
// Test Update
const userRoutes = require("./routes/user");
app.use("/users", userRoutes);
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Registration endpoint
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.post("/register", async (req, res) => {
    try {
        const { username, firstname, lastname, password, email } = req.body;

        // Validate required fields
        if (!username || !firstname || !lastname || !password) {
            return res.status(400).json({
                message: "All fields are required: username, firstname, lastname, password"
            });
        }

        // Validate username format (utorid)
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                message: "Username must be between 3 and 20 characters"
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { utorid: username }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists. Please choose a different username."
            });
        }

        // Create new user with default role 'regular'
        const fullName = `${firstname} ${lastname}`;
        const userEmail = email || `${username}@example.com`;

        const newUser = await prisma.user.create({
            data: {
                utorid: username,
                name: fullName,
                email: userEmail,
                password: password, // In production, this should be hashed
                role: 'regular',
                points: 500, // Welcome bonus
                verified: true,
                activated: true,
                createdAt: new Date()
            }
        });

        // Return success without sensitive data
        res.status(201).json({
            message: "Registration successful",
            user: {
                utorid: newUser.utorid,
                name: newUser.name,
                email: newUser.email,
                points: newUser.points
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Registration failed. Please try again."
        });
    }
});
const eventRoutes = require("./routes/event");
app.use("/events", eventRoutes);
const promotionRoutes = require("./routes/promotion");
app.use("/promotions", promotionRoutes);
const transactionRoutes = require("./routes/transaction");
app.use("/transactions", transactionRoutes);



const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});
