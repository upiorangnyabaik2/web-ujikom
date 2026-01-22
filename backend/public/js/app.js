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

// Auth blocks
const authSection = document.getElementById("page-auth");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Admin panel inputs (if present in DOM)
const adminPanel = document.getElementById("admin-menu-panel"); // optional
const adminName = document.getElementById("admin-name");
const adminPrice = document.getElementById("admin-price");
const adminImage = document.getElementById("admin-image"); // can be <input type="file"> or text URL
const adminDesc = document.getElementById("admin-desc");
const adminAddBtn = document.getElementById("admin-add-btn");
const adminSaveBtn = document.getElementById("admin-save-btn"); // optional (edit save)
const adminEditId = document.getElementById("admin-edit-id"); // hidden input to store edit id

// Detail modal
const detailModal = document.getElementById("detail-modal");
const detailImg = document.getElementById("detail-img");
const detailName = document.getElementById("detail-name");
const detailDesc = document.getElementById("detail-desc");
const detailPrice = document.getElementById("detail-price");
const addDetail = document.getElementById("add-detail");
const closeDetail = document.getElementById("close-detail");

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
function showToast(msg) {
  if (window.toastr) return toastr.info(msg);
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
    // do not remove token here; verify may fail due to network — but it's safe to clear if you want
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
      // FIX DISINI
      if (user) showPage("profile");
      else {
        showPage("profile");      // tetap masuk page profile
        updateProfileUI();        // tampilkan login area
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

/* ========== CART ========== */
function addToCart(item) {
  const found = CART.find(x=> x._id === item._id);
  if (found) found.qty++;
  else CART.push({...item, qty:1});
  persist();
}
function changeQty(id,delta){
  const idx = CART.findIndex(x=> x._id === id);
  if (idx === -1) return;
  CART[idx].qty += delta;
  if (CART[idx].qty <= 0) CART.splice(idx,1);
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
  const user = getUser();
  const isAdmin = user && user.role === "admin";
  grid.innerHTML = "";
  (items || []).forEach(item=>{
    const w = document.createElement("div");
    w.className = "menu-card"; // use menu-card for admin styling if needed
    w.dataset.id = item._id;
    w.innerHTML = `
      <img class="menu-img" src="${item.image || '/img/sld1.jpg'}" alt="${item.name}" />
      <div class="menu-body">
        <h3 class="menu-title">${item.name}</h3>
        <p class="menu-price">${formatRp(item.price)}</p>
        <p class="menu-desc">${item.description || ""}</p>
      </div>

      <div class="action-container">
        <button class="primary-btn-add" data-id="${item._id}">Add</button><br>
          <button class="edit-btn" data-id="${item._id}">Edit</button>
          <button class="delete-btn" data-id="${item._id}">Delete</button>
        </div>
      </div>
    `;
    grid.appendChild(w);
  });
}

/* ========== GLOBAL DELEGATED CLICK HANDLER ========== */
document.addEventListener("click", async (e) => {

  // ADD TO CART (from grid)
  if (e.target.classList.contains("primary-btn-add")) {
    const id = e.target.dataset.id;
    const it = MENU.find(x => x._id === id);
    if (it) addToCart(it);
    return;
  }

  // EDIT (populates admin form)
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;
    try {
      const r = await fetch(`${API_MENU}/${id}`);
      if (!r.ok) return showToast("Gagal ambil data menu");
      const data = await r.json();
      if (adminName) adminName.value = data.name || "";
      if (adminPrice) adminPrice.value = data.price || "";
      if (adminImage) {
        // if file input, leave empty; if text input, set URL
        if (adminImage.type && adminImage.type === "file") adminImage.value = "";
        else adminImage.value = data.image || "";
      }
      if (adminDesc) adminDesc.value = data.description || "";
      if (adminEditId) adminEditId.value = id;
      // show admin panel if hidden
      if (adminPanel) adminPanel.style.display = "block";
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
  if (detailModal) detailModal.classList.add("open");
}
closeDetail?.addEventListener("click", ()=> detailModal.classList.remove("open"));
addDetail?.addEventListener("click", ()=> { if (currentDetail) addToCart(currentDetail); detailModal.classList.remove("open"); });

/* ========== SLIDER CONTROLS ========== */
document.getElementById("slide-left")?.addEventListener("click", ()=> slider.scrollBy({left:-360, behavior:"smooth"}));
document.getElementById("slide-right")?.addEventListener("click", ()=> slider.scrollBy({left:360, behavior:"smooth"}));

/* ========== LOAD MENU ========== */
async function loadMenu(){
  try {
    const res = await fetch(API_MENU);
    if (!res.ok) throw new Error("Failed to load");
    const data = await res.json();
    MENU = Array.isArray(data) ? data : [];
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

  if (user) {
    // hide "not logged"
    profileArea.style.display = "none";

    // show profile card
    profileCard.style.display = "block";

    document.getElementById("profile-name").innerText = user.name || "";
    document.getElementById("profile-email").innerText = user.email || "";
  } else {
    // show "not logged"
    profileArea.style.display = "block";

    // hide profile card
    profileCard.style.display = "none";
  }
}

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
  
  // Simpan cart ke localStorage dengan key "cart" (untuk checkout.html)
  localStorage.setItem("cart", JSON.stringify(CART));
  
  // Redirect ke checkout page
  window.location.href = "/checkout.html";
});

/* ========== LOAD ORDERS ========== */
async function loadOrders(){
  if (!token) { if (ordersList) ordersList.innerHTML = "Silakan login untuk melihat pesanan."; return; }
  try{
    if (ordersList) ordersList.innerHTML = "Loading orders...";
    const res = await fetch(API_ORDER + "/me", { headers: { "Authorization": "Bearer " + token }});
    if (!res.ok) { if (ordersList) ordersList.innerHTML = "Gagal memuat pesanan."; return; }
    const arr = await res.json();
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
  
  // Show status badge dan select sesuai role
  const statusColor = statusColors[orderData.status] || "#999";
  const statusLabel = statusLabels[orderData.status] || orderData.status;
  orderStatusBadge.innerText = statusLabel;
  orderStatusBadge.style.backgroundColor = statusColor;
  orderStatusSelect.value = orderData.status;
  
  // Hanya admin yang bisa mengubah status
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

// Event listeners untuk order detail modal
document.getElementById("close-order-detail")?.addEventListener("click", closeOrderDetail);
document.getElementById("btn-close-order-detail")?.addEventListener("click", closeOrderDetail);
document.getElementById("btn-save-status")?.addEventListener("click", updateOrderStatus);

/* ========== ADMIN UI & CRUD ========== */
function updateAdminUI(){
  const user = getUser();
  const isAdmin = user && user.role === "admin";
  if (adminPanel) adminPanel.style.display = isAdmin ? "block" : "none";
  document.querySelectorAll(".admin-actions").forEach(a=> a.style.display = isAdmin ? "block" : "none");
  // when admin becomes available, make sure edit-id cleared
  if (!isAdmin && adminEditId) adminEditId.value = "";
}

// ADD menu (admin form) - supports file input or image URL
adminAddBtn?.addEventListener("click", async ()=>{
  const name = adminName?.value?.trim();
  const price = adminPrice?.value;
  const desc = adminDesc?.value?.trim();

  if(!name || !price) return showToast("Name & price wajib");
  if(!token) return showToast("Admin action requires login");

  try {
    // if adminImage is a file input and has files -> use FormData
    if (adminImage && adminImage.type === "file" && adminImage.files && adminImage.files.length > 0) {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("description", desc || "");
      fd.append("image", adminImage.files[0]);
      const res = await fetch(API_MENU, {
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        body: fd
      });
      const j = await res.json();
      if (!res.ok) return showToast(j.msg || "Gagal tambah");
      showToast("Menu ditambahkan");
    } else {
      // treat adminImage as URL (text input)
      const imageUrl = adminImage?.value?.trim() || "";
      const res = await fetch(API_MENU, {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ name, price, description: desc, image: imageUrl })
      });
      const j = await res.json();
      if (!res.ok) return showToast(j.msg || "Gagal tambah");
      showToast("Menu ditambahkan");
    }
    // clear & reload
    if (adminName) adminName.value = "";
    if (adminPrice) adminPrice.value = "";
    if (adminDesc) adminDesc.value = "";
    if (adminImage && adminImage.type !== "file") adminImage.value = "";
    await loadMenu();
  } catch (err) {
    console.error(err);
    showToast("Gagal tambah menu");
  }
});

// SAVE EDIT (if you created adminSaveBtn + hidden adminEditId)
adminSaveBtn?.addEventListener("click", async ()=>{
  const id = adminEditId?.value;
  if (!id) return showToast("Tidak ada data untuk disimpan");
  if (!token) return showToast("Admin action requires login");

  const name = adminName?.value?.trim();
  const price = adminPrice?.value;
  const desc = adminDesc?.value?.trim();

  try {
    if (adminImage && adminImage.type === "file" && adminImage.files && adminImage.files.length > 0) {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("description", desc || "");
      fd.append("image", adminImage.files[0]);
      const res = await fetch(`${API_MENU}/${id}`, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + token },
        body: fd
      });
      const j = await res.json();
      if (!res.ok) return showToast(j.msg || "Gagal update");
      showToast("Menu diperbarui");
    } else {
      const imageUrl = adminImage?.value?.trim() || "";
      const res = await fetch(`${API_MENU}/${id}`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ name, price, description: desc, image: imageUrl })
      });
      const j = await res.json();
      if (!res.ok) return showToast(j.msg || "Gagal update");
      showToast("Menu diperbarui");
    }

    // cleanup
    if (adminEditId) adminEditId.value = "";
    if (adminName) adminName.value = "";
    if (adminPrice) adminPrice.value = "";
    if (adminDesc) adminDesc.value = "";
    if (adminImage && adminImage.type !== "file") adminImage.value = "";
    await loadMenu();
  } catch (err) {
    console.error(err);
    showToast("Gagal update menu");
  }
});

/* ========== INITIALIZE ========== */
(async ()=>{
  await verifyTokenOnLoad();
  updateCartUI();
  await loadMenu();
  updateAdminUI();
})();