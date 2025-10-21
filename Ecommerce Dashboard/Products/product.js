const supabaseClient = supabase.createClient("https://mxtaxdtuotqlxqnmeamg.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);


const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const showDetails = async () => {
    const { data: product, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

if(error){
    console.error(error.message)
} else {
    // product info inject kar do
    document.getElementById("detailImg").src = product.image_url;
    document.getElementById("detailName").textContent = product.name;
    document.getElementById("detailPrice").textContent = "$" + product.price;
    document.getElementById("detailDesc").textContent = product.description;
}
}

showDetails();