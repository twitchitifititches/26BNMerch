let cart = [];
let total = 0;

// FINAL CONFIGURATION - Using your Google Bridge URL
const PROXY_URL = "https://script.google.com/macros/s/AKfycbyEk3khZc36ezbMMTSVIBYv-Jh_3jN6-R7C-541X8kO70_6xuDRLnA85S8DwMEb4uXC/exec";

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
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "10px";
        li.style.borderBottom = "1px dashed #ccc";
        li.style.paddingBottom = "5px";
        
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
    
    // Check if running inside Telegram WebApp
    const tg = window.Telegram ? window.Telegram.WebApp : null;
    const customerName = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? 
        (tg.initDataUnsafe.user.username || tg.initDataUnsafe.user.first_name) : "Guest";
    
    const orderData = {
        customer: customerName,
        items: cart,
        total: total,
        timestamp: new Date().toISOString()
    };

    try {
        // We send the order to your Google Script, which then tells GitHub to wake up
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            mode: 'no-cors', // Helps bypass browser security blocks
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        // With 'no-cors', we show the alert immediately as the data has been handed off
        const successMsg = "Order Sent! Payment due to Capt. Pope at FTX.";
        if (tg) {
            tg.showAlert(successMsg);
            tg.close();
        } else {
            alert(successMsg);
        }
        
        // Reset the shop
        cart = [];
        updateCartUI();

    } catch (e) {
        const errorMsg = "Connection Error: " + e.message;
        if (tg) { tg.showAlert(errorMsg); } else { alert(errorMsg); }
    }
}
