/* ========== CONFIG ========== */
const API_AUTH = "/api/auth";
const API_MENU = "/api/menu";
const API_ORDER = "/api/order";

/* ========== PAGE ELEMENTS ========== */
const pages = {
  home: document.getElementById("page-home"),
  menu: document.getElementById("page-menu"),
  orders: document.getElementById("page-orders"),
  profile: document.getElementById("page-profile"),
  cart: document.getElementById("page-cart")
};

const badge = document.getElementById("badge");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const ordersList = document.getElementById("orders-list");
const grid = document.getElementById("grid");
const slider = document.getElementById("slider");

// Auth blocks
const authSection = document.getElementById("page-auth");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Admin panel inputs
const adminPanel = document.getElementById("admin-menu-panel");
const adminName = document.getElementById("admin-name");
const adminPrice = document.getElementById("admin-price");
const adminImage = document.getElementById("admin-image");
const adminDesc = document.getElementById("admin-desc");
const adminAddBtn = document.getElementById("admin-add-btn");
const adminSaveBtn = document.getElementById("admin-save-btn");
const adminEditId = document.getElementById("admin-edit-id");

// Detail modal
const detailModal = document.getElementById("detail-modal");
const detailImg = document.getElementById("detail-img");
const detailName = document.getElementById("detail-name");
const detailDesc = document.getElementById("detail-desc");
const detailPrice = document.getElementById("detail-price");
const addDetail = document.getElementById("add-detail");
const closeDetail = document.getElementById("close-detail");

// Search elements
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");

/* ========== STATE ========== */
let MENU = [];
let CART = JSON.parse(localStorage.getItem("cart_v1") || "[]");
let token = localStorage.getItem("token") || null;
let currentDetail = null;

/* ========== HELPERS ========== */
function formatRp(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}
function persist() {
  localStorage.setItem("cart_v1", JSON.stringify(CART || []));
  updateCartUI();
}

// --- UPDATE: FUNGSI TOAST YANG LEBIH CANGGIH ---
function showToast(msg) {
  // 1. Coba pakai library Toastr jika ada
  if (window.toastr) {
     return toastr.success(msg); // Pakai 'success' biar warna hijau
  }
  
  // 2. Fallback: Buat notifikasi sendiri jika tidak ada library
  let t = document.getElementById("custom-toast-box");
  if (!t) {
    t = document.createElement("div");
    t.id = "custom-toast-box";
    // Style notifikasi: Hitam, Pojok Kanan Bawah
    t.style.cssText = "position:fixed; bottom:20px; right:20px; background: rgba(0,0,0,0.8); color:white; padding:12px 24px; border-radius:8px; z-index:9999; font-size:14px; font-weight:500; transition: all 0.3s ease; opacity:0; transform: translateY(20px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);";
    document.body.appendChild(t);
  }
  
  t.innerHTML = `<i class="fa-solid fa-check-circle" style="margin-right:8px; color:#4CAF50;"></i> ${msg}`;
  
  // Animasi Muncul
  requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateY(0)";
  });

  // Hilang setelah 3 detik
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(20px)";
  }, 3000);
  
  console.log("TOAST:", msg);
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch(e){ return null; }
}

/* ========== AUTH: VERIFY ON LOAD ========== */
async function verifyTokenOnLoad() {
  token = localStorage.getItem("token") || null;
  if (!token) {
    updateProfileUI();
    updateAdminUI();
    return;
  }

  try {
    const res = await fetch(API_AUTH + "/verify", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    });
    const j = await res.json();
    if (j.success && j.user) {
      localStorage.setItem("user", JSON.stringify(j.user));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      token = null;
    }
  } catch (e) {
    console.error("verify error", e);
  } finally {
    updateProfileUI();
    updateAdminUI();
  }
}

/* ========== AUTH UI ========== */
function openAuth(mode = "login") {
  if (!authSection) return;
  authSection.style.display = "block";
  document.getElementById("auth-title").innerText = mode === "login" ? "Login" : "Register";
  if (loginForm) loginForm.style.display = mode === "login" ? "block" : "none";
  if (registerForm) registerForm.style.display = mode === "login" ? "none" : "block";
}
function openLogin(){ openAuth("login"); }

