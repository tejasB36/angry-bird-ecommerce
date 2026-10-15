const products = [
  {
    id: 1,
    name: "Classic Everyday Tee",
    category: "Clothing",
    price: 799,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 2,
    name: "Minimalist Watch",
    category: "Accessories",
    price: 2499,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 3,
    name: "Everyday Sneakers",
    category: "Clothing",
    price: 3299,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 4,
    name: "Ceramic Coffee Mug",
    category: "Home",
    price: 499,
    badge: "",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 5,
    name: "Daily Carry Backpack",
    category: "Accessories",
    price: 1899,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 6,
    name: "Linen Cushion Cover",
    category: "Home",
    price: 699,
    badge: "",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 7,
    name: "Essential Sunglasses",
    category: "Accessories",
    price: 1199,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=650&q=80"
  },
  {
    id: 8,
    name: "Relaxed Cotton Shirt",
    category: "Clothing",
    price: 1499,
    badge: "",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=650&q=80"
  }
];

const $ = (selector) => document.querySelector(selector);

const productGrid = $("#productGrid");
const cartDrawer = $("#cartDrawer");
const overlay = $("#overlay");
const cartItems = $("#cartItems");
const toast = $("#toast");

let activeCategory = "All";
let searchQuery = "";
let toastTimeout;

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

// Restore the shopping cart from local storage.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("nova-cart") || "[]");

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(item =>
        products.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99
      )
      .map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
  } catch {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem("nova-cart", JSON.stringify(cart));
  } catch {
    // The cart still works during this page session.
  }
}

function getProduct(id) {
  return products.find(product => product.id === id);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

// Display products according to category and search.
function renderProducts() {
  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  $("#resultMessage").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`;

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try a different search or category.</p>
      </div>`;
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        />
        ${product.badge
          ? `<span class="product-badge">${product.badge}</span>`
          : ""}
        <button
          class="add-btn"
          data-add="${product.id}"
          aria-label="Add ${product.name} to cart"
        >+ Add to bag</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)}</p>
      </div>
    </article>
  `).join("");
}

// Filter buttons and category cards.
function setCategory(category) {
  activeCategory = category;
  searchQuery = "";
  $("#searchInput").value = "";

  document.querySelectorAll(".filter-btn").forEach(button => {
    const isActive = button.dataset.category === category;
    button.classList.toggle("active", isActive);
  });

  renderProducts();
}

$("#filterBar").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  setCategory(button.dataset.category);
  $("#products").scrollIntoView({ behavior: "smooth" });
});

$("#showAll").addEventListener("click", event => {
  event.preventDefault();
  setCategory("All");
});

$("#searchForm").addEventListener("submit", event => {
  event.preventDefault();

  searchQuery = $("#searchInput").value.trim();
  activeCategory = "All";

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  renderProducts();
  $("#products").scrollIntoView({ behavior: "smooth" });
});

// Add products to the cart.
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  addToCart(Number(button.dataset.add));
});

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    if (existingItem.quantity >= 99) {
      showToast("Maximum quantity reached.");
      return;
    }
    existingItem.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to your bag.`);
}

function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== id);
  } else if (item.quantity > 99) {
    item.quantity = 99;
    showToast("Maximum quantity reached.");
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  showToast("Item removed from your bag.");
}

// Render shopping cart and totals.
function renderCart() {
  const count = getCartCount();
  const total = getCartTotal();

  $("#cartCount").textContent = count;
  $("#drawerCount").textContent = `(${count})`;
  $("#cartSubtotal").textContent = formatPrice(total);
  $("#checkoutTotal").textContent = formatPrice(total);

  $("#checkoutBtn").disabled = count === 0;
  $("#checkoutBtn").style.opacity = count === 0 ? "0.5" : "1";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-state">
        <h3>Your bag is taking a break.</h3>
        <p>Find something you'll love and add it here.</p>
      </div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    if (!product) return "";

    return `
      <article class="cart-item">
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <h3>${product.name}</h3>
          <p class="item-price">${formatPrice(product.price)}</p>
          <div class="quantity-control">
            <button data-decrease="${product.id}"
              aria-label="Decrease ${product.name} quantity">−</button>
            <span>${item.quantity}</span>
            <button data-increase="${product.id}"
              aria-label="Increase ${product.name} quantity"
              ${item.quantity >= 99 ? "disabled" : ""}>+</button>
          </div>
        </div>
        <button class="remove-btn" data-remove="${product.id}">
          Remove
        </button>
      </article>
    `;
  }).join("");
}

cartItems.addEventListener("click", event => {
  const decrease = event.target.closest("[data-decrease]");
  const increase = event.target.closest("[data-increase]");
  const remove = event.target.closest("[data-remove]");

  if (decrease) updateQuantity(Number(decrease.dataset.decrease), -1);
  if (increase) updateQuantity(Number(increase.dataset.increase), 1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

// Open and close the cart drawer.
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("visible");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  $("#closeCart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("visible");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  $("#cartBtn").focus();
}

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// Mobile navigation.
$("#menuBtn").addEventListener("click", () => {
  const nav = $("#nav");
  const isOpen = nav.classList.toggle("open");

  $("#menuBtn").setAttribute("aria-expanded", String(isOpen));
  $("#menuBtn").textContent = isOpen ? "✕" : "☰";
});

$("#nav").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#nav").classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
    $("#menuBtn").textContent = "☰";
  }
});

// Small feedback message.
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

// Demo newsletter form. No emails are actually collected.
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#emailInput").value.trim();

  if (!email) return;

  $("#newsletterMessage").textContent =
    "Thanks for your interest! This demo does not send emails.";
  event.target.reset();
});

// Checkout dialog.
const checkoutDialog = $("#checkoutDialog");

$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return;

  closeCart();
  checkoutDialog.showModal();
  $("#customerName").focus();
});

$("#closeCheckout").addEventListener("click", () => {
  checkoutDialog.close();
});

checkoutDialog.addEventListener("click", event => {
  if (event.target === checkoutDialog) {
    checkoutDialog.close();
  }
});

// This simulates an order. It does not process payment or create
// a real order on a server.
$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    $("#checkoutMessage").textContent = "Your cart is empty.";
    return;
  }

  const name = $("#customerName").value.trim();

  if (!name) return;

  const orderTotal = getCartTotal();
  const orderNumber = "NOVA-" +
    Date.now().toString().slice(-7);

  $("#checkoutMessage").textContent =
    `Thank you, ${name}! Demo order ${orderNumber} was completed. ` +
    `Total: ${formatPrice(orderTotal)}. No payment was collected.`;

  cart = [];
  saveCart();
  renderCart();
  event.target.reset();

  showToast("Demo order completed!");
});

// Escape closes the drawer as well as the checkout dialog.
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

// Initialize the storefront.
renderProducts();
renderCart();