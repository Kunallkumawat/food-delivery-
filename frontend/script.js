let cart = JSON.parse(localStorage.getItem("cart")) || [];
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
    fetch("http://localhost:5000/api/restaurants")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("list");

        data.forEach(r => {
            const div = document.createElement("div");
            div.classList.add("card");

            let menuHTML = "";

            r.menu.forEach(item => {
                menuHTML += `
                    <p>${item.name} - ₹${item.price}</p>
                    <button onclick="addToCart('${item.name}', ${item.price})">
                        Add to Cart
                    </button>
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
}

// Add to cart with quantity
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    renderCart();
}

// Increase quantity
function increase(name) {
    const item = cart.find(i => i.name === name);
    item.quantity++;
    renderCart();
}

// Decrease quantity
function decrease(name) {
    const item = cart.find(i => i.name === name);

    if (item.quantity > 1) {
        item.quantity--;
    } else {
        cart = cart.filter(i => i.name !== name);
    }

    renderCart();
}

// Remove item
function removeItem(name) {
    cart = cart.filter(i => i.name !== name);
    renderCart();
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const total = document.getElementById("total");

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
function placeOrder() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login karo pehle ❌");
        return;
    }

    if (cart.length === 0) {
        alert("Cart empty hai ❌");
        return;
    }

    fetch("http://localhost:5000/api/orders", {
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
function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:5000/api/register", {
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

    fetch("http://localhost:5000/api/login", {
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

            showUser();
        }
        else {
    alert("Login karo pehle 👇");
}
    });
}
function loadOrders() {
    const user = JSON.parse(localStorage.getItem("user"));
  data.forEach(order => {
    div.innerHTML += `
        <div style="border:1px solid black; margin:10px; padding:10px;">
            <p>Total: ₹${order.total}</p>
            <p>Date: ${new Date(order.date).toLocaleString()}</p>
            <p>Status: ${order.status}</p>   ✅
        </div>
    `;
});
  if (!user) {
        alert("Login karo ❌");
        return;
    }

    fetch(`http://localhost:5000/api/orders/${user.email}`)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("orders");
        div.innerHTML = "<h2>Your Orders</h2>";

        data.forEach(order => {
            div.innerHTML += `
                <div style="border:1px solid black; margin:10px; padding:10px;">
                    <p>Total: ₹${order.total}</p>
                    <p>Date: ${new Date(order.date).toLocaleString()}</p>
                </div>
            `;
        });
    });
}
function showUser() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        document.getElementById("userSection").style.display = "block";
        document.getElementById("username").innerText = user.email;

        // hide login form
        document.getElementById("authSection").style.display = "none";

        // SHOW FOOD
        document.getElementById("list").style.display = "block";
    }
}
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.reload();
}
window.onload = function() {
    showUser();
};

function payNow() {
    if (cart.length === 0) {
        alert("Cart empty hai ❌");
        return;
    }

    alert("Payment successful (Demo) ✅");

    // Direct order place
    placeOrder();
}
function searchFood() {
    const value = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}
function filterCategory(type) {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();

        if (type === "all" || text.includes(type)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}