/* ========== NAV / PAGES ========== */
function showPage(name) {
  if (authSection) authSection.style.display = "none";
  Object.values(pages).forEach(p => p && p.classList.remove("active"));
  const target = pages[name];
  if (target) target.classList.add("active");
  if (name === "orders") loadOrders();
}

// wire nav buttons
["nav-home","nav-menu","nav-orders","nav-profile"].forEach(id=>{
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", (e)=>{
    e.preventDefault?.();
    
    if (id === "nav-profile") {
      const user = getUser();
      if (user) showPage("profile");
      else {
        showPage("profile");      
        updateProfileUI();        
      }
      return;
    }

    const page = id.replace("nav-","");
    showPage(page);
  });
});
document.getElementById("btn-cart")?.addEventListener("click", ()=> showPage("cart"));
document.getElementById("btn-open-auth")?.addEventListener("click", ()=>{
  showPage("profile");
  updateProfileUI();
});
document.getElementById("cta-menu")?.addEventListener("click", ()=> showPage("menu"));
document.getElementById("cta-menu-banner")?.addEventListener("click", ()=> showPage("menu"));

/* ========== CART ========== */
function addToCart(item) {
  const available = typeof item.stock === "number" ? item.stock : Infinity;
  const found = CART.find(x=> x._id === item._id);
  if (found) {
    if (found.qty >= available) {
      showToast("Stok habis, tidak bisa tambah lagi");
      return;
    }
    found.qty++;
  } else {
    if (available <= 0) {
      showToast("Stok habis");
      return;
    }
    CART.push({...item, qty:1});
  }
  persist();
}
function changeQty(id,delta){
  const idx = CART.findIndex(x=> x._id === id);
  if (idx === -1) return;
  const item = CART[idx];
  const available = typeof item.stock === "number" ? item.stock : Infinity;
  if (delta > 0 && item.qty + delta > available) {
    showToast("Tidak bisa tambah, stok tidak mencukupi");
    return;
  }
  item.qty += delta;
  if (item.qty <= 0) CART.splice(idx,1);
  persist();
}
function updateCartUI(){
  if (badge) badge.innerText = CART.reduce((s,i)=> s + (i.qty||0), 0);
  if (cartTotalEl) {
    const total = CART.reduce((s,i)=> s + (i.qty||0) * (i.price||0), 0);
    cartTotalEl.innerText = formatRp(total);
  }
  if (!cartItemsEl) return;
  cartItemsEl.innerHTML = "";
  if (CART.length === 0) {
    cartItemsEl.innerHTML = "<div style='text-align:center; padding:40px; color:var(--text-light);'><i class='fa-solid fa-cart-shopping' style='font-size:48px; margin-bottom:16px; display:block; opacity:0.5;'></i>Keranjang Anda kosong</div>";
    return;
  }
  CART.forEach(it=>{
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${it.image}" alt="${it.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <h4 class="cart-item-name">${it.name}</h4>
        <p class="cart-item-price">${formatRp(it.price)}</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn dec" data-id="${it._id}" title="Kurangi">−</button>
        <span>${it.qty}</span>
        <button class="qty-btn inc" data-id="${it._id}" title="Tambah">+</button>
      </div>
      <button class="cart-item-remove" data-id="${it._id}" title="Hapus dari keranjang">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    cartItemsEl.appendChild(row);
  });
  cartItemsEl.querySelectorAll(".dec").forEach(b=> b.addEventListener("click", ()=> changeQty(b.dataset.id,-1)));
  cartItemsEl.querySelectorAll(".inc").forEach(b=> b.addEventListener("click", ()=> changeQty(b.dataset.id,1)));
  cartItemsEl.querySelectorAll(".cart-item-remove").forEach(b=> b.addEventListener("click", ()=> changeQty(b.dataset.id,-999)));
}

/* ========== RENDER MENU ========== */
function renderSlider(items){
  if(!slider) return;
  slider.innerHTML = "";
  (items || []).slice(0,12).forEach(item=>{
    const c = document.createElement("div"); c.className = "card";
    c.innerHTML = `
      <div class="card-img" style="background-image:url('${item.image}')"></div>
      <h4>${item.name}</h4>
      <p>${formatRp(item.price)}</p>
    `;
    c.addEventListener("click", ()=> openDetail(item));
    slider.appendChild(c);
  });
}

function renderGrid(items){
  if(!grid) return;
  grid.innerHTML = "";
  (items || []).forEach(item=>{
    const w = document.createElement("div");
    w.className = "menu-card";
    w.dataset.id = item._id;
    w.innerHTML = `
      <img class="menu-img" src="${item.image || '/img/sld1.jpg'}" alt="${item.name}" />
      <div class="menu-body">
        <h3 class="menu-title">${item.name}</h3>
        <p class="menu-price">${formatRp(item.price)}</p>
        <p class="menu-desc">${item.description || ""}</p>
        <p class="menu-stock" style="margin: 8px 0 0 0; font-size: 13px; color: var(--text-light);">
          ${item.stock !== undefined ? `Stok: ${item.stock}` : "Stok: 0"}
        </p>
        <div class="action-container" style="display: flex; gap: 8px; margin-top: auto;">
          <button class="primary-btn-add" data-id="${item._id}" style="flex: 1; padding: 10px; background: var(--primary); color: white; border: none; border-radius: var(--radius); cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s ease;">Add</button>
        </div>
      </div>
    `;

    w.addEventListener("click", (e)=>{
      if (e.target.classList.contains("primary-btn-add")) return;
      openDetail(item);
    });

    grid.appendChild(w);
  });
}

/* ========== GLOBAL DELEGATED CLICK HANDLER ========== */
document.addEventListener("click", async (e) => {

  // --- PERBAIKAN: ADD TO CART (PAKAI showToast) ---
  if (e.target.classList.contains("primary-btn-add")) {
    const id = e.target.dataset.id;
    const it = MENU.find(x => x._id === id);
    if (it) {
        addToCart(it);
        // Tampilkan Toast Notifikasi
        showToast("Berhasil masuk keranjang");
    }
    return;
  }

  // EDIT (populates admin form)
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    try {
      const r = await fetch(`${API_MENU}/${id}`, {
        headers: token ? { "Authorization": "Bearer " + token } : {}
      });
      if (!r.ok) return showToast("Gagal ambil data menu");
      const res = await r.json();
      const item = res.data || res;
      
      if (adminName) adminName.value = item.name || "";
      if (adminPrice) adminPrice.value = item.price || "";
      if (adminImage) {
        if (adminImage.type && adminImage.type === "file") adminImage.value = "";
        else adminImage.value = item.image || "";
      }
      if (adminDesc) adminDesc.value = item.description || "";
      if (adminEditId) adminEditId.value = id;
      
      if (adminPanel) {
        adminPanel.style.display = "block";
        adminPanel.scrollIntoView({ behavior: "smooth" });
      }
      
      showToast("Data menu siap diupdate");
      return;
    } catch (err) {
      console.error(err);
      showToast("Error mengambil menu");
      return;
    }
  }

  // DELETE
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    if (!confirm("Yakin hapus menu?")) return;
    try {
      const res = await fetch(`${API_MENU}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + (token || "") }
      });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        return showToast(j.msg || "Gagal hapus");
      }
      showToast("Menu dihapus");
      await loadMenu();
    } catch (err) {
      console.error(err);
      showToast("Error hapus menu");
    }
    return;
  }

});

/* ========== DETAIL MODAL ========== */
function openDetail(item){
  currentDetail = item;
  if (detailImg) detailImg.src = item.image || "";
  if (detailName) detailName.innerText = item.name || "";
  if (detailDesc) detailDesc.innerText = item.description || "";
  if (detailPrice) detailPrice.innerText = formatRp(item.price);
  const stockText = item.stock !== undefined ? item.stock : 0;
  const stockLabel = stockText > 0 ? `Stok: ${stockText}` : "Stok: Habis";
  const detailStockEl = document.getElementById("detail-stock");
  if (detailStockEl) detailStockEl.innerText = stockLabel;
  if (addDetail) {
    addDetail.disabled = stockText <= 0;
    addDetail.innerText = stockText > 0 ? "Tambah ke Keranjang" : "Stok Habis";
  }
  if (detailModal) detailModal.classList.add("open");
}
closeDetail?.addEventListener("click", ()=> detailModal.classList.remove("open"));

// --- PERBAIKAN: ADD TO CART DARI DETAIL MODAL (PAKAI showToast) ---
addDetail?.addEventListener("click", ()=> { 
    if (currentDetail) {
        addToCart(currentDetail);
        showToast("Berhasil masuk keranjang");
    }
    detailModal.classList.remove("open"); 
});

/* ========== SLIDER CONTROLS ========== */
document.getElementById("slide-left")?.addEventListener("click", ()=> slider.scrollBy({left:-360, behavior:"smooth"}));
document.getElementById("slide-right")?.addEventListener("click", ()=> slider.scrollBy({left:360, behavior:"smooth"}));

/* ========== LOAD MENU ========== */
async function loadMenu(){
  try {
    const res = await fetch(API_MENU, {
      headers: token ? { "Authorization": "Bearer " + token } : {}
    });
    if (!res.ok) throw new Error("Failed to load");
    const data = await res.json();
    
    MENU = data.data ? (Array.isArray(data.data) ? data.data : []) : (Array.isArray(data) ? data : []);
    
    renderSlider(MENU);
    renderGrid(MENU);
    updateCartUI();
    updateAdminUI();
  } catch(err){
    console.error("Gagal memuat menu", err);
    showToast("Gagal memuat menu");
  }
}

/* ========== AUTH: register / login handlers ========== */
document.getElementById("btn-register")?.addEventListener("click", async ()=>{
  const name = document.getElementById("reg-name")?.value?.trim();
  const email = document.getElementById("reg-email")?.value?.trim();
  const pass = document.getElementById("reg-pass")?.value;
  if(!name || !email || !pass) return showToast("Lengkapi data");
  try{
    const r = await fetch(API_AUTH + "/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name, email, password: pass })
    });
    const j = await r.json();
    if(!j.success) return showToast(j.msg || "Register gagal");
    showToast("Register sukses, silakan login");
    openLogin();
  }catch(e){ console.error(e); showToast("Register error"); }
});

document.getElementById("btn-login")?.addEventListener("click", async ()=>{
  const email = document.getElementById("login-email")?.value?.trim();
  const pass = document.getElementById("login-pass")?.value;
  if(!email || !pass) return showToast("Isi email & password");
  try{
    const r = await fetch(API_AUTH + "/login", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ email, password: pass })
    });
    const j = await r.json();
    if(!j.success) return showToast(j.msg || "Login gagal");
    token = j.token;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(j.user));
    showToast("Login sukses");
    if (authSection) authSection.style.display = "none";
    updateProfileUI();
    updateAdminUI();
    await loadMenu();
  }catch(e){ console.error(e); showToast("Login error"); }
});

/* ========== PROFILE UI ========== */
function updateProfileUI(){
  const user = getUser();
  const profileArea = document.getElementById("profile-area");
  const profileCard = document.getElementById("profile-card");
  const profileEditForm = document.getElementById("profile-edit-form");
  const editName = document.getElementById("edit-name");
  const editEmail = document.getElementById("edit-email");
  const isAdmin = user && user.role === "admin";
  
  const navOrders = document.getElementById("nav-orders");
  if (navOrders) {
    navOrders.style.display = isAdmin ? "none" : "block";
  }

  if (user) {
    profileArea.style.display = "none";
    profileCard.style.display = "block";
    document.getElementById("profile-name").innerText = user.name || "";
    document.getElementById("profile-email").innerText = user.email || "";
    document.getElementById("profile-role").innerText = user.role ? `Role: ${user.role}` : "Role: pengguna";

    const profilePic = document.getElementById("profile-pic");
    const initials = user.name ? user.name.split(" ").map(part => part[0]).join("").slice(0, 2) : "U";
    profilePic.src = user.profileImage ? user.profileImage : `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ff6b22&color=ffffff&rounded=true&size=256`;
    profilePic.alt = user.name ? `Foto profil ${user.name}` : "Profil pengguna";

    if (editName) editName.value = user.name || "";
    if (editEmail) editEmail.value = user.email || "";
    if (document.getElementById("edit-profile-image")) document.getElementById("edit-profile-image").value = "";

    if (profileEditForm) {
      profileEditForm.style.display = "none";
    }
  } else {
    profileArea.style.display = "block";
    profileCard.style.display = "none";
    if (profileEditForm) profileEditForm.style.display = "none";
    const profilePic = document.getElementById("profile-pic");
    if (profilePic) {
      profilePic.src = "/img/profile.jpg";
      profilePic.alt = "Profile default";
    }
  }
}

const profileEditButton = document.getElementById("btn-edit-profile");
const profileCancelButton = document.getElementById("btn-cancel-edit");
const profileEditFormElement = document.getElementById("profile-edit-form");
const editNameInput = document.getElementById("edit-name");
const editEmailInput = document.getElementById("edit-email");

profileEditButton?.addEventListener("click", () => {
  if (profileEditFormElement) {
    profileEditFormElement.style.display = "block";
    profileEditFormElement.scrollIntoView({ behavior: "smooth" });
  }
});

profileCancelButton?.addEventListener("click", () => {
  if (profileEditFormElement) {
    profileEditFormElement.style.display = "none";
  }
});

profileEditFormElement?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nameValue = editNameInput?.value.trim() || "";
  const emailValue = editEmailInput?.value.trim() || "";
  const profileFile = document.getElementById("edit-profile-image")?.files?.[0];
  if (!nameValue || !emailValue) {
    return showToast("Nama dan email harus diisi");
  }

  try {
    const formData = new FormData();
    formData.append("name", nameValue);
    formData.append("email", emailValue);
    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      return showToast(data.msg || "Gagal memperbarui profil");
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    updateProfileUI();
    showToast("Profil berhasil diperbarui");
    if (profileEditFormElement) profileEditFormElement.style.display = "none";
  } catch (error) {
    console.error(error);
    showToast("Terjadi kesalahan saat menyimpan profil");
  }
});

/* ========== LOGOUT ========== */
document.getElementById("btn-logout")?.addEventListener("click", ()=>{
  token = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateProfileUI();
  updateAdminUI();
  showToast("Logout sukses");
  showPage("home");
});

/* ========== CHECKOUT ========== */
document.getElementById("checkout")?.addEventListener("click", async ()=>{
  if (CART.length === 0) return showToast("Cart kosong");
  
  if(!token){
    if(confirm("Anda perlu login untuk checkout. Login sekarang?")) {
      window.location.href = "/login.html";
    }
    return;
  }
  
  localStorage.setItem("cart", JSON.stringify(CART));
  window.location.href = "/checkout.html";
});

/* ========== LOAD ORDERS ========== */
async function loadOrders(){
  if (!token) { if (ordersList) ordersList.innerHTML = "Silakan login untuk melihat pesanan."; return; }
  try{
    if (ordersList) ordersList.innerHTML = "Loading orders...";
    const res = await fetch(API_ORDER + "/me", { headers: { "Authorization": "Bearer " + token }});
    if (!res.ok) { if (ordersList) ordersList.innerHTML = "Gagal memuat pesanan."; return; }
    const response = await res.json();
    
    const arr = response.data || response;
    
    if (!arr || arr.length === 0) { if (ordersList) ordersList.innerHTML = "<p>Tidak ada pesanan.</p>"; return; }
    if (ordersList) ordersList.innerHTML = "";
    arr.forEach(o=>{
      const el = document.createElement("div");
      el.className = "order-card";
      el.style.cursor = "pointer";
      const statusColors = {
        pending: "#FFA726",
        processing: "#42A5F5",
        ready: "#AB47BC",
        completed: "#66BB6A",
        cancelled: "#EF5350"
      };
      const statusColor = statusColors[o.status] || "#999";
      el.innerHTML = 
        `<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
          <div style="flex:1;">
            <h4 style="margin:0 0 8px 0; font-size:16px;">Order #${o._id}</h4>
            <p style="margin:0 0 6px 0; color:var(--text-light); font-size:13px;">Tanggal: ${new Date(o.createdAt).toLocaleString()}</p>
            <p style="margin:0; color:var(--text-light); font-size:13px;">${o.items.length} item</p>
          </div>
          <div style="text-align:right;">
            <div style="background:${statusColor}; color:white; padding:6px 12px; border-radius:var(--radius); font-size:12px; font-weight:600; margin-bottom:8px;">${o.status}</div>
            <p style="margin:0; font-weight:700; color:var(--primary);">${formatRp(o.total)}</p>
          </div>
        </div>`;
      el.addEventListener("click", ()=> showOrderDetail(o));
      ordersList.appendChild(el);
    });
  }catch(e){ console.error(e); if (ordersList) ordersList.innerHTML = "Gagal memuat pesanan."; }
}

/* ========== ORDER DETAIL MODAL ========== */
const orderDetailModal = document.getElementById("order-detail-modal");
const orderStatusSelect = document.getElementById("order-status");
const orderStatusBadge = document.getElementById("order-status-badge");
const btnSaveStatus = document.getElementById("btn-save-status");
let currentOrderData = null;

const statusColors = {
  pending: "#FFA726",
  processing: "#42A5F5",
  ready: "#AB47BC",
  completed: "#66BB6A",
  cancelled: "#EF5350"
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled"
};

function showOrderDetail(orderData){
  currentOrderData = orderData;
  const user = getUser();
  const isAdmin = user && user.role === "admin";
  
  document.getElementById("order-id").innerText = orderData._id;
  document.getElementById("order-date").innerText = new Date(orderData.createdAt).toLocaleString();
  
  const statusColor = statusColors[orderData.status] || "#999";
  const statusLabel = statusLabels[orderData.status] || orderData.status;
  orderStatusBadge.innerText = statusLabel;
  orderStatusBadge.style.backgroundColor = statusColor;
  orderStatusSelect.value = orderData.status;
  
  if (isAdmin) {
    orderStatusBadge.style.display = "none";
    orderStatusSelect.style.display = "inline-block";
    btnSaveStatus.style.display = "block";
  } else {
    orderStatusBadge.style.display = "inline-block";
    orderStatusSelect.style.display = "none";
    btnSaveStatus.style.display = "none";
  }
  
  document.getElementById("order-total").innerText = formatRp(orderData.total);
  
  const itemsDiv = document.getElementById("order-items");
  itemsDiv.innerHTML = "";
  orderData.items.forEach(it=>{
    const div = document.createElement("div");
    div.innerHTML = `
      <div>
        <p style="margin:0; font-weight:600; color:var(--text-dark);">${it.name}</p>
        <p style="margin:0; color:var(--text-light); font-size:13px;">Qty: ${it.qty}</p>
      </div>
      <p style="margin:0; font-weight:600; color:var(--primary);">${formatRp(it.price * it.qty)}</p>
    `;
    itemsDiv.appendChild(div);
  });
  
  if (orderDetailModal) orderDetailModal.classList.add("open");
}

function closeOrderDetail(){
  if (orderDetailModal) orderDetailModal.classList.remove("open");
  currentOrderData = null;
}

async function updateOrderStatus(){
  if (!currentOrderData || !token) return showToast("Error: Order data missing");
  const user = getUser();
  if (!user || user.role !== "admin") return showToast("Hanya admin yang bisa mengubah status");
  
  const newStatus = orderStatusSelect.value;
  
  try {
    const res = await fetch(`${API_ORDER}/${currentOrderData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ status: newStatus })
    });
    const j = await res.json();
    if (!res.ok) return showToast(j.msg || "Gagal update status");
    showToast("Status pesanan diperbarui");
    currentOrderData.status = newStatus;
    closeOrderDetail();
    await loadOrders();
  } catch (err) {
    console.error(err);
    showToast("Gagal update status");
  }
}

