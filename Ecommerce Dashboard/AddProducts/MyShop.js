// Supabase Client
const supabaseClient = supabase.createClient(
  "https://mxtaxdtuotqlxqnmeamg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);

const signOutModal = () => {
  const SignOutModal = new bootstrap.Modal(
    document.getElementById("signOutModal")
  );
  SignOutModal.show();
};

let uploadedImageURL = "";

// Cloudinary Widget

  const myWidget = cloudinary.createUploadWidget(
    {
      cloudName: "diolghne7",
      uploadPreset: "product_upload",
      cropping: true,
    },(error, result) => {
      if (!error && result && result.event === "success") {
        console.log("Product Image is uploaded:", result.info);
         uploadedImageURL = result.info.secure_url;
      }
    }
  );
  document.getElementById("upload_widget").addEventListener("click", () => {
    myWidget.open()
});

  const UploadProductBtn = document.getElementById("UploadProductBtn")
  UploadProductBtn.addEventListener("click", async () => {
    const { data, error } = await supabaseClient.auth.getUser();
      const user = data?.user;
    if(!user){
      alert("Sign In First");
      console.error(error.message);
      return;
    }

    if (!uploadedImageURL) {
      return alert("Please upload an image first!");
    } 

    const product = {
      user_id: user.id,
      title: document.getElementById("product_name").value,
      category: document.getElementById("category_dropdown").value,
      price: parseFloat(document.getElementById("product_price").value),
      description: document.getElementById("product_description").value,
      image_url: uploadedImageURL
    };

    const { error: insertError } = await supabaseClient
    .from("products")
    .insert([product]);
    if(insertError) {
      return console.error(insertError);
    }

    alert("Product Added Successully!")
    document.getElementById("product_name").value = "";
    document.getElementById("product_price").value = "";
    document.getElementById("category_dropdown").value = "Jackets";
    document.getElementById("product_description").value = "";
    uploadedImageURL = "";

    loadUserProducts();
  });

    
async function loadUserProducts() {

    const { data, error } = await supabaseClient.auth.getUser();
    const user = data?.user;
    if (!user) return;

    const { data: products} = await supabaseClient
    .from("products")
    .select("*")
    .eq("user_id", user.id);

    const userProductCards = document.getElementById("userProducts");
    userProductCards.innerHTML = products.length ? "" : `<p style="text-align: center;">No Products Yet</p>`;
    
    products?.forEach((prod) => {
      const card = document.createElement("div");
      card.classList.add("card", "mb-3");
      card.innerHTML = `
        <img src="${prod.image_url}" class="card-img-top" alt="${prod.title}" style="height:200px; object-fit:cover; border-top-left-radius:8px; border-top-right-radius:8px;">
        <div class="card-body">
          <h5 class="card-title">${prod.title}</h5>
          <p class="card-text text-muted">${prod.category}</p>
          <p class="card-text fw-bold">$${prod.price}</p>
        </div>
      `;
      userProductCards.appendChild(card);
    });
  };

loadUserProducts();
signOutBtn.addEventListener("click", async () => {
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
});