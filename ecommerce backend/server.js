require("dotenv").config();
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET);


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("✅ Server is running!");
});

// connects DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "❌ User already exists" });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.json({ message: "✅ Registration successful" });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error", error });
    }
});

// ✅ Login Route
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "❌ User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "❌ Invalid credentials" });

        // ✅ Use .env variable for JWT Secret
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "✅ Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error", error });
    }
});

// ✅ Middleware to verify token
function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "❌ The request is unauthenticated. No token provided!" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({ message: "❌ Invalid Token!" });
    }
}

// ✅ Apply middleware to protected route
app.get("/dashboard", authenticateToken, (req, res) => {
    res.json({ message: `Welcome user ${req.user.id}!` });
});


// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