document.getElementById("close-order-detail")?.addEventListener("click", closeOrderDetail);
document.getElementById("btn-close-order-detail")?.addEventListener("click", closeOrderDetail);
document.getElementById("btn-save-status")?.addEventListener("click", updateOrderStatus);

/* ========== ADMIN UI & CRUD ========== */
function updateAdminUI(){
  const user = getUser();
  const isAdmin = user && user.role === "admin";
  if (adminPanel) adminPanel.style.display = isAdmin ? "block" : "none";
  document.querySelectorAll(".admin-actions").forEach(a=> a.style.display = isAdmin ? "block" : "none");
  
  const adminLink = document.getElementById("admin-link");
  if (adminLink) adminLink.style.display = isAdmin ? "inline-flex" : "none";
  
  if (!isAdmin && adminEditId) adminEditId.value = "";
}

// ADD or UPDATE menu (admin form)
adminAddBtn?.addEventListener("click", async ()=>{
  const name = adminName?.value?.trim();
  const price = adminPrice?.value;
  const desc = adminDesc?.value?.trim();
  const editId = adminEditId?.value || "";

  if(!name || !price) return showToast("Nama & harga wajib diisi");
  if(!token) return showToast("Harus login sebagai admin");

  try {
    adminAddBtn.disabled = true;
    adminAddBtn.textContent = editId ? "Updating..." : "Adding...";

    const method = editId ? "PUT" : "POST";
    const endpoint = editId ? `${API_MENU}/${editId}` : API_MENU;

    if (adminImage && adminImage.type === "file" && adminImage.files && adminImage.files.length > 0) {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("description", desc || "");
      fd.append("image", adminImage.files[0]);
      
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Authorization": "Bearer " + token },
        body: fd
      });
      const j = await res.json();
      if (!res.ok) return showToast(j.msg || `Gagal ${editId ? "update" : "tambah"}`);
      showToast(editId ? "Menu diperbarui" : "Menu ditambahkan");
    } else {
      const imageUrl = adminImage?.value?.trim() || "";
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type":"application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ name, price, description: desc, image: imageUrl })
      });
      const j = await res.json();
      if (!res.ok) return showToast(j.msg || `Gagal ${editId ? "update" : "tambah"}`);
      showToast(editId ? "Menu diperbarui" : "Menu ditambahkan");
    }
    
    if (adminEditId) adminEditId.value = "";
    if (adminName) adminName.value = "";
    if (adminPrice) adminPrice.value = "";
    if (adminDesc) adminDesc.value = "";
    if (adminImage && adminImage.type !== "file") adminImage.value = "";
    adminAddBtn.textContent = "Tambah Menu";
    
    await loadMenu();
  } catch (err) {
    console.error(err);
    showToast(editId ? "Gagal update menu" : "Gagal tambah menu");
  } finally {
    adminAddBtn.disabled = false;
    adminAddBtn.textContent = "Tambah Menu";
  }
});

/* ========== SEARCH FUNCTIONALITY ========== */
function filterMenu(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) {
    renderGrid(MENU);
    if (clearSearchBtn) clearSearchBtn.style.display = "none";
    return;
  }
  
  const filtered = MENU.filter(item => 
    item.name.toLowerCase().includes(term) || 
    (item.description && item.description.toLowerCase().includes(term))
  );
  
  renderGrid(filtered);
  if (clearSearchBtn) clearSearchBtn.style.display = "flex";
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    filterMenu(e.target.value);
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    filterMenu("");
  });
}

/* ========== INITIALIZE ========== */
(async ()=>{
  await verifyTokenOnLoad();
  updateCartUI();
  await loadMenu();
  updateAdminUI();
})();