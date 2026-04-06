const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ================= DB CONNECT =================
let db;

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    db = mongoose.connection.db;
    console.log("✅ Mongo Connected");
})
.catch(err => console.log("❌ ERROR:", err));

// ================= TEST =================
app.get('/', (req,res)=>{
    res.send("Server chal raha hai 🚀");
});

// ================= RESTAURANTS =================
app.get('/api/restaurants', async (req,res)=>{
    const data = await db.collection("restaurants").find().toArray();
    res.json(data);
});

// ================= ADD RESTAURANT =================
app.post('/api/restaurants', async (req,res)=>{
    try {
        await db.collection("restaurants").insertOne(req.body);
        res.json({ message: "Restaurant added ✅" });
    } catch {
        res.json({ message: "Error ❌" });
    }
});

// ================= ORDERS =================
app.post('/api/orders', async (req, res) => {
    try {
        console.log("📦 Incoming:", req.body);

        const order = req.body;
        order.status = "pending";
        order.date = new Date();

        await db.collection("orders").insertOne(order);

        console.log("✅ SAVED");

        res.json({ message: "Order placed successfully ✅" });

    } catch (err) {
        console.log("❌ ERROR:", err);
        res.json({ message: "Order failed ❌" });
    }
});

// ================= LOGIN =================
app.post('/api/login', async (req, res) => {
    const user = await db.collection("users").findOne({ email: req.body.email });

    if (!user) return res.json({ message: "User not found ❌" });

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) return res.json({ message: "Wrong password ❌" });

    const token = jwt.sign({ email: user.email }, "secret123");

    res.json({ message: "Login successful ✅", token });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT} 🚀`);
});
// ================= GET ORDERS =================
app.get('/api/orders/:email', async (req, res) => {
    try {
        const data = await db.collection("orders")
            .find({ userEmail: req.params.email })
            .toArray();

        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching orders ❌" });
    }
});

// ================= FEEDBACK =================
app.post('/api/feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.json({ message: "All fields required ❌" });
        }

        await db.collection("feedback").insertOne({
            name,
            email,
            message,
            date: new Date()
        });

        res.json({ message: "Feedback saved ✅" });

    } catch (err) {
        res.json({ message: "Error ❌" });
    }
});