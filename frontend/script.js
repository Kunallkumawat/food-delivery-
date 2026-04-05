const API = "https://food-delivery-ljeo.onrender.com";

// ================= GLOBAL =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= RESTAURANTS =================
function loadRestaurants() {
    const user = JSON.parse(localStorage.getItem("user"));
    const list = document.getElementById("list");

    if (!user) {
        list.innerHTML = "<h2>Login to view restaurants 🔒</h2>";
        return;
    }

    fetch(`${API}/api/restaurants`)
    .then(res => res.json())
    .then(data => {
        list.innerHTML = "";

        data.forEach(r => {
            const div = document.createElement("div");
            div.classList.add("card");

            let menuHTML = "";

            r.menu.forEach(item => {
                menuHTML += `
                    <div style="margin:5px 0;">
                        ${item.name} - ₹${item.price}
                        <button onclick="addToCart('${item.name}', ${item.price})">Add</button>
                    </div>
                `;
            });

            div.innerHTML = `
                <img src="${r.image}" style="width:100%; height:150px; object-fit:cover;">
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

    if (!user) {
        alert("Login first ❌");
        return;
    }

    if (cart.length === 0) {
        alert("Cart empty ❌");
        return;
    }

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

// ================= GET ORDERS =================
function loadOrders() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        return;
    }

    fetch(`${API}/api/orders/${user.email}`)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("list");
        list.innerHTML = "";

        data.forEach(order => {

            // 🔥 DATE IN INDIAN FORMAT
            const date = new Date(order.date).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });

            let itemsHTML = "";

            order.items.forEach(i => {
                itemsHTML += `<p>${i.name} x${i.quantity}</p>`;
            });

            const div = document.createElement("div");
            div.classList.add("card");

            div.innerHTML = `
                <h3>🧾 Order</h3>
                ${itemsHTML}
                <p><b>Total:</b> ₹${order.total}</p>
                <p><b>Status:</b> ${order.status}</p>
                <p><b>Date:</b> ${date}</p>
            `;

            list.appendChild(div);
        });
    });
}

// ================= ORDERS BUTTON =================
function checkLoginForOrders() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        return;
    }

    loadOrders();
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

    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const name = document.getElementById("userName");

    if (user) {
        if (name) name.innerText = "👤 " + user.email;
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
        if (name) name.innerText = "";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    location.reload();
}

// ================= LOAD =================
window.onload = function () {
    showUser();
    loadRestaurants();
    renderCart();
};
window.checkLoginForOrders = function () {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Login first ❌");
        return;
    }

    loadOrders();
};