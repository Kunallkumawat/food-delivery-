// ================= GLOBAL =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= FETCH RESTAURANTS =================
function loadRestaurants() {
    const user = JSON.parse(localStorage.getItem("user"));

    // 🔥 STOP if not logged in
    if (!user) {
        console.log("❌ Not logged in");
        return;
    }

    fetch("https://food-delivery-b2f6.onrender.com/api/restaurants")
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("list");
        if (!list) return;

        list.innerHTML = "";

        data.forEach(r => {
            const div = document.createElement("div");
            div.classList.add("card");

            let menuHTML = "";

            r.menu.forEach(item => {
                menuHTML += `
                    <div>
                        ${item.name} - ₹${item.price}<br>
                        <button class="btn" onclick="addToCart('${item.name}', ${item.price})">Add</button>
                    </div>
                `;
            });

            div.innerHTML = `
                <img src="${r.image}" onerror="this.src='https://picsum.photos/300'" />
                <div class="card-content">
                  <h3>${r.name}</h3>
                  <p>${r.address}</p>
                  <p>⭐ ${r.rating}</p>
                  ${menuHTML}
                </div>
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
        window.location.href = "login.html";
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

    if (!cartDiv) return;

    cartDiv.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        cartDiv.innerHTML += `
            <div>
                ${item.name} x${item.quantity} - ₹${item.price}
                <button onclick="increase('${item.name}')">+</button>
                <button onclick="decrease('${item.name}')">-</button>
            </div>
        `;
    });

    totalDiv.innerText = total;
    localStorage.setItem("cart", JSON.stringify(cart));
}

function increase(name) {
    cart.find(i => i.name === name).quantity++;
    renderCart();
}

function decrease(name) {
    const item = cart.find(i => i.name === name);
    item.quantity--;

    if (item.quantity <= 0) {
        cart = cart.filter(i => i.name !== name);
    }

    renderCart();
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

    fetch("https://food-delivery-b2f6.onrender.com/api/orders", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            userEmail: user.email,
            items: cart,
            total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
            date: new Date(),
            status: "pending"
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("Order placed ✅");
        cart = [];
        renderCart();
        openTracking();
    });
}


// ================= TRACKING =================
function openTracking() {
    window.location.href = "map.html";
}


// ================= LOGIN =================
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email.includes("@")) {
        alert("Enter valid email ❌");
        return;
    }

    fetch("https://food-delivery-b2f6.onrender.com/api/login", {
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


// ================= ORDERS =================
function loadOrders() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(`https://food-delivery-b2f6.onrender.com/api/orders/${user.email}`)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("orders");
        if (!div) return;

        div.innerHTML = "<h2>Your Orders</h2>";

        data.forEach(order => {
            div.innerHTML += `
                <div>
                    ₹${order.total} | ${order.status} | 
                    ${new Date(order.date).toLocaleString()}
                    <button onclick="openTracking()">Track</button>
                </div>
            `;
        });
    });
}

function checkLoginForOrders() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Login first ❌");
        return;
    }
    loadOrders();
}


// ================= ADMIN =================
function addRestaurant() {
    const name = document.getElementById("name").value;
    const image = document.getElementById("image").value;
    const address = document.getElementById("address").value;
    const rating = document.getElementById("rating").value;

    const menuText = document.getElementById("menu").value;

    const menu = menuText.split(",").map(i => {
        const [n, p] = i.split(":");
        return { name: n, price: Number(p) };
    });

    fetch("https://food-delivery-b2f6.onrender.com/api/restaurants", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, image, address, rating, menu })
    })
    .then(res => res.json())
    .then(() => alert("Restaurant Added ✅"));
}


// ================= DARK MODE =================
function toggleDark() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}


// ================= LOCATION =================
function saveLocation() {
    const loc = document.getElementById("location").value;
    localStorage.setItem("location", loc);
    alert("Location set: " + loc);
}


// ================= UI =================
function showUser() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("userSection").style.display = "block";
        document.getElementById("username").innerText = user.email;
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

function searchFood() {
    const value = document.getElementById("search").value.toLowerCase();

    document.querySelectorAll(".card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(value)
            ? "block"
            : "none";
    });
}


// ================= LOAD =================
window.onload = function () {

    const user = JSON.parse(localStorage.getItem("user"));
    const list = document.getElementById("list");

if (!user && list) {
  list.style.display = "none";
}
    // 🔥 ONLY LOAD IF LOGIN
    if (user) {
        loadRestaurants();
    }

    renderCart();
    showUser();

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
};