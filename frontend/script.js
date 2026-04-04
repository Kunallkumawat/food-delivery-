const API = "https://food-delivery-ljeo.onrender.com";

// ================= GLOBAL =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= RESTAURANTS =================
function loadRestaurants() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        document.getElementById("list").innerHTML = "<h2>Login to view restaurants 🔒</h2>";
        return;
    }

    fetch(`${API}/api/restaurants`)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("list");
        list.innerHTML = "";

        data.forEach(r => {
            const div = document.createElement("div");
            div.classList.add("card");

            let menuHTML = "";

            r.menu.forEach(item => {
                menuHTML += `
                    <div>
                        ${item.name} - ₹${item.price}
                        <button onclick="addToCart('${item.name}', ${item.price})">Add</button>
                    </div>
                `;
            });

            div.innerHTML = `
                <img src="${r.image}" />
                <h3>${r.name}</h3>
                <p>${r.address}</p>
                <p>⭐ ${r.rating}</p>
                ${menuHTML}
            `;

            list.appendChild(div);
        });
    });
}

// ================= CART =================
function addToCart(name, price) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        return;
    }

    const existing = cart.find(i => i.name === name);

    if (existing) existing.quantity++;
    else cart.push({ name, price, quantity: 1 });

    renderCart();
}

function renderCart() {
    const cartDiv = document.getElementById("cartItems");
    const totalDiv = document.getElementById("total");

    cartDiv.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        cartDiv.innerHTML += `
            <div>
                ${item.name} x${item.quantity}
            </div>
        `;
    });

    totalDiv.innerText = total;
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= ORDER =================
function payNow() {
    const user = JSON.parse(localStorage.getItem("user"));

    fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userEmail: user.email,
            items: cart,
            total: cart.reduce((s, i) => s + i.price * i.quantity, 0)
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("Order placed ✅");
        cart = [];
        renderCart();
    });
}

// ================= LOGIN =================
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${API}/api/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("user", JSON.stringify({ email }));
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }
    });
}

// ================= USER =================
function showUser() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        document.getElementById("userName").innerText = user.email;
        document.getElementById("loginBtn").style.display = "none";
    }
}

// ================= LOAD =================
window.onload = function () {
    loadRestaurants();
    renderCart();
    showUser();
};