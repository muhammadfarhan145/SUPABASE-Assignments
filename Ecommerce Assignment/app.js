const supabaseClient = supabase.createClient(
  "https://mkuvrvijlxluembvduld.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdXZydmlqbHhsdWVtYnZkdWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODU2NzIsImV4cCI6MjA3NDQ2MTY3Mn0.4ic4pz1jkldt7ifyiKeksAgyYuP6pYk6ONMsGviarIY"
);

const product_card = document.getElementById("Product_card");
const cart_counter = document.getElementById("cart_counter");
const shopbtn = document.getElementById("shopnow_button");
const search_input = document.getElementById("Search_bar");
const Tabs = document.getElementById("filters");
const innerCard = document.getElementById("innercard_div");
const inner_card_img = document.getElementById("inner_card_img");
const product_title = document.getElementById("Product_title");
const product_category = document.getElementById("Product_category");
const product_description = document.getElementById("Product_description");
const product_price = document.getElementById("modalPrice");
const add2cart_btn = document.getElementById("AddCart_btn");
const close_card_btn = document.getElementById("closeinnercard_btn");
const signup_btn = document.getElementById("Signup_btn");

// Start with
let cart_item = 0;
let active_tab = "all";
let allProducts = [];

//  PRice Formatter
function formatprice(p) {
  return "$" + Number(p).toFixed(2);
}

function capital1letter(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function antiregex(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
}

async function loadCard() {
  const { data, error } = await supabaseClient
    .from("Ecommerce_Products")
    .select("*");
  if (error) {
    console.error(error);
    return;
  }
  allProducts = data;
  showProducts(allProducts);
}

// Cart
function add2cartbtnHandler() {
  cart_item++;
  cart_counter.textContent = cart_item;
  add2cart_btn.textContent = "Added ✓";
  setTimeout(() => (add2cart_btn.textContent = "Add to cart"), 900);
}

// Shop Now Scroll
shopbtn.addEventListener("click", () => {
  window.scrollBy({ top: 340, behavior: "smooth" });
});

// Show Products
function showProducts(products, filtertext = "") {
  product_card.innerHTML = "";
  const q = filtertext.trim().toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCat = active_tab === "all" || p.category === active_tab;
    const matchesText =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.Desc.toLowerCase().includes(q);
    return matchesCat && matchesText;
  });

  if (filtered.length === 0) {
    product_card.innerHTML = `<div style="width:100%; padding:40px; text-align:center; color:#6b7280">
         No Product Found
       </div>`;
    return;
  }

  filtered.forEach((prod) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img loading="lazy" src="${prod.img}" alt="${antiregex(prod.title)}" />
      <div class="title">${capital1letter(prod.title)}</div>
      <div class="category">${antiregex(capital1letter(prod.category))}</div>
      <div class="price">${formatprice(prod.price)}</div>
      <div class="card_add2cart_btn">Add To Cart</div>
    `;
    card.addEventListener("click", () => openinnercard(prod));
    product_card.appendChild(card);
  });
}

// Inner Card
let currentProduct = null;

function openinnercard(prod) {
  currentProduct = prod;
  inner_card_img.src = prod.img;
  product_title.textContent = prod.title;
  product_description.textContent = prod.Desc;
  product_price.textContent = formatprice(prod.price);
  product_category.textContent = capital1letter(prod.category);

  innerCard.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeInnerCard() {
  innerCard.classList.remove("open");
  document.body.style.overflow = "";
  currentProduct = null;
}

function SignupAlert() {
  alert("Coming Soon");
}

// Events
close_card_btn.addEventListener("click", closeInnerCard);
add2cart_btn.addEventListener("click", add2cartbtnHandler);
signup_btn.addEventListener("click", SignupAlert);
innerCard.addEventListener("click", (e) => {
  if (e.target === innerCard) closeInnerCard();
});

Tabs.addEventListener("click", (e) => {
  const tab = e.target.closest(".tabs");
  if (!tab) return;
  Array.from(Tabs.querySelectorAll(".tabs")).forEach((c) =>
    c.classList.remove("active")
  );
  tab.classList.add("active");
  active_tab = tab.dataset.product || "all";
  showProducts(allProducts, search_input.value);
});

search_input.addEventListener("input", (e) =>
  showProducts(allProducts, e.target.value)
);

loadCard();
