const supabaseClient = supabase.createClient(
  "https://mxtaxdtuotqlxqnmeamg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);

// DOM Elements
const productAddedModal = () => {
  const modal = new bootstrap.Modal(document.getElementById("productAddedModal"));
  modal.show();
};

const productAddedErrorModal = () => {
  const modal = new bootstrap.Modal(document.getElementById("productAddedErrorModal"));
  modal.show();
};

const signInFirstModal = () => {
  const modal = new bootstrap.Modal(document.getElementById("signInFristModal"));
  modal.show();
};

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const showDetails = async () => {
  const { data: product, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error) {
    console.error(error.message);
    document.getElementById("CenterDiv").innerHTML = '<p class="text-center text-muted">Failed to load product details. Please try again later.</p>';
    return;
  }

  const CenterDiv = document.getElementById("CenterDiv");
  CenterDiv.innerHTML = `
    <img src="${product.image_url}" class="ProductImg" id="ProductImg" alt="${product.title}">
    <div class="productDetailsDiv">
      <h1 class="Product-Title" id="Product-Title">${product.title}</h1>
      <p class="Product-Price" id="Product-Price">$${product.price}</p>
      <p class="Product-Description" id="Product-Description">${product.description}</p>
      <button class="add2cartBtn addToCartBtn" id="add2cartBtn" data-id="${product.id}">Add to Cart</button>
      <p class="Product-Category_P">Category: <span class="Product-Category" id="Product-Category">${product.category}</span></p>
      <div class="SocialIcons">
        <a href="#"><i class="fa-brands fa-facebook fa-lg"></i></a>
        <a href="https://www.linkedin.com/in/muhammad-farhan-000b1438a/"><i class="fa-brands fa-linkedin fa-lg"></i></a>
        <a href="https://github.com/muhammadfarhan145"><i class="fa-brands fa-github fa-lg"></i></a>
        <a href="#><i class="fa-brands fa-whatsapp fa-lg"></i></a>
      </div>
    </div>
  `;

  Add2CartBtns();
};

const Add2CartBtns = async () => {
  const cartButtons = document.querySelectorAll(".addToCartBtn");
  cartButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const productId = e.currentTarget.dataset.id;
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        signInFirstModal();
        return;
      }

      const { data: product, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error(error.message);
        return;
      }

      const { error: insertError } = await supabaseClient.from("cart").insert([
        {
          user_id: user.id,
          product_id: product.id,
          title: product.title,
          price: product.price,
          img_url: product.image_url,
        },
      ]);

      if (insertError) {
        console.error(insertError.message);
        productAddedErrorModal();
      } else {
        const cartItemAddedToast = document.getElementById("cartItemAddedToast");
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(cartItemAddedToast);
        toastBootstrap.show();
      }
    });
  });
};

const offCanvasCards = async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  const offCanvasCardsDiv = document.getElementById("offcanvas-body");
  offCanvasCardsDiv.innerHTML = "";

  if (!user) {
    offCanvasCardsDiv.innerHTML = `
      <p class="text-center text-muted mt-3">Please sign in to view your cart.</p>
    `;
    return;
  }

  const { data: cartItems, error } = await supabaseClient
    .from("cart")
    .select(`id, price, img_url, title`)
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);
    offCanvasCardsDiv.innerHTML = `
      <p class="text-center text-muted mt-3">Failed to load cart items. Please try again.</p>
    `;
    return;
  }

  if (!cartItems || cartItems.length === 0) {
    offCanvasCardsDiv.innerHTML = `
      <p class="text-center text-muted mt-3">Your cart is empty</p>
    `;
    return;
  }

  cartItems.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("cartProductCard");
    card.innerHTML = `
      <div class="cartProduct-img-title-icon">
        <img src="${item.img_url}" class="cartProductsImg" alt="${item.title}">
        <div class="cartProduct-TitleandIcon">
          <p class="cartProductTitle">${item.title}</p>
          <i class="fa-solid fa-trash cartItemDeleteIcon" data-id="${item.id}"></i>
        </div>
      </div>    
      <div class="cartProductPriceDiv">
        <p class="cartProductPrice">$${item.price}</p>
      </div>
      <div class="carttotalItemsPrice">
        <p>Sub Total</p>
        <p>$${item.price}</p>
      </div>
    `;
    offCanvasCardsDiv.appendChild(card);

    const deleteIcon = card.querySelector(".cartItemDeleteIcon");
    deleteIcon.addEventListener("click", async () => {
      const { error } = await supabaseClient
        .from("cart")
        .delete()
        .eq("id", item.id);

      if (error) {
        const cartItemDeleteErrorModal = new bootstrap.Modal(document.getElementById("cartItemDeleteErrorModal"));
        cartItemDeleteErrorModal.show();
        console.error(error);
      } else {
        const cartItemDeletedToast = document.getElementById("cartItemDeletedToast");
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(cartItemDeletedToast);
        toastBootstrap.show();
        offCanvasCards();
      }
    });
  });
};

const subscribeToCartChanges = async () => {
  const channel = supabaseClient
    .channel('cart-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cart' },
      () => {
        offCanvasCards();
      }
    )
    .subscribe();
};

  showDetails();
  offCanvasCards();
  subscribeToCartChanges();
