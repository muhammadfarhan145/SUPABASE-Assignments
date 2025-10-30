const supabaseClient = supabase.createClient(
  "https://mxtaxdtuotqlxqnmeamg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);

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
                const cartItemDeleteErrorModal = new bootstrap.Modal(document.getElementById("cartItemDeleteErrorModal"));
                cartItemDeleteErrorModal.show();
                console.error(error);
            } else {
                const cartItemAddedToast = document.getElementById("cartItemDeletedToast");
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(cartItemAddedToast);
                toastBootstrap.show();
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

const loadNewArrivals = async () => {
    const { data: products, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);

        if (error) {
            console.error(error.message);
            const errorModal = new bootstrap.Modal(document.getElementById("ErrorModal"));
            errorModal.show();
            return;
        }

        const productCardDiv = document.querySelector(".newArrivalsProductCardDiv");
        productCardDiv.innerHTML = products.length === 0 
            ? '<p class="text-center text-muted">No new arrivals yet.</p>'
            : '';

        products.forEach((product) => {
        productCardDiv.innerHTML += `
            <div class="newArrivalsProductCard">
                <img src="${product.image_url}" alt="${product.title}">
                <div class="productCard_content">
                    <p class="productCard_content_title">${product.title}</p>
                    <p class="productCard_content_price">$${product.price}</p>
                    <div class="newArrivalsProductCardBtns">
                        <a href="../../Products/product.html?id=${product.id}" class="ViewProductBtn">View Product</a>
                        <button class="newArrivalsGridCartBtn addToCartBtn" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
            `;
        });

        const cartButtons = document.querySelectorAll(".addToCartBtn");
        cartButtons.forEach((button) => {
            button.addEventListener("click", async (e) => {
            const productId = e.currentTarget.dataset.id;
            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                const signInFirstModal = new bootstrap.Modal(document.getElementById("signInFristModal"));
                signInFirstModal.show();
                return;
            }

            const { data: product, error } = await supabaseClient
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();

            if (error) {
                console.error(error.message);
                const errorModal = new bootstrap.Modal(document.getElementById("ErrorModal"));
                errorModal.show();
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
                const productAddedErrorModal = new bootstrap.Modal(document.getElementById("productAddedErrorModal"));
                productAddedErrorModal.show();
            } else {
                const cartItemAddedToast = document.getElementById("cartItemAddedToast");
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(cartItemAddedToast);
                toastBootstrap.show();
            }
        });
    });
};


loadNewArrivals();
offCanvasCards();
subscribeToCartChanges();