// Get cart from localStorage
let cartItems = JSON.parse(localStorage.getItem("cart_v1")) || [];
const token = localStorage.getItem("token");

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        showAlert("Anda harus login terlebih dahulu", "error");
        setTimeout(() => {
            window.location.href = "/login.html";
        }, 2000);
        return;
    }

    if (cartItems.length === 0) {
        showAlert("Keranjang belanja kosong", "error");
        setTimeout(() => {
            window.location.href = "/";
        }, 2000);
        return;
    }

    renderOrderSummary();
});

function renderOrderSummary() {
    const itemsContainer = document.getElementById("orderItems");
    let subtotal = 0;

    itemsContainer.innerHTML = "";

    cartItems.forEach((item) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const itemElement = document.createElement("div");
        itemElement.className = "order-item";
        itemElement.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">${item.qty}x @ Rp ${formatCurrency(item.price)}</div>
            </div>
            <div class="item-price">Rp ${formatCurrency(itemTotal)}</div>
        `;
        itemsContainer.appendChild(itemElement);
    });

    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `Rp ${formatCurrency(subtotal)}`;
    document.getElementById("tax").textContent = `Rp ${formatCurrency(tax)}`;
    document.getElementById("totalAmount").textContent = `Rp ${formatCurrency(total)}`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat("id-ID").format(value);
}

function selectPaymentMethod(element) {
    // Remove selected class from all
    document.querySelectorAll(".payment-option").forEach((opt) => {
        opt.classList.remove("selected");
    });
    // Add selected class to clicked
    element.classList.add("selected");
    const radio = element.querySelector("input");
    radio.checked = true;
    
    const paymentMethod = radio.value;
    
    // Hide all payment info
    document.getElementById("xenditPaymentOptions").style.display = "none";
    document.getElementById("transferPaymentOptions").style.display = "none";
    document.getElementById("codPaymentOptions").style.display = "none";
    
    // Show selected payment info
    if (paymentMethod === "xendit") {
        document.getElementById("xenditPaymentOptions").style.display = "block";
    } else if (paymentMethod === "transfer") {
        document.getElementById("transferPaymentOptions").style.display = "block";
        // Update transfer amount
        const total = getTotalAmount();
        document.getElementById("transferAmount").textContent = `Rp ${formatCurrency(total)}`;
    } else if (paymentMethod === "cod") {
        document.getElementById("codPaymentOptions").style.display = "block";
    }
}

async function processCheckout() {
    // Validation
    const recipientName = document.getElementById("recipientName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!recipientName) {
        showAlert("Nama penerima harus diisi", "error");
        return;
    }

    if (!phone) {
        showAlert("Nomor telepon harus diisi", "error");
        return;
    }

    if (!address) {
        showAlert("Alamat pengiriman harus diisi", "error");
        return;
    }

    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Show loading
    document.getElementById("loadingBox").classList.add("show");
    document.getElementById("checkoutBtn").disabled = true;

    try {
        const total = getTotalAmount();
        
        if (paymentMethod === "xendit") {
            const selectedXenditMethod = document.querySelector('input[name="xenditMethod"]:checked')?.value || null;

            // Xendit payment - hit checkout API
            const response = await fetch("/api/checkout/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        menuId: item._id,
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        image: item.image
                    })),
                    total: total,
                    paymentMethod: "xendit",
                    xenditMethod: selectedXenditMethod,
                    recipientName,
                    phone,
                    address,
                    notes: document.getElementById("notes").value.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Hapus cart
                localStorage.removeItem("cart_v1");
                
                // Save order info to localStorage
                localStorage.setItem(
                    "currentOrder",
                    JSON.stringify({
                        orderId: data.orderId,
                        invoiceId: data.invoiceId,
                        amount: data.amount,
                    })
                );

                showAlert("Pesanan berhasil dibuat! Mengarahkan ke pembayaran Xendit...", "success");
                setTimeout(() => {
                    if (data.invoiceUrl) {
                        window.location.href = data.invoiceUrl;
                    } else {
                        window.location.href = `/order-success?orderId=${data.orderId}`;
                    }
                }, 1200);
            } else {
                showAlert(data.message || "Gagal membuat checkout", "error");
            }
        } else if (paymentMethod === "transfer") {
            // Manual transfer - create order with pending status
            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        menuId: item._id,
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        image: item.image
                    })),
                    total: total,
                    status: "pending",
                    paymentMethod: "transfer",
                    recipientName,
                    phone,
                    address,
                    notes: document.getElementById("notes").value.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.removeItem("cart_v1");
                showAlert("Pesanan berhasil dibuat! Silahkan lakukan transfer ke rekening yang telah diberikan.", "success");
                setTimeout(() => {
                    window.location.href = `/order-success?orderId=${data.order._id}`;
                }, 2000);
            } else {
                showAlert(data.msg || data.message || "Gagal membuat pesanan", "error");
            }
        } else if (paymentMethod === "cod") {
            // Cash On Delivery - create order with pending status
            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        menuId: item._id,
                        name: item.name,
                        qty: item.qty,
                        price: item.price,
                        image: item.image
                    })),
                    total: total,
                    status: "pending",
                    paymentMethod: "cod",
                    recipientName,
                    phone,
                    address,
                    notes: document.getElementById("notes").value.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.removeItem("cart_v1");
                showAlert("Pesanan berhasil dibuat! Pembayaran akan dilakukan saat pesanan sampai.", "success");
                setTimeout(() => {
                    window.location.href = `/order-success?orderId=${data.order._id}`;
                }, 2000);
            } else {
                showAlert(data.msg || data.message || "Gagal membuat pesanan", "error");
            }
        }
    } catch (error) {
        console.error("Checkout error:", error);
        showAlert("Terjadi kesalahan: " + error.message, "error");
    } finally {
        document.getElementById("loadingBox").classList.remove("show");
        document.getElementById("checkoutBtn").disabled = false;
    }
}

function getTotalAmount() {
    let subtotal = 0;
    cartItems.forEach((item) => {
        subtotal += item.price * item.qty;
    });
    const tax = Math.round(subtotal * 0.1);
    return subtotal + tax;
}

function showAlert(message, type) {
    const alertBox = document.getElementById("alertBox");
    alertBox.textContent = message;
    alertBox.className = `alert show ${type}`;

    if (type === "success") {
        setTimeout(() => {
            alertBox.classList.remove("show");
        }, 3000);
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}
