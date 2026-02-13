let cart = [];
let total = 0;

// FINAL CONFIGURATION
const GITHUB_USER = "twitchitifititches"; 
const REPO_NAME = "26BNMerch"; 
const GITHUB_PAT = "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";

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
            <button onclick="removeFromCart('${item.name}')" style="background:#cc0000; padding:4px 8px; font-size:10px; border-radius:4px; border:none; color:white;">Remove</button>
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
    const tg = window.Telegram.WebApp;
    
    const orderData = {
        customer: tg.initDataUnsafe.user?.username || tg.initDataUnsafe.user?.first_name || "Guest",
        items: cart,
        total: total,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`https://api.github.com{GITHUB_USER}/${REPO_NAME}/dispatches`, {
            method: 'POST',
            headers: { 
                'Authorization': `token ${GITHUB_PAT}`, 
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event_type: 'new_order', client_payload: orderData })
        });

        if (response.ok) {
            tg.showAlert("Order Sent! Payment due to Capt. Pope at FTX.");
            cart = [];
            updateCartUI();
            tg.close();
        } else {
            tg.showAlert("Failed to send. Check GitHub Repo settings.");
        }
    } catch (e) {
        tg.showAlert("Error: " + e.message);
    }
}
