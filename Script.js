let total = 0;
const tg = window.Telegram.WebApp; // Initialize Telegram
tg.expand(); // Make the app full screen

function addToCart(price) {
    total += price;
    document.getElementById('total').innerText = total;
}

function sendToTelegram() {
    // This sends data back to your Python bot
    tg.sendData(JSON.stringify({amount: total}));
    tg.close();
}
