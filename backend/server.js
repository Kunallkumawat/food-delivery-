const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect('mongodb://127.0.0.1:27017/foodOrdering')
.then(()=>console.log("MongoDB Connected ✅"))
.catch(err=>console.log(err));

// Test route
app.get('/', (req,res)=>{
    res.send("Server chal raha hai 🚀");
});

// Restaurants API
app.get('/api/restaurants', async (req,res)=>{
    const data = await mongoose.connection.db.collection("restaurants").find().toArray();
    res.json(data);
});

// Server start
app.listen(5000, ()=>{
    console.log("Server running on 5000 🚀");
});
// Place Order API
app.post('/api/orders', async (req, res) => {
    const order = req.body;
    order.status = "pending";

    await mongoose.connection.db.collection("orders").insertOne(order);

    res.json({ message: "Order placed successfully ✅" });
});
// Register API
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await mongoose.connection.db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword
    });

    res.json({ message: "User registered successfully ✅" });
});

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await mongoose.connection.db.collection("users").findOne({ email });

    if (!user) {
        return res.json({ message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.json({ message: "Wrong password ❌" });
    }

    const token = jwt.sign({ email: user.email }, "secret123");

    res.json({ message: "Login successful ✅", token });
});
// Get orders by user
app.get('/api/orders/:email', async (req, res) => {
    const email = req.params.email;

    const orders = await mongoose.connection.db
        .collection("orders")
        .find({ userEmail: email })
        .toArray();

    res.json(orders);
});
