let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= FETCH RESTAURANTS =================
fetch("https://food-delivery-b2f6.onrender.com/api/restaurants")
.then(res => res.json())
.then(data => {
    const list = document.getElementById("list");

    if (!list) return;

    data.forEach(r => {
        const div = document.createElement("div");
        div.classList.add("card");

        let menuHTML = "";

        r.menu.forEach(item => {
            menuHTML += `
                <p>${item.name} - ₹${item.price}</p>
                ${
                    JSON.parse(localStorage.getItem("user"))
                    ? `<button onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>`
                    : `<button onclick="alert('Login karo ❌')">Login to order</button>`
                }
            `;
        });

        div.innerHTML = `
            <img src="${r.image}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836'" />
            <h2>${r.name}</h2>
            <p>${r.address}</p>
            <p>⭐ ${r.rating}</p>
            ${menuHTML}
        `;

        list.appendChild(div);
    });
});


// ================= CART =================
function addToCart(name, price) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        window.location.href = "login.html";
        return;
    }

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    renderCart();
}

function increase(name) {
    const item = cart.find(i => i.name === name);
    item.quantity++;
    renderCart();
}

function decrease(name) {
    const item = cart.find(i => i.name === name);

    if (item.quantity > 1) {
        item.quantity--;
    } else {
        cart = cart.filter(i => i.name !== name);
    }

    renderCart();
}

function removeItem(name) {
    cart = cart.filter(i => i.name !== name);
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const total = document.getElementById("total");

    if (!cartItems || !total) return;

    cartItems.innerHTML = "";
    let sum = 0;

    cart.forEach(item => {
        sum += item.price * item.quantity;

        cartItems.innerHTML += `
            <div>
                <p>${item.name}</p>
                <p>₹${item.price} x ${item.quantity}</p>
                <button onclick="increase('${item.name}')">+</button>
                <button onclick="decrease('${item.name}')">-</button>
                <button onclick="removeItem('${item.name}')">❌</button>
            </div>
            <hr>
        `;
    });

    total.innerText = sum;
    localStorage.setItem("cart", JSON.stringify(cart));
}


// ================= ORDER =================
function placeOrder() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("Cart empty hai ❌");
        return;
    }

    fetch("https://food-delivery-b2f6.onrender.com/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userEmail: user.email,
            items: cart,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            date: new Date()
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        cart = [];
        renderCart();
    });
}

function payNow() {
    if (cart.length === 0) {
        alert("Cart empty hai ❌");
        return;
    }

    alert("Payment successful ✅");
    placeOrder();
}


// ================= LOGIN / REGISTER =================
function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("https://food-delivery-b2f6.onrender.com/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message));
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("All fields required ❌");
        return;
    }

    fetch("https://food-delivery-b2f6.onrender.com/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({ email }));
            window.location.href = "index.html";
        }
    });
}


// ================= ORDERS =================
function loadOrders() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login karo ❌");
        window.location.href = "login.html";
        return;
    }

    fetch(`https://food-delivery-b2f6.onrender.com/api/orders/${user.email}`)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("orders");

        if (!div) return;

        if (data.length === 0) {
            div.innerHTML = "<h3>No orders yet 😢</h3>";
            return;
        }

        div.innerHTML = "<h2>🧾 Your Orders</h2>";

        data.reverse().forEach(order => {
            div.innerHTML += `
                <div style="background:white;padding:15px;margin:10px;border-radius:10px;">
                    <p><b>Total:</b> ₹${order.total}</p>
                    <p><b>Status:</b> ${order.status}</p>
                    <p><b>Time:</b> ${new Date(order.date).toLocaleString()}</p>
                </div>
            `;
        });
    });
}

function checkLoginForOrders() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        window.location.href = "login.html";
        return;
    }

    loadOrders();
}


// ================= UI =================
function showUser() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        document.getElementById("username")?.innerText = user.email;
    }
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    location.reload();
}

function searchFood() {
    const value = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(value)
            ? "block"
            : "none";
    });
}

function goToMenu() {
    document.getElementById("list")?.scrollIntoView({
        behavior: "smooth"
    });
}


// ================= LOAD =================
window.onload = function () {
    showUser();
    renderCart();
};