const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected ✅"))
.catch(err=>console.log("❌ DB ERROR:", err.message));

// ================= TEST =================
app.get('/', (req,res)=>{
    res.send("Server chal raha hai 🚀");
});

// ================= RESTAURANTS =================
app.get('/api/restaurants', async (req,res)=>{
    const data = await mongoose.connection.db.collection("restaurants").find().toArray();
    res.json(data);
});

// 👉 ADMIN ADD RESTAURANT
app.post('/api/restaurants', async (req,res)=>{
    try {
        const { name, image, address, rating, menu } = req.body;

        await mongoose.connection.db.collection("restaurants").insertOne({
            name,
            image,
            address,
            rating,
            menu
        });

        res.json({ message: "Restaurant added ✅" });

    } catch (err) {
        res.json({ message: "Error adding restaurant ❌" });
    }
});

// ================= ORDERS =================
app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;

        order.status = "pending";
        order.date = new Date();

        await mongoose.connection.db.collection("orders").insertOne(order);

        res.json({ message: "Order placed successfully ✅" });

    } catch (err) {
        res.json({ message: "Order failed ❌" });
    }
});

// ================= REGISTER =================
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ message: "All fields required ❌" });
        }

        const existingUser = await mongoose.connection.db
            .collection("users")
            .findOne({ email });

        if (existingUser) {
            return res.json({ message: "User already exists ❌" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await mongoose.connection.db.collection("users").insertOne({
            name,
            email,
            password: hashedPassword
        });

        res.json({ message: "User registered successfully ✅" });

    } catch (err) {
        res.json({ message: "Register error ❌" });
    }
});

// ================= LOGIN =================
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ message: "All fields required ❌" });
        }

        const user = await mongoose.connection.db
            .collection("users")
            .findOne({ email });

        if (!user) {
            return res.json({ message: "User not found ❌" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ message: "Wrong password ❌" });
        }

        const token = jwt.sign({ email: user.email }, "secret123");

        res.json({ message: "Login successful ✅", token });

    } catch (err) {
        res.json({ message: "Login error ❌" });
    }
});

// ================= GET ORDERS =================
app.get('/api/orders/:email', async (req, res) => {
    try {
        const email = req.params.email;

        const orders = await mongoose.connection.db
            .collection("orders")
            .find({ userEmail: email })
            .toArray();

        res.json(orders);

    } catch (err) {
        res.json([]);
    }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT} 🚀`);
});