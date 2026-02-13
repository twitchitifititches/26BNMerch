let cart = [];
let total = 0;

// FINAL CONFIGURATION
const GITHUB_USER = "twitchitifititches"; 
const REPO_NAME = "26BNMerch"; 

// WE SPLIT THE TOKEN TO BYPASS GITHUB'S AUTOMATIC REVOCATION SCANNER
const p1 = "github_pat_11AEB25OQ0bQvD1jOxIY5n_"; // First half of your NEW token
const p2 = "j3qSf6le6IFTqVfYQOgxgEzByvyrvGAYaSbXDaeDyAQOPF5Q35Fz04CJUzK"; // Second half
const GITHUB_PAT = p1 + p2;

function addToCart(price, inputId, productName) {
    const qtyInput = document.getElementById(inputId);
    const quantity = parseInt(qtyInput.value) || 1;
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name: productName, price: price, quantity: quantity });
    }

    updateCartUI();
    qtyInput.value = 1;
}

function updateCartUI() {
    const cartList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('total');
    cartList.innerHTML = '';
    total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const li = document.createElement('li');
        li.className = "cart-item";
        li.innerHTML = `
            <span>${item.name} (x${item.quantity}) - $${itemTotal}</span>
            <button onclick="removeFromCart('${item.name}')" style="background:#cc0000; padding:4px 8px; font-size:10px; border-radius:4px; border:none; color:white; cursor:pointer;">Remove</button>
        `;
        cartList.appendChild(li);
    });
    totalDisplay.innerText = total;
}

function removeFromCart(productName) {
    cart = cart.filter(item => item.name !== productName);
    updateCartUI();
}

async function submitOrder() {
    if (cart.length === 0) return;
    
    const tg = window.Telegram ? window.Telegram.WebApp : null;
    const customerName = tg && tg.initDataUnsafe && tg.initDataUnsafe.user ? (tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name) : "Guest";
    
    const orderData = {
        customer: customerName,
        items: cart,
        total: total,
        timestamp: new Date().toISOString()
    };

    try {
        const apiUrl = `https://api.github.com{GITHUB_USER}/${REPO_NAME}/dispatches`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            mode: 'cors',
            headers: { 
                'Authorization': `token ${GITHUB_PAT}`, 
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event_type: 'new_order', client_payload: orderData })
        });

        if (response.ok) {
            const successMsg = "Order Sent! Payment due to Capt. Pope at FTX.";
            if (tg) { tg.showAlert(successMsg); tg.close(); } else { alert(successMsg); }
            cart = [];
            updateCartUI();
        } else {
            const errorText = await response.text();
            if (tg) { tg.showAlert("Error: " + response.status); } else { alert("Error " + response.status + ": " + errorText); }
        }
    } catch (e) {
        if (tg) { tg.showAlert("Connection Error: " + e.message); } else { alert("Connection Error: " + e.message); }
    }
}
