const supabaseClient = supabase.createClient(
  "https://mxtaxdtuotqlxqnmeamg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);

// DOM Elements
const addProductIcon = document.getElementById("HomePageButtons_addAccountBtn");
const dashboardLink = document.getElementById("homeNavDashboardLink");
const signOutBtn = document.getElementById("signOutBtn");
const cartBtn = document.querySelectorAll(".HomePageButtons_CartBtn");

// Modals & Toasts

const signOutModal = () => {
  const SignOutModal = new bootstrap.Modal(
    document.getElementById("signOutModal")
  );
  SignOutModal.show();
};

const signInFirstModal = () => {
  const signInFirstModal = new bootstrap.Modal(
    document.getElementById("signInFristModal")
  );
  signInFirstModal.show();
};

const errorModal = () => {
  const errorModal = new bootstrap.Modal(
    document.getElementById("errorModal")
  );
  errorModal.show();
};

const cartItemDeletedToast = () => {
  const cartItemDeletedToast = document.getElementById("cartItemDeletedToast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(cartItemDeletedToast);
  toastBootstrap.show();
};


const cartItemAddedToast = () => {
  const cartItemAddedToast = document.getElementById("cartItemAddedToast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(cartItemAddedToast);
  toastBootstrap.show();
};

const productAddedErrorModal = () => {
  const productAddedErrorModal = new bootstrap.Modal(
    document.getElementById("productAddedErrorModal")
  );
  productAddedErrorModal.show();
};

const allowToDashboard = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    signInFirstModal();
    dashboardLink.style.pointerEvents = "none";
    return;
  } else {
    window.location.href = "./AddProducts/MyShop.html";
  }
};

const Add2CartBtns = async () => {
  const cartButton = document.querySelectorAll(".addToCartBtn");
  cartButton.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const productId = e.currentTarget.dataset.id;

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
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
          errorModal();
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

      cartItemAddedToast();

      if (insertError) {
        console.error(insertError.message);
        productAddedErrorModal();
      }
    });
  });
};

const loadProducts = async () => {
  const { data: products, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    console.error(error.message);
    return;
  }

  const productCard = document.querySelector(".CenterProductCardDiv");
  productCard.innerHTML = "";

  products.forEach((product) => {
    productCard.innerHTML += `
        <div class="CenterProductCard">
            <img src="${product.image_url}">
            <div class="productCard_content">
                <p class="productCard_content_title">${product.title}</p>
                <p class="productCard_content_price">$${product.price}</p>
                <div class="CenterProductCardBtns">
                <a href="./Products/product.html?id=${product.id}" class="ViewProductBtn">View Product</a>
                <button class="centerGridcartbtn addToCartBtn" data-id="${product.id}">Add to cart</button>
                </div>
            </div>
        </div>
        `;
  });
  Add2CartBtns();
};

const addProductBtn = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    signInFirstModal();
    return;
  } else {
    window.location.href = "/AddProducts/MyShop.html";
  }
};

const offCanvasCards = async () => {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  if (!user) {
    document.querySelector(".cartProductCards").innerHTML = `
      <p class="text-center text-muted mt-3">Please sign in to view your cart.</p>
    `;
    return;
  }

  const { data: cartItems, error } = await supabaseClient
    .from("cart")
    .select(`id,price,img_url,products(title)`)
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);
    return;
  }

  const offCanvasCardsDiv = document.getElementById("offcanvas-body");
  offCanvasCardsDiv.innerHTML = "";

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
                <img src="${item.img_url}" class="cartProductsImg">
                <div class="cartProduct-TitleandIcon">
                    <p class="cartProductTitle">${item.products?.title}</p>
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

        const deleteIcon = card.querySelector(".cartItemDeleteIcon");
        deleteIcon.addEventListener("click", async () => {
            const { error } = await supabaseClient
            .from("cart")
            .delete()
            .eq("id", item.id)

            if (error) {
                cartItemDeleteErrorModal();
                console.error(error);
            } else {
                cartItemDeletedToast();
                offCanvasCards();
            }
        });

    offCanvasCardsDiv.appendChild(card);
  });
  console.log("Cart Items Loaded:", cartItems);
};


const subscribeToCartChanges = async () => {
  const channel = supabaseClient
    .channel('cart-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cart' },
      (payload) => {
        console.log('Realtime Change:', payload);
        offCanvasCards();
      }
    )
    .subscribe();
};

const signOutUser = async () => {
  const confirmSignOutUser = confirm("Are you sure you want to sign out?");
  if (!confirmSignOutUser) return;

  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error(error.message);
    errorModal();
    return;
  }

  signOutModal();
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
};

loadProducts();
offCanvasCards();
addProductIcon.addEventListener("click", addProductBtn);
dashboardLink.addEventListener("click", allowToDashboard);
signOutBtn.addEventListener("click", signOutUser);
subscribeToCartChanges();
