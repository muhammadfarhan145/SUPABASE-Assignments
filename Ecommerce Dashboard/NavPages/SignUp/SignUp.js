const supabaseClient = supabase.createClient(
  "https://mxtaxdtuotqlxqnmeamg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dGF4ZHR1b3RxbHhxbm1lYW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MTUzMjgsImV4cCI6MjA3NjI5MTMyOH0.Rg4ETVXKEfSKaSi5PhvudbjGTk3s5E5gWFnne71yOcA"
);

const userEmailInput = document.getElementById("SignUp_emailInput");
const userPasswordInput = document.getElementById("SignUp_PasswordInput");
const Next_btn = document.getElementById("Next_btn");
const signUpEmailSec = document.getElementById("SignUp_emailSection");
const signUpPassword = document.getElementById("SignUp_passwordSection");

const fieldErrorModal = () => {
  const fieldsErrorModal = new bootstrap.Modal(
    document.getElementById("fielderrorModal")
  );
  fieldsErrorModal.show();
};

const passLenghtModal = () => {
  const passwordErrorModal = new bootstrap.Modal(
    document.getElementById("passworderrorModal")
  );
  passwordErrorModal.show();
};

const showErrors = () => {
  const loadBtn = document.createElement("button");
  loadBtn.className = "btn btn-primary text-secondary Next_btn";
  loadBtn.type = "button";
  loadBtn.innerHTML = `
  <span style="display:inline-flex;align-items:center;gap:8px;">
  <span class="spinner-border spinner-border-sm button" role="status" aria-hidden="true"></span>
  <span role="status">Loading...</span>
  </span>
  `;
  Next_btn.replaceWith(loadBtn);

  setTimeout(() => {
    loadBtn.replaceWith(Next_btn);
  }, 900);

  const email = userEmailInput.value.trim();
  const password = userPasswordInput.value.trim();

  if (!email || !password) {
    fieldErrorModal();
    return;
  }

  if (password.length < 6) {
    passLenghtModal();
    return;
  }

  signUpEmailSec.innerHTML = `
    <input type="text" class="Name_FNameSection" id ="Name_FNameSection" placeholder="Enter Your First Name" required />
  `;

  signUpPassword.innerHTML = `
    <input type="text" class="Name_LNameSection" id ="Name_LNameSection" placeholder="Enter Your Last Name" required />
  `;

  Next_btn.textContent = "Sign Up";

  Next_btn.removeEventListener("click", showErrors);
  Next_btn.addEventListener("click", registerUser);
};

async function registerUser() {
  const FName = document.getElementById("Name_FNameSection").value.trim();
  const LName = document.getElementById("Name_LNameSection").value.trim();
  const email = userEmailInput.value.trim();
  const password = userPasswordInput.value.trim();

  if (!FName || !LName) {
    fieldErrorModal();
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: FName,
        last_name: LName,
      },
    },
  });

  if (error) {
    console.error(error.message);
  } else {
    window.location.href = "../SignIn/SignIn.html";
  }
}

Next_btn.addEventListener("click", showErrors);