const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB Connected ✅"))
.catch(err=>console.log("❌ DB ERROR:", err.message));

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
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT} 🚀`);
});
   
// Place Order API
app.post('/api/orders', async (req, res) => {
    const order = req.body;

    order.status = "pending";
    order.userEmail = req.body.userEmail; 
    order.date = new Date(); 
    await mongoose.connection.db.collection("orders").insertOne(order);

    res.json({ message: "Order placed successfully ✅" });
});
// Register API
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ message: "All fields required ❌" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await mongoose.connection.db.collection("users").insertOne({
        name,
        email,
        password: hashedPassword
    });
    const existingUser = await mongoose.connection.db.collection("users").findOne({ email });

if (existingUser) {
    return res.json({ message: "User already exists ❌" });
}
    res.json({ message: "User registered successfully ✅" });
});

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
    return res.json({ message: "All fields required ❌" });
}

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
