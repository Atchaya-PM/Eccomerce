const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");//Used for hashing passwords to store them securely in the database.
const User = require("../models/User");//for authenticating users

const router = express.Router();

// register User
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, "yourSecretKey", { expiresIn: "1h" });
        res.json({ message: "Login successful!", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
