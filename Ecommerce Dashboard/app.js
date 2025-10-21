const supabaseClient = supabase.createClient(
  "https://mxtaxdtuotqlxqnmeamg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);

// DOM Elements

const addProductIcon = document.getElementById("HomePageButtons_addAccountBtn");





// Ask SignUp Modal 

const productAddedModal = () => {
  const productAddedModal = new bootstrap.Modal(
    document.getElementById("productAddedModal")
  );
  productAddedModal.show();
};


const Add2CartBtns = async () => {

    const cartButton = document.querySelectorAll(".addToCartBtn");
    cartButton.forEach(button => {
        button.addEventListener("click", async (e) => {
            const productId = e.currentTarget.dataset.id;

            const { data: { user } } = await supabaseClient.auth.getUser();
            if (!user) {
                alert("Please sign in to add items to cart!");
                return;
            }

            const { data: product, error} = await supabaseClient
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

            if(error) {
                console.error(error.message);
            }

            const { error: insertError } = await supabaseClient
            .from("cart")
            .insert([
            {
                user_id: user.id,
                product_id: product.id,
                price: product.price,
                img_url: product.image_url,
            }
            ]);

            if (insertError) {
                console.error(insertError.message);
                alert("error ha bhaee")
            } else {
                productAddedModal();
            }
        })
    });
};

const restrictCart = async () => {
    const { data } = await supabaseClient.auth.getUser();
    const cartBtn = document.getElementById("HomePageButtons_CartBtn");

    if (!data.user) {
        cartBtn.disabled = true;
        cartBtn.onclick = () => alert("Sign Up First");
    }
};

const loadProducts = async () => {
    const { data: products, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

    if(error) {
        console.error(error.message);
        return;
    };

    const productCard = document.querySelector(".CenterProductCardDiv");
    productCard.innerHTML = "";

    products.forEach(product => {
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
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        alert("Please Sign Up First to add Products");
        addProductIcon.disabled = true;
        return;
    } else {
        window.location.href = "./AddProducts/MyShop.html";
    }

}


loadProducts();
restrictCart();
addProductIcon.addEventListener("click", addProductBtn);