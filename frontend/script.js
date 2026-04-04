// ================= GLOBAL =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= FETCH RESTAURANTS =================
function loadRestaurants() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

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
    });
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
            localStorage.setItem("user", JSON.stringify({
                email: email,
                name: data.name || email
            }));

            window.location.href = "index.html";
        } else {
            alert(data.message);
        }
    });
}


// ================= SHOW USER (🔥 FIXED) =================
function showUser() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        const btn = document.getElementById("loginBtn");
        const name = document.getElementById("userName");

        if (btn) btn.style.display = "none";
        if (name) name.innerText = "👤 " + user.name;
    }
}


// ================= NAV =================
function goLogin() {
    window.location.href = "login.html";
}


// ================= LOAD =================
window.onload = function () {

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        loadRestaurants();
    }

    renderCart();
    showUser();
};